import { ActiveEngine } from "../db/models";
import { log } from "../utils/log";

export interface GuardFlags {
  wait: number; // minutes to wait (0 = no wait)
  force: boolean;
}

export function parseGuardFlags(args: string[]): GuardFlags {
  const flags: GuardFlags = { wait: 0, force: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--wait" && args[i + 1]) {
      flags.wait = parseInt(args[i + 1], 10) || 0;
      i++;
    }
    if (args[i] === "--force") flags.force = true;
  }
  return flags;
}

export function withDefaultWait(flags: GuardFlags, minutes: number): GuardFlags {
  return { ...flags, wait: flags.wait || minutes };
}

export async function guardActiveEngines(action: string, flags: GuardFlags): Promise<boolean> {
  const engines = await ActiveEngine.list();
  if (engines.length === 0) return true;

  log.info({ action, count: engines.length }, "active engines running");

  if (flags.force) return true;

  if (flags.wait > 0) {
    log.info({ waitMinutes: flags.wait }, "waiting for active engines to finish");
    const deadline = Date.now() + flags.wait * 60_000;
    while (Date.now() < deadline) {
      const remaining = await ActiveEngine.list();
      if (remaining.length === 0) return true;
      await new Promise((r) => setTimeout(r, 2000));
    }
    log.warn({ count: (await ActiveEngine.list()).length }, "wait timed out, active engines still running");
  }

  const list = engines.map((e) => `  ${e.room} (channel: ${e.channel})`).join("\n");
  console.error(`Active engines still running:\n${list}`);
  console.error(`Use --wait N to wait N minutes, or --force to force stop`);
  return false;
}
