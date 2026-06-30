"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import Button from "@/components/ui/Button";

type SettingsTab = "general" | "backend" | "daemon" | "yaml" | "appearance";

const tabs: { key: SettingsTab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "backend", label: "Backend API" },
  { key: "daemon", label: "Daemon" },
  { key: "yaml", label: "YAML Config" },
  { key: "appearance", label: "Appearance" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoUpdate, setEnableAutoUpdate] = useState(false);

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Settings</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Manage account preferences, API configuration, and system-level parameters.
        </p>
      </header>

      <div className="flex gap-3 mb-xl overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-lg py-3 rounded-full text-label-caps font-label-caps uppercase whitespace-nowrap border transition-all ${
              activeTab === t.key
                ? "bg-brand-orange text-on-surface border-brand-orange shadow-md"
                : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-brand-orange hover:text-brand-orange"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && <GeneralTab />}
      {activeTab === "backend" && (
        <BackendTab
          enableNotifications={enableNotifications}
          setEnableNotifications={setEnableNotifications}
          enableAutoUpdate={enableAutoUpdate}
          setEnableAutoUpdate={setEnableAutoUpdate}
        />
      )}
      {activeTab === "daemon" && <DaemonTab />}
      {activeTab === "yaml" && <YamlTab />}
      {activeTab === "appearance" && <AppearanceTab />}
    </>
  );
}

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-xl py-4 border-b border-outline-variant/30 last:border-0">
      <div className="flex-1">
        <span className="text-body-bold font-body-bold text-on-surface block">{label}</span>
        {desc && <span className="text-label-sm font-label-sm text-on-surface-variant block mt-0.5">{desc}</span>}
      </div>
      <div className="text-right flex-shrink-0">{children}</div>
    </div>
  );
}

function TextInput({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  return (
    <input
      className="bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-log-mono text-[13px] w-64 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors text-right"
      defaultValue={defaultValue} placeholder={placeholder}
    />
  );
}

function SelectInput({ options }: { options: string[] }) {
  return (
    <select className="bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-body-base w-48 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function GeneralTab() {
  return (
    <GlassCard>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">General Settings</h2>
      <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
        Configure workspace name, default persona, and language preferences.
      </p>
      <Field label="Workspace Name" desc="Your instance identifier for multi-tenant setups.">
        <TextInput defaultValue="Clara-Default-Instance" />
      </Field>
      <Field label="Default Persona" desc="Fallback persona used when none is specified.">
        <SelectInput options={["Balanced Assistant", "Creative Mode", "Precise Mode"]} />
      </Field>
      <Field label="Language" desc="Global output language preference.">
        <SelectInput options={["English (US)", "English (UK)", "Spanish", "German", "French", "Japanese"]} />
      </Field>
    </GlassCard>
  );
}

function BackendTab({
  enableNotifications, setEnableNotifications,
  enableAutoUpdate, setEnableAutoUpdate,
}: {
  enableNotifications: boolean; setEnableNotifications: (v: boolean) => void;
  enableAutoUpdate: boolean; setEnableAutoUpdate: (v: boolean) => void;
}) {
  return (
    <div className="space-y-gutter">
      <GlassCard>
        <h2 className="text-headline-md font-headline-md text-on-surface mb-2">API Configuration</h2>
        <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
          Manage backend connection endpoints and authentication tokens.
        </p>
        <Field label="Endpoint URL" desc="The base REST API endpoint for the backend.">
          <TextInput defaultValue="http://localhost:8080/api/v1" />
        </Field>
        <Field label="API Key" desc="Authentication token for the backend API.">
          <TextInput defaultValue="sk-••••••••••••••••••••••••••" />
        </Field>
      </GlassCard>

      <GlassCard>
        <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Preferences</h2>
        <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
          Toggle to enable auxiliary features and automated processes.
        </p>
        <Field label="Enable Desktop Notifications">
          <ToggleSwitch checked={enableNotifications} onChange={() => setEnableNotifications(!enableNotifications)} />
        </Field>
        <Field label="Auto-update Daemon" desc="Automatically check for daemon updates on startup.">
          <ToggleSwitch checked={enableAutoUpdate} onChange={() => setEnableAutoUpdate(!enableAutoUpdate)} />
        </Field>
        <Field label="Enable Telemetry" desc="Send anonymous usage metrics to help improve the platform.">
          <ToggleSwitch checked={false} onChange={() => {}} />
        </Field>
      </GlassCard>

      <GlassCard>
        <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Danger Zone</h2>
        <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
          Irreversible actions. Proceed with caution.
        </p>
        <div className="flex justify-between items-center py-4">
          <div>
            <span className="text-body-bold font-body-bold text-error block">Reset All Settings</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Revert all settings to their default values.</span>
          </div>
          <Button variant="danger" onClick={() => alert("Resetting all settings...")}>Reset</Button>
        </div>
      </GlassCard>
    </div>
  );
}

function DaemonTab() {
  return (
    <GlassCard>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Daemon Configuration</h2>
      <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
        Tune daemon runtime behavior — resource thresholds, restart policies, and logging verbosity.
      </p>
      <Field label="Max Memory (MB)" desc="Hard limit for daemon heap allocation.">
        <TextInput defaultValue="4096" />
      </Field>
      <Field label="CPU Quota (%)" desc="Maximum CPU usage percentage.">
        <TextInput defaultValue="75" />
      </Field>
      <Field label="Log Level" desc="Verbosity of daemon logs.">
        <SelectInput options={["info", "debug", "warn", "error"]} />
      </Field>
      <Field label="Restart Policy" desc="Automatic restart on crash.">
        <SelectInput options={["Always", "On Failure", "Never"]} />
      </Field>
    </GlassCard>
  );
}

const yamlHtml = `<span style="color:#a78bfa">server</span>:
  <span style="color:#a78bfa">host</span>: &quot;<span style="color:#4ade80">0.0.0.0</span>&quot;
  <span style="color:#a78bfa">port</span>: <span style="color:#f97316">8080</span>

<span style="color:#a78bfa">database</span>:
  <span style="color:#a78bfa">host</span>: <span style="color:#f97316">localhost</span>
  <span style="color:#a78bfa">port</span>: <span style="color:#f97316">5432</span>
  <span style="color:#a78bfa">name</span>: &quot;<span style="color:#4ade80">clara_db</span>&quot;

<span style="color:#a78bfa">channels</span>:
  <span style="color:#a78bfa">telegram</span>:
    <span style="color:#a78bfa">enabled</span>: <span style="color:#f97316">true</span>
    <span style="color:#a78bfa">token</span>: &quot;<span style="color:#4ade80">{{TELEGRAM_TOKEN}}</span>&quot;
  <span style="color:#a78bfa">slack</span>:
    <span style="color:#a78bfa">enabled</span>: <span style="color:#f97316">false</span>

<span style="color:#a78bfa">logging</span>:
  <span style="color:#a78bfa">level</span>: <span style="color:#f97316">info</span>
  <span style="color:#a78bfa">format</span>: <span style="color:#f97316">json</span>

<span style="color:#a78bfa">resources</span>:
  <span style="color:#a78bfa">max_memory_mb</span>: <span style="color:#f97316">4096</span>
  <span style="color:#a78bfa">cpu_quota</span>: <span style="color:#f97316">75</span>`;

function YamlTab() {
  return (
    <GlassCard>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">YAML Configuration</h2>
      <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
        Directly edit the daemon YAML config file. Use environment variable placeholders for sensitive values.
      </p>
      <div className="relative">
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={() => alert("YAML validation passed")} className="px-3 py-1.5 bg-surface-container-high border border-outline-variant/50 rounded text-label-caps font-label-caps text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors uppercase text-[10px]">
            Validate
          </button>
          <button onClick={() => alert("YAML config saved")} className="px-3 py-1.5 bg-primary border border-primary rounded text-label-caps font-label-caps text-on-surface uppercase text-[10px]">
            Save
          </button>
        </div>
        <pre
          className="bg-[#0d0d0d] border border-outline-variant/50 rounded-xl p-6 overflow-x-auto text-log-mono font-log-mono text-[13px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: yamlHtml }}
        />
      </div>
    </GlassCard>
  );
}

function AppearanceTab() {
  return (
    <GlassCard>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Appearance</h2>
      <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
        Personalize your workspace theme, font, and density.
      </p>
      <Field label="Theme" desc="Choose between light, dark, or system default.">
        <SelectInput options={["Dark (Default)", "Light", "System"]} />
      </Field>
      <Field label="Primary Color" desc="Accent color for the interface.">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-orange border-2 border-white/20" />
          <span className="text-log-mono font-log-mono text-[13px] text-on-surface">#f97316</span>
        </div>
      </Field>
      <Field label="Font Scale" desc="Interface text size.">
        <SelectInput options={["Normal", "Large", "Compact"]} />
      </Field>
    </GlassCard>
  );
}
