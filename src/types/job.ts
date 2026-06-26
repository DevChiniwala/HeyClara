import type { ScheduleType, JobLifecycle } from "./enums";

export interface JobInput {
  name: string;
  schedule: string;
  prompt: string;
  enabled?: boolean;
  status?: JobLifecycle;
  scheduleType?: ScheduleType;
  always?: boolean;
  stateless?: boolean;
  agent?: string;
  employee?: string;
  model?: string;
}

export interface JobPromptSource {
  source: "db" | "file";
  prompt: string;
  filePath?: string;
}

export interface ResolvedJobPrompt {
  source: "db" | "file";
  prompt: string;
  filePath?: string;
}
