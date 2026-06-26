import { getConfig, updateRawConfig } from "../../utils/config";

function readWatchConfig(): Record<string, Record<string, unknown>> {
  const w = getConfig().channels.slack.watch;
  return (w || {}) as Record<string, Record<string, unknown>>;
}

export async function addWatchChannel(name: string, behavior?: string): Promise<string> {
  const current = readWatchConfig();
  if (current[name]) return `Watch channel "${name}" already exists. Use update to change.`;

  const entry: Record<string, unknown> = { enabled: true };
  if (behavior !== undefined) entry.behavior = behavior;

  updateRawConfig({
    channels: {
      slack: {
        watch: { ...current, [name]: entry },
      },
    },
  });

  return `Watch channel "${name}" added.`;
}

export async function removeWatchChannel(name: string): Promise<string> {
  const current = readWatchConfig();
  if (!current[name]) return `Watch channel "${name}" not found.`;

  const { [name]: _, ...rest } = current;
  updateRawConfig({
    channels: {
      slack: {
        watch: Object.keys(rest).length > 0 ? rest : null,
      },
    },
  });

  return `Watch channel "${name}" removed.`;
}

export async function enableWatchChannel(name: string): Promise<string> {
  const current = readWatchConfig();
  if (!current[name]) return `Watch channel "${name}" not found.`;

  updateRawConfig({
    channels: {
      slack: {
        watch: { ...current, [name]: { ...current[name], enabled: true } },
      },
    },
  });

  return `Watch channel "${name}" enabled.`;
}

export async function disableWatchChannel(name: string): Promise<string> {
  const current = readWatchConfig();
  if (!current[name]) return `Watch channel "${name}" not found.`;

  updateRawConfig({
    channels: {
      slack: {
        watch: { ...current, [name]: { ...current[name], enabled: false } },
      },
    },
  });

  return `Watch channel "${name}" disabled.`;
}
