import { existsSync, readFileSync } from "fs";
import { getPaths } from "../utils/paths";
import { getSkillsSummary } from "../core/skills";
import { getAgentsSummary } from "../core/agents";
import { getEmployeesSummary } from "../core/employees";
import { Session } from "../db/models";
import type { Mode } from "../types/enums";

function loadFile(dir: string, name: string): string {
  const filePath = `${dir}/${name}`;
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8").trim();
}

function loadIdentity(): string {
  const { selfDir } = getPaths();
  return ["identity.md", "owner.md", "soul.md", "rules.md", "memory.md"]
    .map((f) => loadFile(selfDir, f))
    .filter(Boolean)
    .join("\n\n");
}

export function buildSystemPrompt(mode: Mode = "chat", channel: string = "terminal"): string {
  const parts: string[] = [];

  const identity = loadIdentity();
  if (identity) parts.push(identity);

  parts.push("## Environment\nYou are Clara, a personal AI assistant running as a daemon. You have access to MCP tools for managing jobs, messages, memory, and channels.");

  if (mode === "chat") parts.push("## Mode: Chat\nYou are in an interactive conversation. Respond conversationally. Use your tools when appropriate.");
  if (mode === "job") parts.push("## Mode: Job\nYou are running as a scheduled job. Complete the task efficiently and report results.");

  if (channel !== "terminal") parts.push(`## Channel: ${channel}\nYou are communicating via ${channel}. Keep responses appropriate for the medium.`);

  const skills = getSkillsSummary();
  if (skills) parts.push(skills);

  const agents = getAgentsSummary();
  if (agents) parts.push(agents);

  const employees = getEmployeesSummary();
  if (employees) parts.push(employees);

  return parts.join("\n\n");
}

export function buildContextSuffix(mode: Mode = "chat"): string {
  const parts: string[] = [];
  parts.push("## Environment\nYou are Clara, a personal AI assistant running as a daemon.");

  if (mode === "chat") parts.push("## Mode: Chat\nRespond conversationally. Use your tools when appropriate.");
  if (mode === "job") parts.push("## Mode: Job\nComplete the task efficiently and report results.");

  const skills = getSkillsSummary();
  if (skills) parts.push(skills);

  const agents = getAgentsSummary();
  if (agents) parts.push(agents);

  const employees = getEmployeesSummary();
  if (employees) parts.push(employees);

  return parts.join("\n\n");
}

export async function getSessionContext(room: string): Promise<string> {
  try {
    const summaries = await Session.getRecentSummaries(room, 3);
    if (summaries.length === 0) return "";

    const lines = summaries
      .reverse()
      .map((s) => `- (${s.updatedAt}): ${s.summary}`)
      .join("\n");

    return `## Recent Session Context\nBrief summaries of your last few sessions:\n${lines}`;
  } catch {
    return "";
  }
}
