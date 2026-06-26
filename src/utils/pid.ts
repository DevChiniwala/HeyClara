import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { getPaths } from "./paths";

export function readPid(): number | null {
  const { pidFile } = getPaths();
  if (!existsSync(pidFile)) return null;
  try {
    const pid = parseInt(readFileSync(pidFile, "utf8").trim(), 10);
    return isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

export function writePid(pid: number): void {
  const { pidFile } = getPaths();
  writeFileSync(pidFile, String(pid));
}

export function removePid(): void {
  const { pidFile } = getPaths();
  if (existsSync(pidFile)) {
    try {
      unlinkSync(pidFile);
    } catch {}
  }
}

export function isRunning(): boolean {
  const pid = readPid();
  if (pid === null) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
