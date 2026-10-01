export type AgentName =
  | "content-agent"
  | "seo-agent"
  | "ustaz-agent"
  | "moderation-agent"
  | "matching-agent"
  | "tajweed-agent"
  | "teacher-assistant-agent"
  | "scheduling-agent";

export type TaskType =
  | "generate_daily_dars"
  | "generate_blog"
  | "translate_content"
  | "optimize_seo"
  | "generate_meta"
  | "chat_response"
  | "moderate_video"
  | "moderate_content"
  | "score_match"
  | "suggest_teachers"
  | "analyze_tajweed"
  | "generate_lesson_plan"
  | "generate_quiz"
  | "analyze_student_progress"
  | "suggest_schedule";

export interface AgentTask {
  id: string;
  type: TaskType;
  agent: AgentName;
  input: Record<string, unknown>;
  priority?: "low" | "normal" | "high";
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  taskId: string;
  agent: AgentName;
  status: "success" | "error";
  output: Record<string, unknown>;
  tokensUsed: number;
  durationMs: number;
  error?: string;
}

export interface SkillDefinition {
  name: AgentName;
  purpose: string;
  capabilities: string[];
  taskTypes: TaskType[];
}

export interface OrchestratorRequest {
  taskType: TaskType;
  input: Record<string, unknown>;
  priority?: "low" | "normal" | "high";
}
