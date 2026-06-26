import { getConfig } from "../../utils/config";
import { log } from "../../utils/log";

export async function sendMessage(
  text: string,
  channel?: string,
  mediaPath?: string,
  ctx?: Record<string, unknown>,
  target: string = "auto",
): Promise<string> {
  const config = getConfig();
  const ch = channel || config.channels.default;
  const slackCtx = ctx as { slackChannelId?: string; slackThreadTs?: string } | undefined;

  try {
    if (ch === "telegram" && config.channels.telegram.bot_token && config.channels.telegram.chat_id) {
      const { Bot } = await import("grammy");
      const bot = new Bot(config.channels.telegram.bot_token);
      if (mediaPath) {
        await bot.api.sendPhoto(config.channels.telegram.chat_id, mediaPath, { caption: text });
      } else {
        await bot.api.sendMessage(config.channels.telegram.chat_id, text);
      }
      return "Message sent via Telegram.";
    }

    if (ch === "slack" && config.channels.slack.bot_token) {
      const channelId = target === "thread" && slackCtx?.slackChannelId
        ? slackCtx.slackChannelId
        : config.channels.slack.dm_user_id;

      const body: Record<string, unknown> = { channel: channelId, text };

      if (target === "thread" && slackCtx?.slackThreadTs) {
        body.thread_ts = slackCtx.slackThreadTs;
      }

      const resp = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.channels.slack.bot_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });

      const data = await resp.json() as { ok: boolean; error?: string };
      if (data.ok) return "Message sent via Slack.";
      return `Slack send failed: ${data.error || "unknown error"}`;
    }

    return `No configured channel "${ch}" available.`;
  } catch (err) {
    log.error({ err, channel: ch }, "send message failed");
    return `Failed to send message: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function placeCall(args: Record<string, unknown>): Promise<string> {
  const number = args.number as string;
  const text = (args.text as string) || "";
  if (!number) return "Error: missing required parameter 'number'.";

  const { placeOutboundCall } = await import("../../channels/voice");
  const ok = await placeOutboundCall(number, text || undefined);
  if (ok) return `Call placed to ${number}.`;
  return "Failed to place call. Check Twilio configuration.";
}
