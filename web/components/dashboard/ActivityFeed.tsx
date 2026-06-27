"use client";

import { useState, useEffect } from "react";

const mockLogs = [
  { time: "14:23:45", level: "INFO", msg: "Daemon started (pid: 3516)" },
  { time: "14:23:46", level: "INFO", msg: "MCP endpoint started on port 58109" },
  { time: "14:23:46", level: "INFO", msg: "Scheduler started (60s poll interval)" },
  { time: "14:24:01", level: "INFO", msg: "alive heartbeat OK" },
  { time: "14:25:00", level: "INFO", msg: "Memory usage: 245MB / 4096MB" },
  { time: "14:25:46", level: "INFO", msg: "alive heartbeat OK" },
  { time: "14:26:46", level: "WARN", msg: "Job memory-promoter: prompt file missing, skipping" },
  { time: "14:27:01", level: "INFO", msg: "alive heartbeat OK" },
  { time: "14:28:01", level: "INFO", msg: "alive heartbeat OK" },
  { time: "14:28:30", level: "ERROR", msg: "Channel telegram: connection timeout" },
];

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

export default function ActivityFeed() {
  const [logs] = useState(mockLogs);

  return (
    <div className="glass-card rounded-xl flex flex-col h-[400px] overflow-hidden">
      <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
        <h3 className="text-body-bold font-body-bold text-on-surface">Recent Activity</h3>
        <button className="text-label-caps font-label-caps text-primary hover:text-primary/80 transition-colors uppercase">
          View All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-md space-y-1.5">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p className="text-body-base font-body-base">No activity yet.</p>
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
