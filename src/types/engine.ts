import type { Attachment } from "./attachment";
import type { ChannelName } from "./enums";

export interface SendResult {
  result: string;
  costUsd: number;
  turns: number;
  messageId?: number;
  signal?: "provider_down";
}

export type StreamCallback = (text: string) => void;
export type ActivityCallback = (text: string) => void;

export interface SendCallbacks {
  onStream?: StreamCallback;
  onActivity?: ActivityCallback;
}

export interface WatchBehavior {
  channel: string;
  behavior: string;
}

export interface EngineOptions {
  room: string;
  channel: string;
  resume: boolean | string;
  mcpServers?: Record<string, unknown>;
  employee?: string;
  agent?: string;
  job?: string;
  watchBehavior?: WatchBehavior;
}

export interface ChatEngine {
  readonly sessionId: string | null;
  readonly room: string;
  send(userMessage: string, callbacks?: SendCallbacks, attachments?: Attachment[]): Promise<SendResult>;
  close(): Promise<void>;
}

export interface JobResult {
  job: string;
  timestamp: string;
  status: "ok" | "error" | "aborted";
  result: string;
  duration_ms: number;
  session_id?: string;
  terminal_reason?: string;
  error?: string;
}
