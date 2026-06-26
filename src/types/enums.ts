export type BackendName = "claude" | "codex" | "gemini";

export type ScheduleType = "cron" | "interval" | "once";

export type JobLifecycle = "active" | "disabled" | "archived";

export type JobRunStatus = "ok" | "error" | "aborted";

export type Mode = "chat" | "job";

export type ChannelName = "terminal" | "telegram" | "slack" | "sms" | "whatsapp" | "system";

export type AttachmentType = "image" | "document" | "audio" | "video";

export type DeliveryStatus = "pending" | "sent" | "failed";
