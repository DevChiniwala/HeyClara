import { log } from "../utils/log";
import { getConfig } from "../utils/config";
import { Message, Session, Finalization } from "../db/models";
import { generateSessionSummary } from "./summarizer";
import { consolidateMemory } from "./consolidator";

export { Finalization };

export async function processPending(): Promise<void> {
  const config = getConfig();
  if (!config.sessionFinalization.enabled) {
    const count = await Finalization.countPending();
    if (count > 0) {
      log.info({ count }, "session finalization disabled, skipping pending requests");
    }
    return;
  }

  const memoryEnabled = config.sessionFinalization.memoryConsolidation;
  const summariesEnabled = config.sessionFinalization.summaries;

  while (true) {
    const request = await Finalization.dequeue();
    if (!request) break;

    log.info({ sessionId: request.sessionId, room: request.room }, "processing finalization");

    try {
      if (summariesEnabled) {
        const messages = await Message.getBySession(request.sessionId);
        if (messages.length > 0) {
          const transcript = messages.map((m) => `${m.sender}: ${m.content}`).join("\n");
          const summary = await generateSessionSummary(request.sessionId, transcript);
          if (summary) {
            await Session.setSummary(request.sessionId, summary);
          }
        }
      }

      if (memoryEnabled) {
        const messages = await Message.getBySession(request.sessionId);
        if (messages.length > 0) {
          const transcript = messages
            .filter((m) => m.sender === "nia" || m.sender === "user")
            .map((m) => `${m.sender}: ${m.content}`)
            .join("\n");
          await consolidateMemory(transcript);
        }
      }

      await Finalization.complete(request.id);
      log.info({ sessionId: request.sessionId }, "finalization completed");
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      log.error({ sessionId: request.sessionId, error }, "finalization failed");
      await Finalization.fail(request.id, error);
    }
  }
}

export async function finalizeSession(sessionId: string, room: string): Promise<void> {
  await Finalization.enqueue(sessionId, room);
  try {
    const sql = (await import("../db/connection")).getSql();
    await sql`SELECT pg_notify('clara_finalize', '')`;
  } catch {
    // notification channel may not be available; processPending will handle it
  }
}

export async function cancelPending(sessionId: string): Promise<void> {
  await Finalization.cancelPending(sessionId);
}

export async function cleanupOldRequests(): Promise<void> {
  const sql = (await import("../db/connection")).getSql();
  await sql`
    DELETE FROM finalization_requests
    WHERE created_at < NOW() - INTERVAL '7 days'
      AND status IN ('completed', 'failed', 'cancelled')
  `;
}
