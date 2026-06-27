export default function DashboardPage() {
  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Dashboard</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Real-time overview of your AI assistant, active tasks, and system telemetry.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="glass-card rounded-xl p-lg flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Daemon Status</span>
            <span className="material-symbols-outlined text-primary">terminal</span>
          </div>
          <div className="flex items-center gap-md">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#f97316]" />
            <div>
              <h2 className="text-stat-lg font-stat-lg text-on-surface tracking-tight">Online</h2>
              <p className="text-log-mono font-log-mono text-on-surface-variant mt-1">v0.5.0-local</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Active Sessions</span>
            <span className="material-symbols-outlined text-primary">chat</span>
          </div>
          <div>
            <h2 className="text-stat-lg font-stat-lg text-on-surface">0</h2>
            <p className="text-body-base font-body-base text-primary mt-1">No active sessions</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Scheduled Jobs</span>
            <span className="material-symbols-outlined text-primary">work</span>
          </div>
          <div>
            <h2 className="text-stat-lg font-stat-lg text-on-surface">0</h2>
            <p className="text-body-base font-body-base text-on-surface-variant mt-1">No jobs scheduled</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">System Health</span>
            <span className="material-symbols-outlined text-on-surface-variant">memory</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-log-mono font-log-mono text-xs mb-1">
                <span className="text-on-surface-variant">CPU</span>
                <span className="text-primary">0%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-log-mono font-log-mono text-xs mb-1">
                <span className="text-on-surface-variant">RAM</span>
                <span className="text-primary">0GB</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 glass-card rounded-xl flex flex-col h-[400px]">
          <div className="p-md border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-body-bold font-body-bold text-on-surface">Recent Activity</h3>
            <button className="text-label-caps font-label-caps text-primary hover:text-primary/80 transition-colors uppercase">
              View All
            </button>
          </div>
          <div className="p-md flex-1 overflow-y-auto flex items-center justify-center">
            <div className="text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
              <p className="text-body-base font-body-base">No activity yet. Start a chat or add a job.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md">
          <div className="glass-card rounded-xl p-lg flex-1 flex flex-col justify-center gap-md">
            <h3 className="text-label-caps font-label-caps text-on-surface-variant uppercase mb-sm">Quick Actions</h3>
            <button className="w-full bg-primary text-on-primary font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined fill">add_comment</span>
                New Chat
              </span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="w-full glass-card text-on-surface font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:border-primary/50 transition-all">
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined">schedule</span>
                Add Job
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
            </button>
            <button className="w-full glass-card text-on-surface font-body-bold py-md px-lg rounded-lg flex items-center justify-between hover:border-primary/50 transition-all">
              <span className="flex items-center gap-sm">
                <span className="material-symbols-outlined">manage_search</span>
                View History
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
            </button>
          </div>

          <div className="glass-card rounded-xl p-md h-40 flex flex-col">
            <div className="flex justify-between items-center mb-2 border-b border-outline-variant pb-2">
              <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Live MCP Stream</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col justify-end text-log-mono font-log-mono text-[10px] space-y-1">
              <div className="text-on-surface-variant">[--:--:--] <span className="text-primary">INFO</span> Awaiting daemon connection...</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
