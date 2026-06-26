import { getConfig } from "./config";

export function localTime(date: Date): string {
  const config = getConfig();
  const tz = config.timezone || "UTC";
  return date.toLocaleString("en-US", {
    timeZone: tz,
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function localDate(date: Date): string {
  const config = getConfig();
  const tz = config.timezone || "UTC";
  return date.toLocaleDateString("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}
