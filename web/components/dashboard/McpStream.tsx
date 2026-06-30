"use client";

import { useState, useEffect, useRef } from "react";

const mockStream = [
  "[14:28:30] <span class=\"text-primary\">INFO</span> MCP call: list_jobs (2ms)",
  "[14:28:35] <span class=\"text-primary\">INFO</span> MCP call: list_channels (1ms)",
  "[14:29:01] <span class=\"text-primary\">INFO</span> alive heartbeat OK",
  "[14:29:15] <span class=\"text-yellow-400\">WARN</span> Job memory-promoter: skipped",
  "[14:29:30] <span class=\"text-primary\">INFO</span> MCP call: list_tools (0.5ms)",
];

export default function McpStream() {
  const [lines, setLines] = useState<string[]>([]);
  const idx = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (idx.current < mockStream.length) {
        setLines((prev) => [...prev, mockStream[idx.current]]);
        idx.current++;
      }
    }, 3000);
    return () => clearInterval(interval);
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
