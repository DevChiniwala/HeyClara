import { readMemory, appendMemory, readRules, appendRule } from "../../utils/memory";
import { scanAgents } from "../../core/agents";
import { listEmployees } from "../../core/employees";

export async function readMemoryTool(): Promise<string> {
  const memory = readMemory();
  return memory || "No memories saved yet.";
}

export async function addMemoryTool(entry: string): Promise<string> {
  appendMemory(`- ${entry}`);
  return `Memory saved: ${entry}`;
}

export async function addRuleTool(rule: string): Promise<string> {
  appendRule(rule);
  return `Rule added: ${rule}`;
}

export async function listAgentsTool(): Promise<string> {
  const agents = scanAgents();
  if (agents.length === 0) return "No agents configured.";
  return agents
    .map((a) => `- **${a.name}**${a.model ? ` (model: ${a.model})` : ""}`)
    .join("\n");
}

export async function listEmployeesTool(): Promise<string> {
  const employees = listEmployees();
  if (employees.length === 0) return "No employees configured.";
  return employees
    .map((e) => `- **${e.name}**: ${e.role} @ ${e.project}${e.model ? ` (model: ${e.model})` : ""}${e.enabled ? "" : " [disabled]"}`)
    .join("\n");
}
