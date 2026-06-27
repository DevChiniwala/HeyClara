import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import McpStream from "@/components/dashboard/McpStream";

const sparklineUp = [10, 25, 18, 32, 28, 40, 55];
const sparklineFlat = [5, 8, 6, 9, 7, 10, 8];
const sparklineDown = [80, 72, 65, 70, 58, 50, 45];

export default function DashboardPage() {
  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Dashboard</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Real-time overview of your AI assistant, active tasks, and system telemetry.
        </p>
      </header>

      {/* Animated Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard label="Daemon Status" value="Online" icon="terminal" trend="up" sparklineData={sparklineUp} />
        <StatCard label="Active Sessions" value={3} icon="chat" sparklineData={sparklineFlat} />
        <StatCard label="Scheduled Jobs" value={7} icon="work" sparklineData={sparklineDown} />
        <StatCard label="System Health" value="98%" icon="monitor_heart" trend="up" sparklineData={sparklineUp} />
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
