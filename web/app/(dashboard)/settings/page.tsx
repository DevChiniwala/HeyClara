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
          <Button variant="danger">Reset</Button>
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

function YamlTab() {
  const yamlContent = `server:
  host: "0.0.0.0"
  port: 8080

database:
  host: localhost
  port: 5432
  name: clara_db

channels:
  telegram:
    enabled: true
    token: "{{TELEGRAM_TOKEN}}"
  slack:
    enabled: false

logging:
  level: info
  format: json

resources:
  max_memory_mb: 4096
  cpu_quota: 75`;

  return (
    <GlassCard>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">YAML Configuration</h2>
      <p className="text-body-base font-body-base text-on-surface-variant mb-lg max-w-2xl">
        Directly edit the daemon YAML config file. Use environment variable placeholders for sensitive values.
      </p>
      <div className="relative">
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="px-3 py-1.5 bg-surface-container-high border border-outline-variant/50 rounded text-label-caps font-label-caps text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors uppercase text-[10px]">
            Validate
          </button>
          <button className="px-3 py-1.5 bg-primary border border-primary rounded text-label-caps font-label-caps text-on-surface uppercase text-[10px]">
            Save
          </button>
        </div>
        <pre className="bg-[#0d0d0d] border border-outline-variant/50 rounded-xl p-6 overflow-x-auto text-log-mono font-log-mono text-[13px] leading-relaxed">
{`1  <span class="text-purple-400">server</span>:
2    <span class="text-purple-400">host</span>: "<span class="text-green-400">0.0.0.0</span>"
3    <span class="text-purple-400">port</span>: <span class="text-primary">8080</span>
4
5  <span class="text-purple-400">database</span>:
6    <span class="text-purple-400">host</span>: <span class="text-primary">localhost</span>
7    <span class="text-purple-400">port</span>: <span class="text-primary">5432</span>
8    <span class="text-purple-400">name</span>: <span class="text-green-400">clara_db</span>
9
10 <span class="text-purple-400">channels</span>:
11   <span class="text-purple-400">telegram</span>:
12     <span class="text-purple-400">enabled</span>: <span class="text-primary">true</span>
13     <span class="text-purple-400">token</span>: "<span class="text-green-400">{{TELEGRAM_TOKEN}}</span>"
14   <span class="text-purple-400">slack</span>:
15     <span class="text-purple-400">enabled</span>: <span class="text-primary">false</span>
16
17 <span class="text-purple-400">logging</span>:
18   <span class="text-purple-400">level</span>: <span class="text-primary">info</span>
19   <span class="text-purple-400">format</span>: <span class="text-primary">json</span>
20
21 <span class="text-purple-400">resources</span>:
22   <span class="text-purple-400">max_memory_mb</span>: <span class="text-primary">4096</span>
23   <span class="text-purple-400">cpu_quota</span>: <span class="text-primary">75</span>`}
        </pre>
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
