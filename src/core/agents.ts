import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getPaths } from "../utils/paths";
import { getConfig } from "../utils/config";

export interface AgentInfo {
  name: string;
  body: string;
  model?: string;
}

export function scanAgents(): AgentInfo[] {
  const baseDir = join(getPaths().home, "agents");
  if (!existsSync(baseDir)) return [];

  const agents: AgentInfo[] = [];
  const entries = readdirSync(baseDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const agentDir = join(baseDir, entry.name);
    const agentMd = join(agentDir, "AGENT.md");
    if (!existsSync(agentMd)) continue;
    const content = readFileSync(agentMd, "utf8");
    agents.push({
      name: entry.name,
      body: content.trim(),
      model: extractModel(content),
    });
  }
  return agents;
}

export function getAgentDefinitions(): Record<string, { description: string; prompt: string; model?: string }> {
  const agents = scanAgents();
  const defs: Record<string, { description: string; prompt: string; model?: string }> = {};
  for (const agent of agents) {
    defs[agent.name] = {
      description: extractDescription(agent.body) || `Agent specialized in ${agent.name}`,
      prompt: agent.body,
      model: agent.model,
    };
  }
  return defs;
}

export function getAgentsSummary(): string {
  const agents = scanAgents();
  if (agents.length === 0) return "";
  const lines = agents.map((a) => `- **${a.name}**${a.model ? ` (model: ${a.model})` : ""}`);
  return `## Available Agents\n${lines.join("\n")}`;
}

function extractModel(content: string): string | undefined {
  for (const line of content.split("\n")) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith("model:")) return line.split(":")[1]?.trim() || undefined;
  }
  return undefined;
}

function extractDescription(content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("description:") || trimmed.startsWith("Description:")) {
      return line.split(":")[1]?.trim() || "";
    }
  }
  return "";
}
