"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface MCPState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseMCPOptions {
  /** Skip fetching on mount */
  skip?: boolean;
  /** Polling interval in ms */
  pollInterval?: number;
}

type Parser<T> = (raw: string) => T;

export function useMCP<T = string>(
  endpoint: string,
  parser?: Parser<T>,
  options: UseMCPOptions = {}
) {
  const [state, setState] = useState<MCPState<T>>({ data: null, loading: !options.skip, error: null });
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const resp = await fetch(endpoint);
      if (!resp.ok) {
        const text = await resp.text().catch(() => "Unknown error");
        throw new Error(`${resp.status}: ${text}`);
      }
      const raw = await resp.text();
      const parsed = parser ? parser(raw) : (raw as unknown as T);
      if (mountedRef.current) {
        setState({ data: parsed, loading: false, error: null });
      }
    } catch (err) {
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }, [endpoint, parser]);

  useEffect(() => {
    mountedRef.current = true;
    if (!options.skip) {
      fetchData();
      if (options.pollInterval) {
        const interval = setInterval(fetchData, options.pollInterval);
        return () => { mountedRef.current = false; clearInterval(interval); };
      }
    }
    return () => { mountedRef.current = false; };
  }, [fetchData, options.skip, options.pollInterval]);

  return { ...state, refetch: fetchData };
}

export function useMCPHealth() {
  return useMCP<{ status: string; version: string; mcpPort: number }>(
    "/api/health",
    (raw) => JSON.parse(raw),
    { pollInterval: 15000 }
  );
}

export function useMCPSessions(limit = 20) {
  return useMCP(`/api/sessions?limit=${limit}`, undefined, { pollInterval: 30000 });
}

export function useMCPJobs() {
  return useMCP("/api/jobs", undefined, { pollInterval: 30000 });
}

export function useMCPMessages(limit = 50) {
  return useMCP(`/api/messages?limit=${limit}`, undefined, { pollInterval: 30000 });
}

export function useMCPSessionMessages(sessionId: string | null) {
  return useMCP(sessionId ? `/api/sessions/${sessionId}` : "", undefined, { skip: !sessionId });
}

export function useMCPAgents() {
  return useMCP("/api/agents", undefined, { pollInterval: 60000 });
}

export function useMCPEmployees() {
  return useMCP("/api/employees", undefined, { pollInterval: 60000 });
}

export function useMCPMemory() {
  return useMCP("/api/memory", undefined, { pollInterval: 30000 });
}
