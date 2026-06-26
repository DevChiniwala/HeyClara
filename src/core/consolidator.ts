import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { runJobWithBackend } from "./runner";
import { getPaths } from "../utils/paths";
import { log } from "../utils/log";

export async function consolidateMemory(messages: string): Promise<string> {
  const systemPrompt = [
    "You are a memory consolidator. Review the conversation below and extract up to 3",
    "concise, factual memories that Clara should remember permanently.",
    "Rules for memories:",
    "- Max 300 characters each",
    "- One insight per entry",
    "- No raw logs, no transcripts, no status dumps",
    "- Only include things that are likely to be useful in future conversations",
    "",
    "Return each memory on a separate line starting with '- '.",
    "If nothing worth remembering, return nothing.",
  ].join("\n");

  const result = await runJobWithBackend(systemPrompt, messages, homedir());

  if (result.error) {
    log.warn({ error: result.error }, "memory consolidation failed");
    return "";
  }

  const memories = result.agentText.trim();
  if (memories) {
    stageMemories(memories);
  }

  return memories;
}

function stageMemories(content: string): void {
  const stagingPath = `${getPaths().selfDir}/staging.md`;
  const existing = existsSync(stagingPath) ? readFileSync(stagingPath, "utf8").trim() : "";
  const updated = existing ? `${existing}\n\n${content}` : content;
  writeFileSync(stagingPath, updated + "\n");
}

export async function promoteStagedMemories(): Promise<number> {
  const stagingPath = `${getPaths().selfDir}/staging.md`;
  if (!existsSync(stagingPath)) return 0;

  const content = readFileSync(stagingPath, "utf8").trim();
  if (!content) return 0;

  const systemPrompt = [
    "Review the staged memories below. For each one, decide if it should be",
    "permanently added to Clara's memory.md. Rules:",
    "- Only promote if truly durable (preferences, facts about the owner, important context)",
    "- Skip transient observations, one-off events, or duplicate entries",
    "- Skip staging instructions or meta-commentary",
    "",
    "Return the entries to promote, one per line starting with '- '.",
    "If none should be promoted, return nothing.",
  ].join("\n");

  const result = await runJobWithBackend(systemPrompt, content, homedir());

  if (result.error) {
    log.warn({ error: result.error }, "memory promotion failed");
    return 0;
  }

  const promoted = result.agentText.trim();
  if (!promoted) return 0;

  const memoryPath = `${getPaths().selfDir}/memory.md`;
  const existingMemory = existsSync(memoryPath) ? readFileSync(memoryPath, "utf8").trim() : "";
  const updatedMemory = existingMemory ? `${existingMemory}\n\n${promoted}` : promoted;
  writeFileSync(memoryPath, updatedMemory + "\n");

  writeFileSync(stagingPath, "");

  const count = promoted.split("\n").filter((l) => l.trim().startsWith("- ")).length;
  log.info({ count }, "staged memories promoted to memory.md");
  return count;
}
