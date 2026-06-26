import { existsSync } from "fs";
import { homedir } from "os";
import { buildSystemPrompt, buildContextSuffix, getSessionContext } from "./identity";
import { buildEmployeePrompt } from "./employee-prompt";
import { getEmployee } from "../core/employees";
import { scanAgents } from "../core/agents";
import { Session, Message, ActiveEngine } from "../db/models";
import type { Attachment, SendResult, SendCallbacks, ChatEngine, EngineOptions } from "../types";
import { finalizeSession, cancelPending } from "../core/finalizer";
import { log } from "../utils/log";
import { registerActiveHandle, unregisterActiveHandle } from "../core/active-handles";
import { resolveJobPrompt } from "../core/job-prompt";
import { resolveBackends } from "../agent/registry";
import type { AgentSession } from "../agent/types";
import type { JobRow } from "../db/models/job";

const IDLE_TIMEOUT = 10 * 60 * 1000;
const LONG_RUNNING_WARN = 30 * 60 * 1000;
const GENERIC_CHAT_ERROR = "??";

function getChatErrorSignal(error: string | null | undefined): "provider_down" | undefined {
  const e = error?.trim().toLowerCase();
  if (!e || e === "unknown error") return "provider_down";
  return undefined;
}

function formatChatError(rawError: string | null | undefined): string {
  const error = rawError?.trim();
  if (getChatErrorSignal(error) === "provider_down") return GENERIC_CHAT_ERROR;
  if (error === "oauth_org_not_allowed") return "[error] This Claude account is not allowed to access the configured organization.";
  return `[error] ${error}`;
}

export async function createChatEngine(opts: EngineOptions): Promise<ChatEngine> {
  const { room, channel, resume, mcpServers } = opts;
  let systemPrompt = buildSystemPrompt("chat", channel);

  const sessionContext = await getSessionContext(room);
  if (sessionContext) systemPrompt += "\n\n" + sessionContext;

  let cwd = homedir();
  let contextModel: string | null | undefined;

  if (opts.employee) {
    const empPrompt = buildEmployeePrompt(opts.employee);
    if (empPrompt) systemPrompt = empPrompt;
    const emp = getEmployee(opts.employee);
    contextModel = emp?.model;
    if (emp?.repo && existsSync(emp.repo)) cwd = emp.repo;
  } else if (opts.agent) {
    const agents = scanAgents();
    const agentDef = agents.find((a) => a.name === opts.agent);
    if (agentDef) {
      systemPrompt = agentDef.body + "\n\n" + buildContextSuffix("chat");
      contextModel = agentDef.model;
    }
  }

  const backends = resolveBackends();
  let backendIndex = 0;

  let sessionId: string | null = null;
  if (typeof resume === "string") {
    sessionId = resume;
  } else if (resume) {
    sessionId = await Session.getLatest(room);
  }

  if (sessionId && !(await backends[0]!.canResume(sessionId, cwd))) {
    sessionId = null;
  }

  let session: AgentSession | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let longRunningTimer: ReturnType<typeof setTimeout> | null = null;
  let messageCount = 0;
  let inFlight = false;

  function clearIdleTimer() {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
  }

  function resetIdleTimer() {
    clearIdleTimer();
    idleTimer = setTimeout(async () => {
      if (inFlight) return;
      if (sessionId && messageCount > 0) {
        finalizeSession(sessionId, room).catch((err) => {
          log.error({ err, room }, "finalization enqueue failed during idle teardown");
        });
      }
      await teardown();
    }, IDLE_TIMEOUT);
  }

  function clearLongRunningTimer() {
    if (longRunningTimer) { clearTimeout(longRunningTimer); longRunningTimer = null; }
  }

  function startLongRunningTimer() {
    clearLongRunningTimer();
    longRunningTimer = setTimeout(() => {
      log.warn({ room, elapsed: LONG_RUNNING_WARN / 1000 }, "engine request running for 30+ minutes");
    }, LONG_RUNNING_WARN);
  }

  async function teardown() {
    clearIdleTimer();
    clearLongRunningTimer();
    if (session) {
      await session.close().catch(() => {});
      session = null;
    }
    unregisterActiveHandle(room);
  }

  async function ensureSession(): Promise<AgentSession> {
    if (session) return session;
    const backend = backends[backendIndex] ?? backends[0]!;
    const s = await backend.openSession({
      room, channel, systemPrompt, cwd,
      model: contextModel ?? undefined,
      mcpServers,
      resume: sessionId ?? false,
      subagents: undefined,
      interactive: true,
    });
    registerActiveHandle(room, (reason) => s.abort(reason));
    session = s;
    return s;
  }

  return {
    get sessionId() { return sessionId; },
    get room() { return room; },

    async send(userMessage: string, callbacks?: SendCallbacks, attachments?: Attachment[]) {
      clearIdleTimer();
      startLongRunningTimer();
      inFlight = true;

      if (sessionId) cancelPending(sessionId).catch(() => {});

      await ActiveEngine.register(room, channel);

      let userSaved = false;
      if (sessionId) {
        await Message.save({ sessionId, room, sender: "user", content: userMessage, isFromAgent: false });
        await Session.touch(sessionId);
        userSaved = true;
        messageCount++;
      }

      let result: SendResult = { result: "", costUsd: 0, turns: 0 };

      while (true) {
        const sess = await ensureSession();
        let accumulated = "";
        let providerDown = false;

        try {
          for await (const ev of sess.send(userMessage, attachments)) {
            switch (ev.type) {
              case "session": {
                if (!sessionId || ev.backendSessionId !== sessionId) {
                  sessionId = ev.backendSessionId;
                  await Session.create(sessionId, room);
                }
                if (!userSaved) {
                  await Message.save({ sessionId, room, sender: "user", content: userMessage, isFromAgent: false });
                  userSaved = true;
                  messageCount++;
                }
                break;
              }
              case "text":
                accumulated += ev.delta;
                callbacks?.onStream?.(accumulated);
                break;
              case "thinking":
                callbacks?.onActivity?.(ev.delta);
                break;
              case "tool":
                callbacks?.onActivity?.(ev.summary ?? ev.name);
                break;
              case "result": {
                const costUsd = ev.usage.costUsd ?? 0;
                const turns = ev.usage.turns ?? 0;
                let messageId: number | undefined;
                if (sessionId && ev.text) {
                  messageId = await Message.save({
                    sessionId, room, sender: "clara", content: ev.text, isFromAgent: true,
                    deliveryStatus: "pending", metadata: ev.metadata,
                  }).catch(() => undefined);
                  await Session.touch(sessionId);
                  Session.accumulateMetadata(sessionId, { ...(ev.metadata ?? {}), channel }).catch(() => {});
                }
                result = { result: ev.text, costUsd, turns, messageId };
                break;
              }
              case "error": {
                providerDown = ev.providerDown;
                log.error({ room, error: ev.message, terminal_reason: ev.terminalReason }, "chat send failed");
                result = {
                  result: formatChatError(ev.message), costUsd: 0, turns: 0,
                  signal: ev.providerDown ? "provider_down" : undefined,
                };
                break;
              }
            }
          }
        } catch (err) {
          await ActiveEngine.unregister(room).catch(() => {});
          clearLongRunningTimer();
          inFlight = false;
          if (sess.backendSessionId) sessionId = sess.backendSessionId;
          throw err instanceof Error ? err : new Error(String(err));
        }

        if (sess.backendSessionId) sessionId = sess.backendSessionId;

        if (providerDown && backendIndex < backends.length - 1) {
          backendIndex++;
          log.warn({ room, to: backends[backendIndex]!.name }, "chat provider down, failing over");
          await teardown();
          sessionId = null;
          continue;
        }
        break;
      }

      await ActiveEngine.unregister(room);
      clearLongRunningTimer();
      inFlight = false;
      resetIdleTimer();
      return result;
    },

    async close() {
      if (sessionId && messageCount > 0 && !inFlight) {
        try { await finalizeSession(sessionId, room); } catch (err) {
          log.error({ err, room }, "finalization enqueue failed during close");
        }
      }
      await teardown();
      await ActiveEngine.unregister(room).catch(() => {});
    },
  };
}
