"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatRelativeTime } from "@/lib/utils";

const mockEngines = [
  { room: "wsp_a7x9_core", channel: "Slack Sync", startedAt: new Date(Date.now() - 3600000), lastPing: new Date(Date.now() - 2000) },
  { room: "req_b4v2_nlp", channel: "Inference Node", startedAt: new Date(Date.now() - 7200000), lastPing: new Date(Date.now() - 12000) },
  { room: "idx_c1m9_vec", channel: "Vector Store", startedAt: new Date(Date.now() - 86400000), lastPing: new Date(Date.now() - 45000) },
];

const mockBackups = [
  { filename: "sys_snap_20231024_1400.tar.gz", size: "4.2 GB", createdAt: new Date() },
  { filename: "sys_snap_20231023_0000.tar.gz", size: "4.1 GB", createdAt: new Date(Date.now() - 86400000) },
];

export default function SystemPage() {
  const [showBackupModal, setShowBackupModal] = useState(false);

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">System</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Core infrastructure metrics, resource allocation, and system administration.
        </p>
      </header>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Daemon Status</span>
            <span className="material-symbols-outlined text-primary">memory</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">PID</span>
              <span className="text-log-mono font-log-mono text-on-surface">8492</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Uptime</span>
              <span className="text-log-mono font-log-mono text-on-surface">14d 08h 22m</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Version</span>
              <span className="text-log-mono font-log-mono text-on-surface">v0.5.0-local</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Database</span>
            <span className="material-symbols-outlined text-primary">dns</span>
          </div>
          <div className="space-y-3 relative z-10">
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">Response Time</span>
                <span className="text-primary font-log-mono text-[11px]">12ms</span>
              </div>
              <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/4 rounded-full shadow-[0_0_8px_#f97316]" />
              </div>
            </div>
            <div className="flex justify-between items-end pt-1">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Connections</span>
              <span className="text-log-mono font-log-mono text-on-surface">42 / 100</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">MCP Endpoint</span>
            <span className="material-symbols-outlined text-primary">api</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Status</span>
              <div className="flex items-center text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 shadow-[0_0_5px_currentColor]" />
                <span className="text-log-mono font-log-mono text-[12px]">Reachable</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Port</span>
              <span className="text-log-mono font-log-mono text-on-surface">8080</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Active Tools</span>
              <span className="text-log-mono font-log-mono text-on-surface">24</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between hover:border-error/40">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Resources</span>
            <span className="material-symbols-outlined text-error">bar_chart</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">CPU</span>
                <span className="text-error font-log-mono text-[11px]">87%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-error w-[87%] rounded-full shadow-[0_0_8px_#ffb4ab]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-caps font-label-caps mb-1">
                <span className="text-on-surface-variant uppercase">RAM</span>
                <span className="text-primary font-log-mono text-[11px]">24GB / 32GB</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%] rounded-full shadow-[0_0_5px_#f97316]" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Active Engines + Job Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        <GlassCard className="xl:col-span-7 flex flex-col overflow-hidden p-0">
          <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low/60">
            <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Active Engines</h2>
            <Badge variant="active">LIVE</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-lowest/80 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-lg font-medium">Room</th>
                  <th className="py-3 px-4 font-medium">Channel</th>
                  <th className="py-3 px-4 font-medium">Started At</th>
                  <th className="py-3 px-4 font-medium">Last Ping</th>
                  <th className="py-3 px-lg font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-body-base font-body-base">
                {mockEngines.map((e) => (
                  <tr key={e.room} className="hover:bg-surface-variant/40 transition-colors group">
                    <td className="py-3 px-lg text-log-mono font-log-mono text-primary text-[13px]">{e.room}</td>
                    <td className="py-3 px-4 text-on-surface">{e.channel}</td>
                    <td className="py-3 px-4 text-log-mono font-log-mono text-on-surface-variant text-[12px]">
                      {formatRelativeTime(e.startedAt)}
                    </td>
                    <td className="py-3 px-4 text-log-mono font-log-mono text-primary text-[12px]">
                      {formatRelativeTime(e.lastPing)}
                    </td>
                    <td className="py-3 px-lg text-right">
                      <button className="px-3 py-1 text-label-caps font-label-caps border border-error/50 text-error rounded hover:bg-error hover:text-on-error transition-colors uppercase">
                        Disconnect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-5 flex flex-col p-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-md font-headline-md text-on-surface text-[18px]">Job Subsystem</h2>
            <button onClick={() => alert("Recovering stale jobs...")} className="text-label-caps font-label-caps uppercase px-3 py-1.5 rounded bg-surface-container border border-outline-variant text-on-surface hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">healing</span>
              Recover Stale
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Total</span>
              <span className="text-stat-lg font-stat-lg text-on-surface">1,204</span>
            </div>
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Active</span>
              <span className="text-stat-lg font-stat-lg text-primary">42</span>
            </div>
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Disabled</span>
              <span className="text-stat-lg font-stat-lg text-error">3</span>
            </div>
            <div className="bg-surface-container-highest/50 border border-outline-variant/50 rounded-lg p-3">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase block mb-1">Archived</span>
              <span className="text-stat-lg font-stat-lg text-on-surface-variant">8.4k</span>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-3 border-b border-outline-variant/50 pb-2">Recent Failures</h3>
            <div className="flex justify-between items-center p-2 rounded bg-error/10 border border-error/20">
              <div className="flex flex-col">
                <span className="text-log-mono font-log-mono text-[12px] text-error">ERR_TIMEOUT: wkr_8x</span>
                <span className="text-label-caps font-label-caps text-on-surface-variant">2 mins ago</span>
              </div>
              <button onClick={() => alert("Retrying job...")} className="px-2 py-1 bg-surface-container border border-outline-variant rounded text-[11px] font-bold text-on-surface hover:text-primary hover:border-primary/50 transition-colors">
                RETRY
              </button>
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
          <Button onClick={() => setShowBackupModal(true)}>
            <span className="material-symbols-outlined mr-2 text-[18px] fill">add_circle</span>
            Create Backup
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/80 text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-lg font-medium">Filename</th>
                <th className="py-3 px-4 font-medium">Size</th>
                <th className="py-3 px-4 font-medium">Created At</th>
                <th className="py-3 px-lg font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {mockBackups.map((b) => (
                <tr key={b.filename} className="hover:bg-surface-variant/40 transition-colors group">
                  <td className="py-3 px-lg flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">description</span>
                    <span className="text-log-mono font-log-mono text-on-surface text-[13px]">{b.filename}</span>
                  </td>
                  <td className="py-3 px-4 text-log-mono font-log-mono text-on-surface-variant text-[12px]">{b.size}</td>
                  <td className="py-3 px-4 text-log-mono font-log-mono text-on-surface-variant text-[12px]">
                    {formatRelativeTime(b.createdAt)}
                  </td>
<td className="py-3 px-lg text-right space-x-2">
                      <button onClick={() => alert("Restoring backup...")} className="text-label-caps font-label-caps text-primary hover:text-primary/80 transition-colors uppercase px-2 py-1">
                        Restore
                      </button>
                      <button onClick={() => alert("Deleting backup...")} className="text-label-caps font-label-caps text-on-surface-variant hover:text-error transition-colors uppercase px-2 py-1">
                        Delete
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)} title="Create System Backup">
        <p className="text-body-base font-body-base text-on-surface-variant mb-6">
          This will create a compressed snapshot of the current state, including active models, vectorized knowledge, and configuration.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setShowBackupModal(false)}>Cancel</Button>
          <Button onClick={() => setShowBackupModal(false)}>Confirm Backup</Button>
        </div>
      </Modal>
    </>
  );
}
