import type { AgentEvent } from "../types";

export function normalizeSdkEvent(msg: unknown): AgentEvent[] {
  const raw = msg as Record<string, unknown>;
  const type = raw.type as string | undefined;

  if (!type) return [];

  switch (type) {
    case "session": {
      const id = raw.backendSessionId || raw.sessionId;
      return id ? [{ type: "session", backendSessionId: String(id) }] : [];
    }
    case "text":
      return [{ type: "text", delta: String(raw.delta || raw.text || "") }];
    case "thinking":
      return [{ type: "thinking", delta: String(raw.delta || raw.text || "") }];
    case "tool":
      return [{ type: "tool", name: String(raw.name || ""), summary: raw.summary ? String(raw.summary) : undefined }];
    case "result":
      return [
        {
          type: "result",
          text: String(raw.text || ""),
          usage: {
            costUsd: Number(raw.cost_usd || raw.usage?.costUsd || 0),
            turns: Number(raw.turns || raw.usage?.turns || 0),
          },
          backendSessionId: String(raw.backendSessionId || raw.sessionId || ""),
          terminalReason: raw.terminalReason ? String(raw.terminalReason) : undefined,
          metadata: (raw.metadata as Record<string, unknown>) || undefined,
        },
      ];
    case "error":
      return [
        {
          type: "error",
          message: String(raw.message || raw.error || "Unknown error"),
          retryable: raw.retryable === true,
          providerDown: raw.providerDown === true,
          terminalReason: raw.terminalReason ? String(raw.terminalReason) : undefined,
        },
      ];
    default:
      return [];
  }
}
