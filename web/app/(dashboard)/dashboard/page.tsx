"use client";

import { useMemo } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import McpStream from "@/components/dashboard/McpStream";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPHealth, useMCPJobs, useMCPSessions } from "@/lib/use-mcp";
import { parseJobs, parseSessions } from "@/lib/parsers";

export default function DashboardPage() {
  const health = useMCPHealth();
  const jobsRaw = useMCPJobs();
  const sessionsRaw = useMCPSessions(5);

  const jobs = useMemo(() => jobsRaw.data ? parseJobs(jobsRaw.data) : [], [jobsRaw.data]);
  const sessions = useMemo(() => sessionsRaw.data ? parseSessions(sessionsRaw.data) : [], [sessionsRaw.data]);
  const daemonOnline = health.data?.status === "ok";

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const totalJobs = jobs.length;

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Dashboard</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Real-time overview of your AI assistant, active tasks, and system telemetry.
        </p>
        {health.error && (
          <div className="mt-md px-lg py-md rounded-lg bg-error/10 border border-error/20 text-error font-body-base">
            Daemon unreachable: {health.error}
          </div>
        )}
      </header>

      {/* Animated Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {health.loading && jobsRaw.loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-xl p-lg">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Daemon Status"
              value={daemonOnline ? "Online" : "Offline"}
              icon="terminal"
              trend={daemonOnline ? "up" : "down"}
              sparklineData={undefined}
            />
            <StatCard
              label="Active Sessions"
              value={sessions.length}
              icon="chat"
              trend={sessions.length > 0 ? "up" : undefined}
              sparklineData={undefined}
            />
            <StatCard
              label="Scheduled Jobs"
              value={totalJobs}
              icon="work"
              trend={activeJobs > 0 ? "up" : undefined}
              sparklineData={undefined}
            />
            <StatCard
              label="System Health"
              value={daemonOnline ? "OK" : "Offline"}
              icon="monitor_heart"
              trend={daemonOnline ? "up" : "down"}
              sparklineData={undefined}
            />
          </>
        )}
      </div>

      {/* Activity Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        <div className="flex flex-col gap-md">
          <div className="glass-card rounded-xl p-lg flex-1 flex flex-col justify-center gap-md">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-sm">Quick Actions</h3>
            <Link
              href="/chat"
              className="w-full bg-primary text-on-primary font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] group"
            >
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined fill">add_comment</span>
                New Chat
              </span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              href="/jobs"
              className="w-full glass-card text-on-surface font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:border-primary/50 transition-all group"
            >
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined">schedule</span>
                Add Job
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              href="/history"
              className="w-full glass-card text-on-surface font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:border-primary/50 transition-all group"
            >
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined">manage_search</span>
                View History
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <McpStream />
        </div>
      </div>
    </>
  );
}
