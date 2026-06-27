import Link from "next/link";
import DaemonStatus from "@/components/layout/DaemonStatus";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-dots z-0 pointer-events-none" />
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <span className="material-symbols-outlined text-white text-2xl fill">bolt</span>
          </div>
          <h1 className="text-display-lg font-display-lg text-primary tracking-tight">HeyClara</h1>
        </div>
        <p className="text-headline-md font-headline-md text-on-surface">
          Your personal AI assistant daemon
        </p>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-lg mx-auto">
          Chat, scheduled jobs, persona system, and extensible skills — all running locally.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/dashboard"
            className="px-xl py-4 bg-primary text-on-primary font-body-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] text-lg"
          >
            Launch Dashboard
          </Link>
        </div>
        <DaemonStatus />
      </div>
    </div>
  );
}
