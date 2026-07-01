"use client";

import { useState, useMemo } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPHealth, useMCPJobs } from "@/lib/use-mcp";
import { parseJobs } from "@/lib/parsers";

export default function SystemPage() {
  const health = useMCPHealth();
  const jobsRaw = useMCPJobs();
  const jobs = useMemo(() => jobsRaw.data ? parseJobs(jobsRaw.data) : [], [jobsRaw.data]);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const daemonOnline = health.data?.status === "ok";
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const disabledJobs = jobs.filter((j) => j.status === "disabled").length;
  const archivedJobs = jobs.filter((j) => j.status === "archived").length;

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">System</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Core infrastructure metrics, resource allocation, and system administration.
        </p>
        {health.error && (
          <div className="mt-md px-lg py-md rounded-lg bg-error/10 border border-error/20 text-error font-body-base">
            Daemon unreachable: {health.error}. Start the daemon with `clara start` or `clara web`.
          </div>
        )}
      </header>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Daemon Status</span>
            <span className="material-symbols-outlined text-primary">memory</span>
          </div>
          {health.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Status</span>
                <span className={`text-log-mono font-log-mono ${daemonOnline ? "text-primary" : "text-error"}`}>
                  {daemonOnline ? "Online" : "Offline"}
                </span>
              </div>
              {daemonOnline && (
                <>
                  <div className="flex justify-between items-end">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Version</span>
                    <span className="text-log-mono font-log-mono text-on-surface">{health.data?.version || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">MCP Port</span>
                    <span className="text-log-mono font-log-mono text-on-surface">{health.data?.mcpPort || "?"}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Database</span>
            <span className="material-symbols-outlined text-primary">dns</span>
          </div>
          <div className="space-y-3 relative z-10">
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">Status</span>
                <span className="text-primary font-log-mono text-[11px]">{daemonOnline ? "Connected" : "Unknown"}</span>
              </div>
              <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${daemonOnline ? "bg-primary w-1/4 shadow-[0_0_8px_#f97316]" : "bg-outline w-0"}`} />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">MCP Endpoint</span>
            <span className="material-symbols-outlined text-primary">api</span>
          </div>
          {health.loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Status</span>
                <div className="flex items-center text-primary">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${daemonOnline ? "bg-primary shadow-[0_0_5px_currentColor]" : "bg-error"}`} />
                  <span className="text-log-mono font-log-mono text-[12px]">{daemonOnline ? "Reachable" : "Offline"}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Port</span>
                <span className="text-log-mono font-log-mono text-on-surface">{health.data?.mcpPort || "?"}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Version</span>
                <span className="text-log-mono font-log-mono text-on-surface">{health.data?.version || "?"}</span>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Resources</span>
            <span className="material-symbols-outlined text-primary">bar_chart</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">Jobs</span>
                <span className="text-primary font-log-mono text-[11px]">{jobs.length} total</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[30%] rounded-full shadow-[0_0_5px_#f97316]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">Active / Total</span>
                <span className="text-primary font-log-mono text-[11px]">{activeJobs} / {jobs.length}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Active Engines + Job Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <GlassCard className="xl:col-span-7 flex flex-col overflow-hidden p-0">
          <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
            <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Job Subsystem</h2>
            {jobsRaw.loading && <Badge variant="info">Loading...</Badge>}
          </div>
          {jobsRaw.loading ? (
            <div className="p-lg space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="p-lg">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Total</span>
                  <span className="text-stat-lg font-stat-lg text-on-surface">{jobs.length}</span>
                </div>
                <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Active</span>
                  <span className="text-stat-lg font-stat-lg text-primary">{activeJobs}</span>
                </div>
                <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Disabled</span>
                  <span className="text-stat-lg font-stat-lg text-error">{disabledJobs}</span>
                </div>
                <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
                  <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Archived</span>
                  <span className="text-stat-lg font-stat-lg text-on-surface-variant">{archivedJobs}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="xl:col-span-5 flex flex-col p-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">System Info</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-4">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-2">Daemon</span>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Status</span>
                  <span className={`font-log-mono ${daemonOnline ? "text-primary" : "text-error"}`}>
                    {daemonOnline ? "Running" : "Stopped"}
                  </span>
                </div>
                {daemonOnline && (
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">MCP Port</span>
                    <span className="font-log-mono text-on-surface">{health.data?.mcpPort}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-4">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-2">Active Engines</span>
              <p className="text-sm text-on-surface-variant">
                Engine monitoring requires additional configuration. Set up active engine tracking to view real-time processor status.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Backups */}
      <GlassCard className="overflow-hidden p-0 relative">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary mr-3 text-[28px]">sd_storage</span>
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Backups</h2>
            </div>
          </div>
          <Button onClick={() => setShowBackupModal(true)} disabled>
            <span className="material-symbols-outlined mr-2 text-[18px] fill">add_circle</span>
            Create Backup
          </Button>
        </div>
        <div className="p-lg text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl block mb-2">inventory_2</span>
          <p className="text-body-base font-body-base">Backup functionality is not yet available. This feature will be added in a future release.</p>
        </div>
      </GlassCard>

      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)} title="Create System Backup">
        <p className="text-body-base font-body-base text-on-surface-variant mb-6">
          This feature is not yet implemented.
        </p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setShowBackupModal(false)}>Close</Button>
        </div>
      </Modal>
    </>
  );
}
