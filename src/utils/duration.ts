const DURATION_RE = /^(\d+)\s*(s|sec|m|min|h|hr|d|day|w|wk|week)$/i;

export function parseDuration(input: string): number {
  const match = input.trim().match(DURATION_RE);
  if (!match) throw new Error(`Invalid duration: "${input}". Expected e.g. "30s", "5m", "2h", "1d", "1w"`);

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
    case "sec":
      return value * 1000;
    case "m":
    case "min":
      return value * 60 * 1000;
    case "h":
    case "hr":
      return value * 3600 * 1000;
    case "d":
    case "day":
      return value * 86400 * 1000;
    case "w":
    case "wk":
    case "week":
      return value * 604800 * 1000;
    default:
      throw new Error(`Unknown duration unit: ${unit}`);
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}
