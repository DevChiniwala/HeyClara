"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { mcp } from "@/lib/mcp";

export default function DaemonStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await mcp.listTools();
        if (mounted) setStatus("online");
      } catch {
        if (mounted) setStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="flex items-center gap-2 justify-center text-on-surface-variant mt-8">
      <span className={cn(
        "w-2 h-2 rounded-full",
        status === "online" && "bg-primary animate-pulse shadow-[0_0_8px_#f97316]",
        status === "offline" && "bg-error",
        status === "checking" && "bg-on-surface-variant animate-pulse"
      )} />
      <span className="text-label-caps font-label-caps uppercase tracking-wider">
        Daemon: {status === "online" ? "Online" : status === "offline" ? "Offline" : "Checking..."}
      </span>
    </div>
  );
}
