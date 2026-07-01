"use client";

import { useState, useEffect, useRef } from "react";
import { mcp } from "@/lib/mcp";

export default function McpStream() {
  const [lines, setLines] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

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
          const raw = typeof event.data === "string" ? event.data : "";
          const time = new Date().toLocaleTimeString();
          let level = "INFO";
          let msg = raw;
          try {
            const parsed = JSON.parse(raw);
            msg = parsed.msg || raw;
            level = parsed.level || "INFO";
          } catch { /* raw text */ }
          const levelClass = level === "WARN" ? "text-yellow-400" : level === "ERROR" ? "text-error" : "text-primary";
          setLines((prev) => [...prev.slice(-49), `[${time}] <span class="${levelClass}">${level}</span> ${msg}`]);
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (mounted) retryTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => ws.close();
      } catch {
        if (mounted) retryTimeout = setTimeout(connect, 10000);
      }
    };

    connect();
    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };
  }, []);

  const parseLine = (line: string) => {
    if (!line) return { time: "", level: "INFO", levelClass: "text-primary", msg: "" };
    const match = line.match(/^\[(.+?)\]\s*<span class="(.+?)">(.+?)<\/span>\s(.+)$/);
    if (!match) return { time: "", level: "INFO", levelClass: "text-primary", msg: line };
    return { time: match[1], level: match[3], levelClass: match[2], msg: match[4] };
  };

  return (
    <div className="glass-card rounded-xl p-md h-40 flex flex-col">
      <div className="flex justify-between items-center mb-2 border-b border-outline-variant pb-2">
        <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Live MCP Stream</span>
        <div className="flex items-center gap-2">
          <span className="text-label-caps font-label-caps text-on-surface-variant text-[10px]">{lines.length} calls</span>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col justify-end text-log-mono font-log-mono text-[10px] space-y-0.5">
        {lines.length === 0 ? (
          <div className="text-on-surface-variant">[--:--:--] <span className="text-primary">INFO</span> Awaiting daemon connection...</div>
        ) : (
          lines.map((line, i) => {
            const p = parseLine(line);
            return (
              <div key={i} className="animate-fade-up" style={{ animationDuration: "0.3s" }}>
                <span className="text-on-surface-variant">[{p.time}]</span>{" "}
                <span className={p.levelClass}>{p.level}</span> {p.msg}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
