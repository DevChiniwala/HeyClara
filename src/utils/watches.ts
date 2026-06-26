import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getPaths } from "./paths";

export interface WatchConfig {
  name: string;
  channelId: string;
  channelName: string;
  behavior: string;
  enabled: boolean;
}

export function parseWatchKey(key: string): { channelId: string; channelName: string } {
  const parts = key.split("#");
  return {
    channelId: parts[0],
    channelName: parts[1] || parts[0],
  };
}

export function getWatchBehavior(name: string, behavior?: string): string {
  if (!behavior || behavior.trim().length === 0) {
    const path = join(getPaths().watchesDir, name, "behavior.md");
    if (existsSync(path)) return readFileSync(path, "utf8").trim();
    return "";
  }

  if (behavior.includes(" ")) return behavior.trim();

  const path = join(getPaths().watchesDir, behavior, "behavior.md");
  if (existsSync(path)) return readFileSync(path, "utf8").trim();
  return "";
}
