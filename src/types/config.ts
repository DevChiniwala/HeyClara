import { z } from "zod";
import type { BackendName } from "./enums";

const backendSchema = z.enum(["claude", "codex", "gemini"]);

const telegramSchema = z.object({
  enabled: z.boolean().default(true),
  bot_token: z.string().nullable().default(null),
  chat_id: z.number().nullable().default(null),
  open: z.boolean().default(false),
});

const slackWatchChannelSchema = z.object({
  behavior: z.string().optional(),
  enabled: z.boolean().default(true),
});

const slackSchema = z.object({
  enabled: z.boolean().default(true),
  bot_token: z.string().nullable().default(null),
  app_token: z.string().nullable().default(null),
  dm_user_id: z.string().nullable().default(null),
  bot_user_id: z.string().nullable().default(null),
  bot_name: z.string().nullable().default(null),
  workspace: z.string().nullable().default(null),
  workspace_id: z.string().nullable().default(null),
  workspace_url: z.string().nullable().default(null),
  watch: z.record(slackWatchChannelSchema).nullable().default(null),
});

const twilioSchema = z.object({
  sid: z.string().nullable().default(null),
  secret: z.string().nullable().default(null),
  auth_token: z.string().nullable().default(null),
  owner_number: z.string().nullable().default(null),
  allowlist: z.array(z.string()).default([]),
  public_base_url: z.string().nullable().default(null),
  port: z.number().default(7079),
});

const phoneSchema = z.object({
  enabled: z.boolean().default(true),
  from_number: z.string().nullable().default(null),
  openai_api_key: z.string().nullable().default(null),
  realtime_model: z.string().default("gpt-realtime"),
  voice: z.string().default("marin"),
  stt_language: z.string().default("en-US"),
  speech_timeout: z.string().default("auto"),
});

const smsSchema = z.object({
  enabled: z.boolean().default(true),
  from_number: z.string().nullable().default(null),
});

const whatsappSchema = z.object({
  enabled: z.boolean().default(true),
  from_number: z.string().default("+14155238886"),
});

const activeHoursSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM format").default("00:00"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM format").default("23:59"),
});

const sessionFinalizationSchema = z.object({
  enabled: z.boolean().default(true),
  memoryConsolidation: z.boolean().default(true),
  summaries: z.boolean().default(true),
});

const channelsSchema = z.object({
  enabled: z.boolean().default(true),
  default: z.string().default("telegram"),
  telegram: telegramSchema.default({ enabled: true, bot_token: null, chat_id: null, open: false }),
  slack: slackSchema.default({ enabled: true, bot_token: null, app_token: null, dm_user_id: null, bot_user_id: null, bot_name: null, workspace: null, workspace_id: null, workspace_url: null, watch: null }),
  twilio: twilioSchema.default({ sid: null, secret: null, auth_token: null, owner_number: null, allowlist: [], public_base_url: null, port: 7079 }),
  phone: phoneSchema.default({ enabled: true, from_number: null, openai_api_key: null, realtime_model: "gpt-realtime", voice: "marin", stt_language: "en-US", speech_timeout: "auto" }),
  sms: smsSchema.default({ enabled: true, from_number: null }),
  whatsapp: whatsappSchema.default({ enabled: true, from_number: "+14155238886" }),
});

export const configSchema = z.object({
  model: z.string().default("default"),
  runner: backendSchema.default("claude"),
  fallback: z.array(backendSchema).default([]),
  timezone: z.string().default("UTC"),
  activeHours: activeHoursSchema.default({ start: "00:00", end: "23:59" }),
  database_url: z.string().default("postgres://localhost:5432/clara"),
  log_level: z.string().default("info"),
  gemini_api_key: z.string().nullable().default(null),
  sessionFinalization: sessionFinalizationSchema.default({ enabled: true, memoryConsolidation: true, summaries: true }),
  channels: channelsSchema.default({ enabled: true, default: "telegram", telegram: { enabled: true, bot_token: null, chat_id: null, open: false }, slack: { enabled: true, bot_token: null, app_token: null, dm_user_id: null, bot_user_id: null, bot_name: null, workspace: null, workspace_id: null, workspace_url: null, watch: null }, twilio: { sid: null, secret: null, auth_token: null, owner_number: null, allowlist: [], public_base_url: null, port: 7079 }, phone: { enabled: true, from_number: null, openai_api_key: null, realtime_model: "gpt-realtime", voice: "marin", stt_language: "en-US", speech_timeout: "auto" }, sms: { enabled: true, from_number: null }, whatsapp: { enabled: true, from_number: "+14155238886" } }),
});

export type ClaraConfig = z.infer<typeof configSchema>;
export interface TelegramConfig extends z.infer<typeof telegramSchema> {}
export interface SlackConfig extends z.infer<typeof slackSchema> {}
export interface SlackWatchChannel extends z.infer<typeof slackWatchChannelSchema> {}
export interface TwilioConfig extends z.infer<typeof twilioSchema> {}
export interface PhoneConfig extends z.infer<typeof phoneSchema> {}
export interface SmsConfig extends z.infer<typeof smsSchema> {}
export interface WhatsappConfig extends z.infer<typeof whatsappSchema> {}
export interface ChannelsConfig extends z.infer<typeof channelsSchema> {}
export interface SessionFinalizationConfig extends z.infer<typeof sessionFinalizationSchema> {}
