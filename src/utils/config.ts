import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import yaml from "js-yaml";
import { getPaths } from "./paths";
import { log } from "./log";
import { configSchema, type ClaraConfig } from "../types/config";

let _config: ClaraConfig | null = null;

const DEFAULTS: ClaraConfig = {
  model: "default",
  runner: "claude",
  fallback: [],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  activeHours: { start: "00:00", end: "23:59" },
  database_url: "postgres://postgres@localhost:5432/clara",
  log_level: "info",
  gemini_api_key: null,
  sessionFinalization: {
    enabled: true,
    memoryConsolidation: true,
    summaries: true,
  },
  channels: {
    enabled: true,
    default: "telegram",
    telegram: { enabled: true, bot_token: null, chat_id: null, open: false },
    slack: {
      enabled: true,
      bot_token: null,
      app_token: null,
      dm_user_id: null,
      bot_user_id: null,
      bot_name: null,
      workspace: null,
      workspace_id: null,
      workspace_url: null,
      watch: null,
    },
    twilio: {
      sid: null,
      secret: null,
      auth_token: null,
      owner_number: null,
      allowlist: [],
      public_base_url: null,
      port: 7079,
    },
    phone: {
      enabled: true,
      from_number: null,
      openai_api_key: null,
      realtime_model: "gpt-realtime",
      voice: "marin",
      stt_language: "en-US",
      speech_timeout: "auto",
    },
    sms: {
      enabled: true,
      from_number: null,
    },
    whatsapp: {
      enabled: true,
      from_number: "+14155238886",
    },
  },
};

export function getConfig(): ClaraConfig {
  if (!_config) _config = loadConfig();
  return _config;
}

export function resetConfig(): void {
  _config = null;
}

export function loadConfig(): ClaraConfig {
  const paths = getPaths();
  let raw: Record<string, unknown> = {};

  if (existsSync(paths.config)) {
    try {
      raw = yaml.load(readFileSync(paths.config, "utf8")) as Record<string, unknown>;
    } catch (err) {
      log.warn({ err, path: paths.config }, "failed to parse config.yaml, using defaults");
    }
  }

  if (!raw || typeof raw !== "object") raw = {};

  const merged = deepMerge(structuredClone(DEFAULTS), envOverrides(raw));
  const parsed = configSchema.safeParse(merged);

  if (!parsed.success) {
    log.warn({ errors: parsed.error.issues }, "config validation failed, falling back to defaults");
    return DEFAULTS;
  }

  return parsed.data;
}

function envOverrides(raw: Record<string, unknown>): Record<string, unknown> {
  const ch = ((raw.channels || {}) as Record<string, unknown>);

  const tg = (ch.telegram || {}) as Record<string, unknown>;
  tg.bot_token = process.env.TELEGRAM_BOT_TOKEN || tg.bot_token || null;
  tg.chat_id = process.env.TELEGRAM_CHAT_ID ? Number(process.env.TELEGRAM_CHAT_ID) : tg.chat_id || null;

  const sl = (ch.slack || {}) as Record<string, unknown>;
  sl.bot_token = process.env.SLACK_BOT_TOKEN || sl.bot_token || null;
  sl.app_token = process.env.SLACK_APP_TOKEN || sl.app_token || null;
  sl.dm_user_id = process.env.SLACK_DM_USER_ID || sl.dm_user_id || null;

  const tw = (ch.twilio || {}) as Record<string, unknown>;
  tw.sid = process.env.TWILIO_SID || tw.sid || null;
  tw.secret = process.env.TWILIO_SECRET || tw.secret || null;
  tw.auth_token = process.env.TWILIO_AUTH_TOKEN || tw.auth_token || null;
  tw.owner_number = process.env.PRIMARY_PHONE_USER || tw.owner_number || null;

  return {
    ...raw,
    database_url: process.env.DATABASE_URL || raw.database_url || DEFAULTS.database_url,
    log_level: process.env.LOG_LEVEL || raw.log_level || DEFAULTS.log_level,
    gemini_api_key: process.env.GEMINI_API_KEY || raw.gemini_api_key || null,
    channels: {
      ...ch,
      telegram: tg,
      slack: sl,
      twilio: tw,
    },
  };
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = result[key];
    if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object" && !Array.isArray(tv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (sv !== undefined) {
      result[key] = sv;
    }
  }
  return result;
}

export function readRawConfig(): Record<string, unknown> {
  const paths = getPaths();
  if (!existsSync(paths.config)) return {};
  try {
    return yaml.load(readFileSync(paths.config, "utf8")) as Record<string, unknown> || {};
  } catch {
    return {};
  }
}

export function writeRawConfig(raw: Record<string, unknown>): void {
  const paths = getPaths();
  const dir = dirname(paths.config);
  mkdirSync(dir, { recursive: true });
  if (existsSync(paths.config)) {
    copyFileSync(paths.config, join(dir, "config.yaml.bak"));
  }
  const tmp = join(dir, `.config.yaml.tmp.${process.pid}`);
  writeFileSync(tmp, yaml.dump(raw, { lineWidth: -1 }));
  renameSync(tmp, paths.config);
  resetConfig();
}

export function updateRawConfig(fields: Record<string, unknown>): void {
  const raw = readRawConfig();
  const merged = deepMerge(raw, fields);
  writeRawConfig(merged);
}
