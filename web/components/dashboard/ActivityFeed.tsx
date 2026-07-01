"use client";

import { useState, useEffect, useRef } from "react";
import { mcp } from "@/lib/mcp";

interface LogEntry {
  time: string;
  level: string;
  msg: string;
}

const levelColor: Record<string, string> = {
  INFO: "text-primary",
  WARN: "text-yellow-400",
  ERROR: "text-error",
};

const levelBg: Record<string, string> = {
  INFO: "bg-primary/10 border-primary/20",
  WARN: "bg-yellow-400/10 border-yellow-400/20",
  ERROR: "bg-error/10 border-error/20",
};

function parseLogLine(raw: string): LogEntry | null {
  try {
    // Try JSON format first (pino logs)
    const parsed = JSON.parse(raw);
    const time = parsed.time ? new Date(parsed.time).toLocaleTimeString() : new Date().toLocaleTimeString();
    return { time, level: parsed.level || "INFO", msg: parsed.msg || raw };
  } catch {
    // Fallback: raw text line
    const now = new Date().toLocaleTimeString();
    const level = raw.includes("ERROR") ? "ERROR" : raw.includes("WARN") ? "WARN" : "INFO";
    return { time: now, level, msg: raw };
  }
}

export default function ActivityFeed() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const connect = async () => {
      try {
        const wsUrl = await mcp.getWsUrl();
        if (!mounted) return;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          if (!mounted) return;
          const entry = parseLogLine(event.data);
          if (entry) {
            setLogs((prev) => [...prev.slice(-99), entry]);
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (mounted) {
            retryTimeout = setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        // MCP not available, use polling fallback
        if (mounted) {
          retryTimeout = setTimeout(connect, 10000);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="glass-card rounded-xl flex flex-col h-[400px] overflow-hidden">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
        <h3 className="text-body-bold font-body-bold text-on-surface">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#f97316]" />
          <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-md space-y-1.5">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p className="text-body-base font-body-base">Awaiting daemon logs...</p>
            </div>
          </div>
        ) : (
          logs.toReversed().map((log, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 px-3 py-2 rounded-lg border ${levelBg[log.level] || "bg-surface-container-low border-transparent"} animate-fade-up`}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <span className={`text-log-mono font-log-mono text-[10px] flex-shrink-0 ${levelColor[log.level] || "text-on-surface-variant"}`}>
                {log.time}
              </span>
              <span className={`text-label-caps font-label-caps text-[10px] uppercase flex-shrink-0 ${levelColor[log.level] || ""}`}>
                {log.level}
              </span>
              <span className="text-log-mono font-log-mono text-[11px] text-on-surface-variant truncate">
                {log.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
