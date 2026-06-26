import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getPaths } from "../utils/paths";
import { getEmployee } from "../core/employees";
import { buildContextSuffix } from "./identity";
import type { Mode } from "../types/enums";

export function buildEmployeePrompt(employeeName: string, mode: Mode = "chat"): string {
  const emp = getEmployee(employeeName);
  if (!emp) return "";

  const parts: string[] = [];

  // Load employee identity file
  const empPath = join(getPaths().home, "employees", employeeName, "identity.md");
  if (existsSync(empPath)) {
    parts.push(readFileSync(empPath, "utf8").trim());
  } else {
    parts.push(`You are ${employeeName}. Role: ${emp.role}. Project: ${emp.project}.`);
  }

  parts.push(buildContextSuffix(mode));

  return parts.join("\n\n");
}
