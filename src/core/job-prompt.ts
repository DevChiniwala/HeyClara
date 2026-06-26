import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { getPaths } from "../utils/paths";
import type { JobRow } from "../db/models/job";
import type { ResolvedJobPrompt } from "../types/job";

export function resolveJobPrompt(job: JobRow): ResolvedJobPrompt {
  const filePath = join(getPaths().jobsDir, job.name, "prompt.md");
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf8").trim();
    if (content) {
      return { source: "file", prompt: content, filePath };
    }
  }
  return { source: "db", prompt: job.prompt };
}

export function buildJobPrompt(job: JobRow): string {
  const resolved = resolveJobPrompt(job);
  const state = loadJobState(job.name);
  const parts: string[] = [resolved.prompt];

  if (!job.stateless && state) {
    parts.push(`\n## Working Memory\n${state}`);
  }

  return parts.join("\n\n");
}

function loadJobState(name: string): string | null {
  const statePath = join(getPaths().jobsDir, name, "state.md");
  if (!existsSync(statePath)) return null;
  try {
    return readFileSync(statePath, "utf8").trim() || null;
  } catch {
    return null;
  }
}
