export interface Job {
  name: string;
  schedule: string;
  scheduleType: "cron" | "interval" | "once";
  prompt: string;
  status: "active" | "disabled" | "archived";
  always: boolean;
  stateless: boolean;
  agent?: string | null;
  employee?: string | null;
  model?: string | null;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  room: string;
  createdAt: string;
  updatedAt: string;
  summary?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: number;
  sessionId: string;
  room: string;
  sender: string;
  content: string;
  isFromAgent: boolean;
  deliveryStatus: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActiveEngine {
  room: string;
  channel: string;
  startedAt: string;
  lastPing: string;
}

export interface Backup {
  filename: string;
  size: string;
  createdAt: string;
}

export interface ChannelConfig {
  enabled: boolean;
  default: string;
  telegram: {
    enabled: boolean;
    botToken?: string | null;
    chatId?: number | null;
    open: boolean;
  };
  slack: {
    enabled: boolean;
    botToken?: string | null;
    appToken?: string | null;
    dmUserId?: string | null;
    botUserId?: string | null;
    botName?: string | null;
    workspace?: string | null;
    workspaceId?: string | null;
    workspaceUrl?: string | null;
  };
  twilio: {
    sid?: string | null;
    secret?: string | null;
    authToken?: string | null;
    ownerNumber?: string | null;
    allowlist: string[];
    publicBaseUrl?: string | null;
    port: number;
  };
  sms: {
    enabled: boolean;
    fromNumber?: string | null;
  };
  whatsapp: {
    enabled: boolean;
    fromNumber: string;
  };
  phone: {
    enabled: boolean;
    fromNumber?: string | null;
    openaiApiKey?: string | null;
    realtimeModel: string;
    voice: string;
    sttLanguage: string;
    speechTimeout: string;
  };
}
