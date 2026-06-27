import yaml from "js-yaml";
import { readRawConfig, updateRawConfig } from "../utils/config";
import { fail } from "../utils/cli";

export function configList(): void {
  const raw = readRawConfig();
  console.log(yaml.dump(raw, { lineWidth: -1 }).trim());
}

export function configGet(key: string): void {
  const raw = readRawConfig();
  const parts = key.split(".");
  let val: unknown = raw;
  for (const p of parts) {
    if (val && typeof val === "object") val = (val as Record<string, unknown>)[p];
    else { val = undefined; break; }
  }
  if (val === undefined) {
    console.log(`${key}: (not set)`);
  } else if (typeof val === "object") {
    console.log(yaml.dump(val, { lineWidth: -1 }).trim());
  } else {
    console.log(`${key} = ${val}`);
  }
}

export function configSet(key: string, value: string): void {
  const parts = key.split(".");
  let obj: Record<string, unknown> = {};
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cursor[parts[i]] = {};
    cursor = cursor[parts[i]] as Record<string, unknown>;
  }
  let parsed: unknown = value;
  if (value === "true") parsed = true;
  else if (value === "false") parsed = false;
  else if (/^\d+$/.test(value)) parsed = Number(value);
  cursor[parts[parts.length - 1]] = parsed;
  updateRawConfig(obj);
  console.log(`${key} = ${value}`);
}
