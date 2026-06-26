import type { Attachment } from "../types/attachment";

export interface AgentDef {
  description: string;
  prompt: string;
  model?: string;
}

export interface AgentUsage {
  costUsd?: number;
  tokens?: { input: number; output: number };
  turns?: number;
}

export type AgentEvent =
  | { type: "session"; backendSessionId: string }
  | { type: "text"; delta: string }
  | { type: "thinking"; delta: string }
  | { type: "tool"; name: string; summary?: string }
  | {
      type: "result";
      text: string;
      usage: AgentUsage;
      backendSessionId: string;
      terminalReason?: string;
      metadata?: Record<string, unknown>;
    }
  | { type: "error"; message: string; retryable: boolean; providerDown: boolean; terminalReason?: string };

export function isResultEvent(ev: AgentEvent): ev is Extract<AgentEvent, { type: "result" }> {
  return ev.type === "result";
}

export interface AgentSessionContext {
  room: string;
  channel: string;
  systemPrompt: string;
  cwd: string;
  model?: string;
  mcpServers?: Record<string, unknown>;
  source?: Record<string, unknown>;
  resume: boolean | string;
  subagents?: Record<string, AgentDef>;
  interactive?: boolean;
}

export interface AgentSession {
  readonly backendSessionId: string | null;
  send(text: string, attachments?: Attachment[]): AsyncIterable<AgentEvent>;
  abort(reason: string): void;
  close(): Promise<void>;
}

export interface AgentBackend {
  readonly name: "claude" | "codex" | "gemini";
  openSession(ctx: AgentSessionContext): Promise<AgentSession>;
  canResume(backendSessionId: string, cwd: string): Promise<boolean>;
}

export interface Normalizer {
  consume(message: unknown): AgentEvent[];
}

export interface RunnerOutput {
  agentText: string;
  sessionId: string;
  terminalReason?: string;
  error?: string;
  providerDown?: boolean;
}
