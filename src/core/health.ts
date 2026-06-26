import { getSql } from "../db/connection";
import { getConfig } from "../utils/config";
import { isRunning } from "../utils/pid";

export interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

export async function runHealthChecks(): Promise<Check[]> {
  const checks: Check[] = [];

  // Daemon check
  checks.push({
    name: "daemon",
    ok: isRunning(),
    detail: isRunning() ? `PID ${process.pid}` : "not running",
  });

  // Database check
  try {
    const sql = getSql();
    await sql`SELECT 1`;
    checks.push({ name: "database", ok: true, detail: "connected" });
  } catch (err) {
    checks.push({ name: "database", ok: false, detail: err instanceof Error ? err.message : "connection failed" });
  }

  // Config check
  try {
    const config = getConfig();
    checks.push({ name: "config", ok: true, detail: `runner: ${config.runner}, tz: ${config.timezone}` });
  } catch (err) {
    checks.push({ name: "config", ok: false, detail: err instanceof Error ? err.message : "invalid config" });
  }

  return checks;
}

export async function getFailures(): Promise<Check[]> {
  const checks = await runHealthChecks();
  return checks.filter((c) => !c.ok);
}
