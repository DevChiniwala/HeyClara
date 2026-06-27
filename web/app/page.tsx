import Link from "next/link";
import DaemonStatus from "@/components/layout/DaemonStatus";
import ParticleField from "@/components/landing/ParticleField";
import Typewriter from "@/components/landing/Typewriter";
import FloatingElement from "@/components/landing/FloatingElement";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent animate-gradient-shift z-0 pointer-events-none" style={{ backgroundSize: "200% 200%" }} />
      <div className="fixed inset-0 bg-dots z-0 pointer-events-none" />
      <ParticleField />

      <FloatingElement shape="circle" size={120} x={5} y={15} duration={25} delay={0} />
      <FloatingElement shape="hexagon" size={80} x={88} y={20} duration={18} delay={2} color="rgba(249,115,22,0.06)" />
      <FloatingElement shape="ring" size={150} x={10} y={70} duration={22} delay={4} />
      <FloatingElement shape="dot-grid" size={100} x={85} y={75} duration={28} delay={1} color="rgba(249,115,22,0.1)" />
      <FloatingElement shape="circle" size={60} x={50} y={10} duration={15} delay={3} color="rgba(249,115,22,0.05)" />

      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-lg">
        <div className="flex items-center justify-center gap-3 mb-4 animate-fade-up">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center animate-breathe">
            <span className="material-symbols-outlined text-white text-3xl fill">bolt</span>
          </div>
          <h1 className="text-display-lg font-display-lg text-primary tracking-tight">HeyClara</h1>
        </div>

        <div className="h-12 flex items-center justify-center">
          <p className="text-headline-md font-headline-md text-on-surface">
            <Typewriter text="Your personal AI assistant daemon" speed={45} delay={300} />
          </p>
        </div>

        <div className="space-y-2 animate-fade-up" style={{ animationDelay: "2.5s", animationFillMode: "both" }}>
          <p className="text-body-base font-body-base text-on-surface-variant max-w-lg mx-auto">
            Chat, scheduled jobs, persona system, and extensible skills — all running locally.
          </p>
        </div>

        <div className="flex gap-4 justify-center pt-4 animate-fade-up" style={{ animationDelay: "3s", animationFillMode: "both" }}>
          <Link
            href="/dashboard"
            className="px-xl py-4 bg-primary text-on-primary font-body-bold rounded-lg hover:bg-primary/90 transition-all animate-breathe text-lg"
          >
            Launch Dashboard
          </Link>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "3.5s", animationFillMode: "both" }}>
          <DaemonStatus />
        </div>
      </div>
    </div>
  );
}
