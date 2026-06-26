import type { AgentBackend } from "./types";
import { ClaudeBackend } from "./backends/claude";
import { CodexBackend } from "./backends/codex";
import { getConfig } from "../utils/config";

let claudeBackend: ClaudeBackend | null = null;
let codexBackend: CodexBackend | null = null;
let override: AgentBackend | null = null;
let chainOverride: AgentBackend[] | null = null;

export function getBackend(name?: "claude" | "codex" | "gemini"): AgentBackend {
  if (override) return override;
  if (name === "codex") {
    if (!codexBackend) codexBackend = new CodexBackend();
    return codexBackend;
  }
  if (!claudeBackend) claudeBackend = new ClaudeBackend();
  return claudeBackend;
}

export function setBackend(backend: AgentBackend | null): void {
  override = backend;
}

export function setBackendChain(backends: AgentBackend[] | null): void {
  chainOverride = backends;
}

export function resolveBackends(): AgentBackend[] {
  if (chainOverride) return chainOverride;
  if (override) return [override];
  const cfg = getConfig();
  const seen = new Set<string>();
  const names = [cfg.runner, ...cfg.fallback].filter((n) => !seen.has(n) && seen.add(n));
  return names.map((n) => getBackend(n));
}
