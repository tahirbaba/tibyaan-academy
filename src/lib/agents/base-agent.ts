import { getDb } from "@/lib/db";
import { agentLogs } from "@/lib/db/schema";
import { sendFailureAlert } from "@/lib/alerts";
import type { AgentName, AgentResult, AgentTask } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * A durable Claude error — a bad or mis-scoped key, a 4xx that will keep
 * failing until a human changes the configuration — must reach a person on the
 * FIRST occurrence, not the hundredth. For four months the daily dars agent
 * failed every morning with "API key is not scoped to a workspace" and logged
 * it to a table nobody reads; nothing a person would see was produced.
 *
 * Deduplicated per process so a burst of failing requests (every AI Ustaz
 * message with a bad key, say) sends one alert, not one per request. A fresh
 * lambda re-arms it, which is the right cadence: it means "this is still
 * broken" rather than going silent after the first ever alert.
 */
const alertedConfigErrors = new Set<string>();

/** 4xx except 429 means the request itself is wrong — config, not load. */
function isDurableConfigError(message: string): boolean {
  const m = message.match(/Claude API error (\d{3})/);
  if (!m) return message.includes("ANTHROPIC_API_KEY not set");
  const status = Number(m[1]);
  return status >= 400 && status < 500 && status !== 429;
}

async function alertDurableApiError(agent: string, taskType: string, message: string): Promise<void> {
  if (!isDurableConfigError(message)) return;

  // Key the dedupe on the status/shape, not the full body, so the same fault
  // from different agents still collapses to one alert.
  const key = message.match(/Claude API error \d{3}/)?.[0] ?? "ANTHROPIC_API_KEY not set";
  if (alertedConfigErrors.has(key)) return;
  alertedConfigErrors.add(key);

  await sendFailureAlert({
    source: `agent:${agent}`,
    summary: `Claude API is failing with a configuration error (${key})`,
    error: new Error(message),
    context: {
      taskType,
      meaning: "This will keep failing on every call until the key or its scope is fixed.",
    },
  });
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

export abstract class BaseAgent {
  abstract name: AgentName;
  abstract systemPrompt: string;

  protected model = "claude-sonnet-4-5-20250929";
  protected maxTokens = 4096;

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    let tokensUsed = 0;

    try {
      const result = await this.run(task);
      tokensUsed = result.tokensUsed ?? 0;
      const durationMs = Date.now() - startTime;

      await this.log(task, "success", result.output, tokensUsed, durationMs);

      return {
        taskId: task.id,
        agent: this.name,
        status: "success",
        output: result.output,
        tokensUsed,
        durationMs,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

      await this.log(
        task,
        "error",
        {},
        tokensUsed,
        durationMs,
        errorMessage
      );

      // Loud on the first occurrence, for the errors a human must fix.
      await alertDurableApiError(this.name, task.type, errorMessage);

      return {
        taskId: task.id,
        agent: this.name,
        status: "error",
        output: {},
        tokensUsed,
        durationMs,
        error: errorMessage,
      };
    }
  }

  protected abstract run(
    task: AgentTask
  ): Promise<{ output: Record<string, unknown>; tokensUsed?: number }>;

  protected async callClaude(
    messages: ClaudeMessage[],
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<{ text: string; tokensUsed: number }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? this.maxTokens,
        temperature: options?.temperature ?? 0.7,
        system: this.systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ClaudeResponse;
    const text = data.content[0]?.text ?? "";
    const tokensUsed = data.usage.input_tokens + data.usage.output_tokens;

    return { text, tokensUsed };
  }

  protected parseJSON<T>(text: string): T {
    let jsonStr = text;

    // Strategy 1: ```json ... ```
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1];
    } else {
      // Strategy 2: ``` ... ``` (any code block)
      const codeBlockMatch = text.match(/```(?:\w*)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      } else {
        // Strategy 3: find outermost { ... } boundaries
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = text.slice(firstBrace, lastBrace + 1);
        }
      }
    }

    jsonStr = jsonStr.trim();
    // Remove trailing commas before } or ] (common Claude mistake)
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      throw new Error(
        `JSON parse failed: ${e instanceof Error ? e.message : "Unknown error"}. Response snippet: ${text.slice(0, 300)}`
      );
    }
  }

  private async log(
    task: AgentTask,
    status: "success" | "error",
    output: Record<string, unknown>,
    tokensUsed: number,
    durationMs: number,
    errorMessage?: string
  ) {
    try {
      const db = getDb();
      await db.insert(agentLogs).values({
        agentName: this.name,
        taskType: task.type,
        input: task.input,
        output,
        tokensUsed,
        durationMs,
        status,
        errorMessage: errorMessage ?? null,
      });
    } catch {
      console.error(`[${this.name}] Failed to log agent activity`);
    }
  }
}
