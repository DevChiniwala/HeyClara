"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        <div className="text-center mb-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[32px]">psychology</span>
          </div>
          <h1 className="text-display-lg font-display-lg text-on-surface mb-1">HeyClara</h1>
          <p className="text-body-base font-body-base text-on-surface-variant">
            {mode === "login" ? "Local daemon access" : "Initialize workspace"}
          </p>
        </div>

        <div className="space-y-4">
          {mode === "login" ? (
            <>
              <div className="space-y-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant block uppercase">Access Code</label>
                <input
                  type="password"
                  className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-log-mono text-[14px] focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                  placeholder="Enter local access code"
                />
              </div>
              <Button className="w-full justify-center py-3 text-sm">
                <span className="material-symbols-outlined mr-2 text-[18px]">lock_open</span>
                Unlock Dashboard
              </Button>
              <p className="text-center text-label-sm font-label-sm text-on-surface-variant">
                No code set?{" "}
                <button className="text-primary hover:underline" onClick={() => setMode("register")}>
                  Set up access
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant block uppercase">Create Access Code</label>
                <input
                  type="password"
                  className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-log-mono text-[14px] focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="space-y-2">
                <label className="text-label-caps font-label-caps text-on-surface-variant block uppercase">Confirm Code</label>
                <input
                  type="password"
                  className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface font-log-mono text-[14px] focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                  placeholder="Re-enter access code"
                />
              </div>
              <Button className="w-full justify-center py-3 text-sm">
                <span className="material-symbols-outlined mr-2 text-[18px]">how_to_reg</span>
                Initialize Workspace
              </Button>
              <p className="text-center text-label-sm font-label-sm text-on-surface-variant">
                Already configured?{" "}
                <button className="text-primary hover:underline" onClick={() => setMode("login")}>
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>

        <div className="mt-lg pt-4 border-t border-outline-variant/30 text-center">
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            Running in local mode &mdash; v0.5.0
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
