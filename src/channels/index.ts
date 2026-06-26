import type { Channel } from "../types/channel";
import { registerChannel, getFactories, trackStarted, clearStarted } from "./registry";
import { log } from "../utils/log";
import { getConfig } from "../utils/config";
import { createTelegramChannel } from "./telegram";
import { createSlackChannel } from "./slack";
import { createSmsChannel } from "./sms";
import { createWhatsAppChannel } from "./whatsapp";
import { getTwilioServer } from "./twilio/server";

export { getChannel, getStarted } from "./registry";

export function registerAllChannels(): void {
  registerChannel(() => createTelegramChannel());
  registerChannel(() => createSlackChannel());
  registerChannel(() => createSmsChannel());
  registerChannel(() => createWhatsAppChannel());
}

export interface StartResult {
  started: Channel[];
  failed: string[];
}

export async function startChannels(): Promise<StartResult> {
  const pending = getFactories()
    .map((factory) => factory())
    .filter((ch): ch is Channel => ch !== null);

  if (pending.length === 0) return { started: [], failed: [] };

  const results = await Promise.allSettled(
    pending.map(async (channel) => {
      await channel.start();
      return channel;
    }),
  );

  const started: Channel[] = [];
  const failed: string[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      started.push(result.value);
      trackStarted(result.value);
    } else {
      failed.push(pending[i].name);
      log.error({ err: result.reason, channel: pending[i].name }, "channel failed to start");
    }
  }

  return { started, failed };
}

export function getConfiguredChannelNames(): string[] {
  const { channels } = getConfig();
  if (!channels.enabled) return [];

  const names: string[] = [];
  if (channels.telegram.enabled && channels.telegram.bot_token) names.push("telegram");
  if (channels.slack.enabled && channels.slack.bot_token && channels.slack.app_token) names.push("slack");
  const smsFrom = channels.sms.from_number ?? channels.phone.from_number;
  if (channels.sms.enabled && channels.twilio.sid && channels.twilio.secret && smsFrom) names.push("sms");
  if (channels.whatsapp.enabled && channels.twilio.sid && channels.twilio.secret && channels.whatsapp.from_number) names.push("whatsapp");
  return names;
}

export async function stopChannels(channels: Channel[]): Promise<void> {
  await Promise.allSettled(
    channels.map(async (channel) => {
      await channel.stop();
    }),
  );
  try {
    getTwilioServer().stop();
  } catch {}
  clearStarted();
}
