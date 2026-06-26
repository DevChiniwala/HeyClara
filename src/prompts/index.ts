import { readFileSync } from "fs";
import { join } from "path";
import type { Mode, ChannelName } from "../types/enums";

const promptsDir = import.meta.dir;

function loadPrompt(name: string): string {
  try {
    return readFileSync(join(promptsDir, name), "utf8").trim();
  } catch {
    return "";
  }
}

const envPrompt = loadPrompt("environment.md");

const modePrompts: Record<string, string> = {
  chat: loadPrompt("mode-chat.md"),
  job: loadPrompt("mode-job.md"),
};

const channelPrompts: Record<string, string> = {
  common: loadPrompt("channel-common.md"),
  slack: loadPrompt("channel-slack.md"),
  telegram: loadPrompt("channel-telegram.md"),
};

export function getEnvironmentPrompt(): string {
  return envPrompt;
}

export function getModePrompt(mode: Mode): string {
  return modePrompts[mode] || "";
}

export function getChannelPrompt(channel: ChannelName | string): string {
  if (channel === "slack") return [channelPrompts.common, channelPrompts.slack].filter(Boolean).join("\n\n");
  if (channel === "telegram") return [channelPrompts.common, channelPrompts.telegram].filter(Boolean).join("\n\n");
  if (channel === "sms" || channel === "whatsapp") return channelPrompts.common;
  return "";
}
