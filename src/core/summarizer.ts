import { homedir } from "os";
import { runJobWithBackend } from "./runner";
import { log } from "../utils/log";

export async function generateSessionSummary(sessionId: string, messages: string): Promise<string> {
  const systemPrompt = [
    "You are a session summarizer. Create a concise summary of the conversation below.",
    "Focus on: key decisions made, action items, user preferences revealed, and important context.",
    "Keep the summary under 200 words. Write in third person.",
  ].join("\n");

  const result = await runJobWithBackend(systemPrompt, `Summarize this conversation:\n\n${messages}`, homedir());

  if (result.error) {
    log.warn({ sessionId, error: result.error }, "session summary generation failed");
    return "";
  }

  return result.agentText.trim();
}
