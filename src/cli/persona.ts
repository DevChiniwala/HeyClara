import { existsSync, readFileSync, writeFileSync } from "fs";
import { getPaths } from "../utils/paths";
import { scanSkills } from "../core/skills";
import { scanAgents } from "../core/agents";
import { listEmployees } from "../core/employees";
import { readMemory, readRules } from "../utils/memory";
import { fail } from "../utils/cli";

function getSelfFile(name: string): string {
  const path = `${getPaths().selfDir}/${name}`;
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

export function rulesShow(): void {
  const content = readRules();
  if (content) console.log(content);
  else console.log("No rules defined yet.");
}

export function rulesReset(): void {
  writeFileSync(`${getPaths().selfDir}/rules.md`, "");
  console.log("Rules reset.");
}

export function memoryShow(): void {
  const content = readMemory();
  if (content) console.log(content);
  else console.log("No memories saved yet.");
}

export function memoryReset(): void {
  writeFileSync(`${getPaths().selfDir}/memory.md`, "");
  console.log("Memory reset.");
}

export function agentsList(): void {
  const agents = scanAgents();
  if (agents.length === 0) { console.log("No agents configured."); return; }
  for (const a of agents) {
    console.log(`  ${a.name}${a.model ? ` (model: ${a.model})` : ""}`);
  }
}

export function agentShow(name: string): void {
  const agents = scanAgents();
  const agent = agents.find((a) => a.name === name);
  if (!agent) fail(`Agent "${name}" not found.`);
  console.log(`Agent: ${agent.name}`);
  console.log(`Model: ${agent.model || "(default)"}`);
  console.log(`\n${agent.body}`);
}

export function skillsList(filter?: string): void {
  const skills = scanSkills(filter);
  if (skills.length === 0) { console.log("No skills found."); return; }
  for (const s of skills) {
    const tag = filter ? "" : ` [${s.source}]`;
    console.log(`  ${s.name}${tag}`);
  }
}

export function employeesList(): void {
  const employees = listEmployees();
  if (employees.length === 0) { console.log("No employees configured."); return; }
  for (const e of employees) {
    console.log(`  ${e.name}: ${e.role} @ ${e.project}${e.model ? ` (${e.model})` : ""}${e.enabled ? "" : " [disabled]"}`);
  }
}
