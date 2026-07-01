import { ActiveEngine } from "../../db/models";

export async function listEngines(): Promise<string> {
  const engines = await ActiveEngine.list();
  if (engines.length === 0) return "No active engines.";
  return engines
    .map((e) => `- **${e.room}**: channel=${e.channel} startedAt=${e.startedAt}`)
    .join("\n");
}
