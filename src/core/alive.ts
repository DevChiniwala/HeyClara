import { log } from "../utils/log";
import { getConfig } from "../utils/config";
import { getSql, closeDb } from "../db/connection";
import { getFailures } from "./health";

const HEARTBEAT_INTERVAL = 60_000;

let timer: ReturnType<typeof setInterval> | null = null;
let lastFailures: string[] = [];
let recoveryAttempted = false;

async function attemptDbReconnect(): Promise<boolean> {
  try {
    await closeDb();
    const sql = getSql();
    await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function notifyUser(message: string): Promise<void> {
  const config = getConfig();

  const tgToken = config.channels.telegram.bot_token;
  const tgChatId = config.channels.telegram.chat_id;
  if (tgToken && tgChatId) {
    try {
      const { Bot } = await import("grammy");
      const bot = new Bot(tgToken);
      await bot.api.sendMessage(tgChatId, message);
      log.info("alive: notified user via telegram");
      return;
    } catch {}
  }

  const slToken = config.channels.slack.bot_token;
  const slRecipient = config.channels.slack.dm_user_id;
  if (slToken && slRecipient) {
    try {
      await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { Authorization: `Bearer ${slToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ channel: slRecipient, text: message }),
        signal: AbortSignal.timeout(10_000),
      });
      log.info("alive: notified user via slack");
      return;
    } catch {}
  }

  log.error("alive: could not notify user - no channel available");
}

async function heartbeat(): Promise<void> {
  const failures = await getFailures();
  const failureNames = failures.map((f) => f.name);

  if (failures.length === 0) {
    if (lastFailures.length > 0) {
      log.info({ recovered: lastFailures }, "alive: all checks passing");
      await notifyUser(`Recovered: ${lastFailures.join(", ")} back to normal.`);
    }
    lastFailures = [];
    recoveryAttempted = false;
    return;
  }

  const newFailures = failureNames.filter((f) => !lastFailures.includes(f));
  if (newFailures.length > 0) {
    log.warn({ failures: failureNames }, "alive: health check failures detected");
  }

  if (failureNames.includes("database") && !recoveryAttempted) {
    const reconnected = await attemptDbReconnect();
    if (reconnected) {
      log.info("alive: database reconnected");
      const remaining = await getFailures();
      if (remaining.length === 0) {
        lastFailures = [];
        recoveryAttempted = false;
        return;
      }
    }
  }

  recoveryAttempted = true;
  lastFailures = failureNames;
}

function jitter(ms: number): number {
  return ms + Math.round(Math.random() * ms * 0.1 - ms * 0.05);
}

export function startAlive(): void {
  log.info("alive started (60s heartbeat)");
  setTimeout(heartbeat, jitter(10_000));
  timer = setInterval(heartbeat, jitter(HEARTBEAT_INTERVAL));
}

export function stopAlive(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
