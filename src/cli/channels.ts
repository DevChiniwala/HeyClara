import { readPid, isRunning } from "../utils/pid";
import { updateRawConfig } from "../utils/config";
import { fail } from "../utils/cli";

export function channelsToggle(action: "on" | "off", target?: string): void {
  const enabled = action === "on";
  if (target) {
    const supported = new Set(["telegram", "slack", "sms", "whatsapp"]);
    if (!supported.has(target)) fail(`Unknown channel: ${target}`);
    updateRawConfig({ channels: { ...(enabled ? { enabled: true } : {}), [target]: { enabled } } });
  } else {
    updateRawConfig({ channels: { enabled } });
  }

  const pid = readPid();
  if (pid && isRunning()) {
    process.kill(pid, "SIGHUP");
    console.log(target ? `${target} ${enabled ? "enabled" : "disabled"}` : `channels ${enabled ? "enabled" : "disabled"}`);
  } else {
    console.log(target ? `${target} ${enabled ? "enabled" : "disabled"} (restart to apply)` : `channels ${enabled ? "enabled" : "disabled"} (restart to apply)`);
  }
}
