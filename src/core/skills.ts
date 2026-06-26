import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getPaths } from "../utils/paths";

export interface SkillInfo {
  name: string;
  source: string;
  description: string;
}

const BUILT_IN_SKILL_DIR = join(import.meta.dir, "..", "..", "skills");

export function scanSkills(filter?: string): SkillInfo[] {
  const skills: SkillInfo[] = [];
  const sources = [BUILT_IN_SKILL_DIR, getPaths().skillsDir];

  for (const source of sources) {
    if (!existsSync(source)) continue;
    const entries = readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = join(source, entry.name);
      const skillMd = join(skillDir, "SKILL.md");
      if (!existsSync(skillMd)) continue;

      const content = readFileSync(skillMd, "utf8");
      const description = extractDescription(content);
      skills.push({
        name: entry.name,
        source: source === BUILT_IN_SKILL_DIR ? "built-in" : "user",
        description,
      });
    }
  }

  if (filter) return skills.filter((s) => s.source === filter);
  return skills;
}

export function getSkillsSummary(): string {
  const skills = scanSkills();
  if (skills.length === 0) return "";

  const lines = skills.map((s) => `- **${s.name}** (${s.source}): ${s.description}`);
  return `## Available Skills\n${lines.join("\n")}`;
}

function extractDescription(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("description:") || trimmed.startsWith("Description:")) {
      return trimmed.split(":")[1]?.trim() || "";
    }
  }
  return "";
}
