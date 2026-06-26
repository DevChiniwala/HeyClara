import { existsSync, readFileSync, writeFileSync } from "fs";
import { getPaths } from "./paths";

export function readMemory(): string {
  const { selfDir } = getPaths();
  const path = `${selfDir}/memory.md`;
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8").trim();
}

export function appendMemory(entry: string): void {
  const { selfDir } = getPaths();
  const path = `${selfDir}/memory.md`;
  const existing = existsSync(path) ? readFileSync(path, "utf8").trim() : "";
  const updated = existing ? `${existing}\n\n${entry}` : entry;
  writeFileSync(path, updated + "\n");
}

export function readRules(): string {
  const { selfDir } = getPaths();
  const path = `${selfDir}/rules.md`;
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8").trim();
}

export function appendRule(rule: string): void {
  const { selfDir } = getPaths();
  const path = `${selfDir}/rules.md`;
  const existing = existsSync(path) ? readFileSync(path, "utf8").trim() : "";
  const updated = existing ? `${existing}\n- ${rule}` : `- ${rule}`;
  writeFileSync(path, updated + "\n");
}
