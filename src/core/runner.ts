import { existsSync } from "fs";
import { homedir } from "os";
import { log } from "../utils/log";
import { getConfig } from "../utils/config";
import { getBackend, resolveBackends } from "../agent/registry";
import type { AgentBackend, AgentSession, AgentSessionContext, RunnerOutput } from "../agent/types";
import type { JobRow } from "../db/models/job";
import { ActiveEngine } from "../db/models";
import { buildSystemPrompt, buildContextSuffix } from "../chat/identity";
import { buildEmployeePrompt } from "../chat/employee-prompt";
import { getEmployee } from "./employees";
import { scanAgents } from "./agents";
import { buildJobPrompt } from "./job-prompt";
import { appendAudit, readState, writeState } from "../utils/logger";
import type { JobResult, ActivityCallback } from "../types/engine";
import type { AuditEntry, JobState } from "../types/audit";
import type { McpSourceContext } from "../mcp";
import { getMcpServers } from "../mcp";

/**
 * Consume an agent session's event stream and return structured output.
 */
async function consumeBackendRun(
  session: AgentSession,
  prompt: string,
  onActivity?: ActivityCallback,
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
  onActivity?: ActivityCallback,
): Promise<RunnerOutput> {
  let output: RunnerOutput = { agentText: "", sessionId: "", error: "no backend configured" };
  for (let i = 0; i < backends.length; i++) {
    const backend = backends[i]!;
    const session = await backend.openSession(sessionCtx);
    output = await consumeBackendRun(session, jobPrompt, onActivity);
    if (!output.providerDown) return output;
    const next = backends[i + 1];
    if (next) log.warn({ from: backend.name, to: next.name }, "provider down, failing over to next backend");
  }
  return output;
}

/**
 * One-shot job on the default backend.
 */
export async function runJobWithBackend(
  systemPrompt: string,
  jobPrompt: string,
  cwd: string = homedir(),
  onActivity?: ActivityCallback,
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
 * Run with failover across all configured backends.
 */
export async function runWithFailover(
  sessionCtx: AgentSessionContext,
  prompt: string,
  onActivity?: ActivityCallback,
): Promise<RunnerOutput> {
  return runJobAcrossBackends(resolveBackends(), sessionCtx, prompt, onActivity);
}

/**
 * Full job execution pipeline. Builds the system prompt, resolves the job
 * prompt, runs across the backend chain, records audit, and updates state.
 */
export async function runJob(job: JobRow, onActivity?: ActivityCallback): Promise<JobResult> {
  const config = getConfig();
  const timestamp = new Date().toISOString();
  const startMs = performance.now();
  const room = `job/${job.name}`;

  const state: Record<string, JobState> = { ...readState() };
  state[job.name] = { lastRun: timestamp, status: "running", duration_ms: 0 };
  writeState(state);
  await ActiveEngine.register(room, "job").catch(() => {});

  try {
    let cwd = homedir();
    let systemPrompt: string;
    let agentModel: string | undefined;

    if (job.employee) {
      const empPrompt = buildEmployeePrompt(job.employee, "job");
      systemPrompt = empPrompt || buildSystemPrompt("job");
      const emp = getEmployee(job.employee);
      if (emp?.model) agentModel = emp.model;
      if (emp?.repo && existsSync(emp.repo)) cwd = emp.repo;
    } else if (job.agent) {
      const agents = scanAgents();
      const agentDef = agents.find((a) => a.name === job.agent);
      if (agentDef) {
        systemPrompt = agentDef.body + "\n\n" + buildContextSuffix("job");
        agentModel = agentDef.model;
      } else {
        systemPrompt = buildSystemPrompt("job");
      }
    } else {
      systemPrompt = buildSystemPrompt("job");
    }

    const prompt = buildJobPrompt(job);
    const resolvedModel = job.model || agentModel || config.model;

    const jobSourceCtx: Record<string, unknown> = { jobName: job.name, channel: "system" };

    const sessionCtx: AgentSessionContext = {
      room,
      channel: "system",
      systemPrompt,
      cwd,
      model: resolvedModel,
      source: jobSourceCtx,
      resume: false,
    };

    const output = await runJobAcrossBackends(resolveBackends(), sessionCtx, prompt, onActivity);
    const duration_ms = Math.round(performance.now() - startMs);
    const ok = !output.error;

    const result: JobResult = {
      job: job.name,
      timestamp,
      status: ok ? "ok" : "error",
      result: output.agentText.trim(),
      duration_ms,
      session_id: output.sessionId || undefined,
      terminal_reason: output.terminalReason,
      error: output.error,
    };

    const auditEntry: AuditEntry = {
      job: result.job,
      timestamp: result.timestamp,
      status: result.status,
      result: result.result.slice(0, 2000),
      duration_ms: result.duration_ms,
      session_id: result.session_id,
      terminal_reason: result.terminal_reason,
      error: result.error,
    };
    appendAudit(auditEntry);

    const freshState = { ...readState() };
    freshState[job.name] = {
      lastRun: timestamp,
      status: result.status,
      duration_ms: result.duration_ms,
      error: result.error,
    };
    writeState(freshState);

    return result;
  } catch (err) {
    const duration_ms = Math.round(performance.now() - startMs);
    const errorMsg = err instanceof Error ? err.message : String(err);

    const result: JobResult = {
      job: job.name,
      timestamp,
      status: "error",
      result: "",
      duration_ms,
      error: errorMsg,
    };

    appendAudit({
      job: result.job, timestamp: result.timestamp, status: "error",
      result: "", duration_ms, error: errorMsg,
    });

    const freshState = { ...readState() };
    freshState[job.name] = { lastRun: timestamp, status: "error", duration_ms, error: errorMsg };
    writeState(freshState);

    return result;
  } finally {
    await ActiveEngine.unregister(room).catch(() => {});
  }
}
