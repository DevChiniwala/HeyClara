import { existsSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { getPaths } from "./paths";
import type { AuditEntry, CronState } from "../types/audit";

export function readState(): CronState {
  const { stateFile } = getPaths();
  if (!existsSync(stateFile)) return {};
  try {
    return JSON.parse(readFileSync(stateFile, "utf8"));
  } catch {
    return {};
  }
}

export function writeState(state: CronState): void {
  const { stateFile } = getPaths();
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

export function appendAudit(entry: AuditEntry): void {
  const { auditFile } = getPaths();
  appendFileSync(auditFile, JSON.stringify(entry) + "\n");
}
