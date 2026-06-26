/**
 * OS service management for Clara daemon.
 * Supports launchd (macOS) and systemd (Linux).
 */
import { existsSync, writeFileSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";

function getBunPath(): string {
  try {
    const result = Bun.spawnSync(["which", "bun"]);
    return new TextDecoder().decode(result.stdout).trim() || "bun";
  } catch {
    return "bun";
  }
}

function getClaraPath(): string {
  return join(import.meta.dir, "..", "cli", "index.ts");
}

function getServiceName(): string {
  return "com.heyclara.daemon";
}

export function isServiceInstalled(): boolean {
  if (process.platform === "darwin") {
    const plist = join(homedir(), "Library", "LaunchAgents", `${getServiceName()}.plist`);
    return existsSync(plist);
  }
  return false;
}

export async function registerService(): Promise<void> {
  if (process.platform !== "darwin") return;

  const plistPath = join(homedir(), "Library", "LaunchAgents", `${getServiceName()}.plist`);
  if (existsSync(plistPath)) return;

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${getServiceName()}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${getBunPath()}</string>
    <string>${getClaraPath()}</string>
    <string>run</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${join(homedir(), ".clara", "tmp", "daemon.log")}</string>
  <key>StandardErrorPath</key>
  <string>${join(homedir(), ".clara", "tmp", "daemon.log")}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>`;

  writeFileSync(plistPath, plist);

  try {
    Bun.spawnSync(["launchctl", "load", plistPath]);
  } catch {}
}

export async function unregisterService(opts: { force?: boolean } = {}): Promise<void> {
  if (process.platform !== "darwin") return;

  const plistPath = join(homedir(), "Library", "LaunchAgents", `${getServiceName()}.plist`);
  if (!existsSync(plistPath)) return;

  try {
    Bun.spawnSync(["launchctl", "unload", plistPath]);
  } catch {}

  if (opts.force) {
    try { unlinkSync(plistPath); } catch {}
  }
}

export async function restartService(opts: { force?: boolean } = {}): Promise<void> {
  await unregisterService(opts);
  await registerService();
}
