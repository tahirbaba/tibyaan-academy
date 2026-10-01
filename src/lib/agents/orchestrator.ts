import { ContentAgent } from "./content-agent";
import { SeoAgent } from "./seo-agent";
import { UstazAgent } from "./ustaz-agent";
import { ModerationAgent } from "./moderation-agent";
import { MatchingAgent } from "./matching-agent";
import { TajweedAgent } from "./tajweed-agent";
import { TeacherAssistantAgent } from "./teacher-assistant-agent";
import { SchedulingAgent } from "./scheduling-agent";
import type {
  AgentName,
  AgentResult,
  AgentTask,
  OrchestratorRequest,
  TaskType,
} from "./types";
import { BaseAgent } from "./base-agent";

const TASK_ROUTING: Record<TaskType, AgentName> = {
  generate_daily_dars: "content-agent",
  generate_blog: "content-agent",
  translate_content: "content-agent",
  optimize_seo: "seo-agent",
  generate_meta: "seo-agent",
  chat_response: "ustaz-agent",
  moderate_video: "moderation-agent",
  moderate_content: "moderation-agent",
  score_match: "matching-agent",
  suggest_teachers: "matching-agent",
  analyze_tajweed: "tajweed-agent",
  generate_lesson_plan: "teacher-assistant-agent",
  generate_quiz: "teacher-assistant-agent",
  analyze_student_progress: "teacher-assistant-agent",
  suggest_schedule: "scheduling-agent",
};

const agents: Record<AgentName, BaseAgent> = {
  "content-agent": new ContentAgent(),
  "seo-agent": new SeoAgent(),
  "ustaz-agent": new UstazAgent(),
  "moderation-agent": new ModerationAgent(),
  "matching-agent": new MatchingAgent(),
  "tajweed-agent": new TajweedAgent(),
  "teacher-assistant-agent": new TeacherAssistantAgent(),
  "scheduling-agent": new SchedulingAgent(),
};

export async function orchestrate(
  request: OrchestratorRequest
): Promise<AgentResult> {
  const agentName = TASK_ROUTING[request.taskType];
  if (!agentName) {
    throw new Error(`No agent registered for task type: ${request.taskType}`);
  }

  const agent = agents[agentName];
  const task: AgentTask = {
    id: crypto.randomUUID(),
    type: request.taskType,
    agent: agentName,
    input: request.input,
    priority: request.priority ?? "normal",
  };

  return agent.execute(task);
}

export { TASK_ROUTING, agents };
