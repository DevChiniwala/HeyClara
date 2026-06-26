import { homedir } from "os";
import { log } from "../utils/log";
import { getConfig } from "../utils/config";
import { getBackend, resolveBackends } from "../agent/registry";
import type { AgentBackend, AgentSession, AgentSessionContext, RunnerOutput } from "../agent/types";

/**
 * Consume an agent session's event stream and return structured output.
 * This is the core loop that every backend funnels through — it normalizes
 * streaming text, thinking, tool calls, and terminal errors into a single
 * RunnerOutput shape consumed by jobs, chat, and background tasks.
 */
async function consumeBackendRun(
  session: AgentSession,
  prompt: string,
  onActivity?: (text: string) => void,
  activeRoom?: string,
): Promise<RunnerOutput> {
  let agentText = "";
  let terminalReason: string | undefined;
  let error: string | undefined;
  let providerDown = false;

  try {
    for await (const ev of session.send(prompt)) {
      switch (ev.type) {
        case "thinking":
          onActivity?.(ev.delta);
          break;
        case "tool":
          onActivity?.(ev.summary ?? ev.name);
          break;
        case "result":
          agentText = ev.text;
          terminalReason = ev.terminalReason;
          break;
        case "error":
          error = ev.message;
          terminalReason = ev.terminalReason;
          providerDown = ev.providerDown;
          break;
      }
    }
  } catch (err) {
    return {
      agentText: "",
      sessionId: session.backendSessionId ?? "",
      terminalReason: "aborted",
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await session.close();
  }

  return { agentText, sessionId: session.backendSessionId ?? "", terminalReason, error, providerDown };
}

/**
 * Run a job across the ordered backend chain: try the primary, and on a
 * provider-down result fail over to the next backend, replaying the same prompt.
 */
export async function runJobAcrossBackends(
  backends: AgentBackend[],
  sessionCtx: AgentSessionContext,
  jobPrompt: string,
  onActivity?: (text: string) => void,
): Promise<RunnerOutput> {
  let output: RunnerOutput = { agentText: "", sessionId: "", error: "no backend configured" };
  for (let i = 0; i < backends.length; i++) {
    const backend = backends[i]!;
    const session = await backend.openSession(sessionCtx);
    output = await consumeBackendRun(session, jobPrompt, onActivity);
    if (!output.providerDown) return output;
    const next = backends[i + 1];
    if (next) {
      log.warn({ from: backend.name, to: next.name }, "provider down, failing over to next backend");
    }
  }
  return output;
}

/**
 * One-shot job on the default backend. This is the primary entry point for
 * scheduled jobs, background tasks, and CLI `run` commands.
 */
export async function runJobWithBackend(
  systemPrompt: string,
  jobPrompt: string,
  cwd: string = homedir(),
  onActivity?: (text: string) => void,
  model?: string,
  source?: Record<string, unknown>,
): Promise<RunnerOutput> {
  const session = await getBackend().openSession({
    room: `_oneshot/${crypto.randomUUID()}`,
    channel: "system",
    systemPrompt,
    cwd,
    model,
    source,
    resume: false,
  });
  return consumeBackendRun(session, jobPrompt, onActivity);
}

/**
 * Run the same prompt across all configured backends with provider-down failover.
 * Used by the chat engine and job scheduler.
 */
export async function runWithFailover(
  sessionCtx: AgentSessionContext,
  prompt: string,
  onActivity?: (text: string) => void,
): Promise<RunnerOutput> {
  return runJobAcrossBackends(resolveBackends(), sessionCtx, prompt, onActivity);
}
