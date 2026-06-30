"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import Button from "@/components/ui/Button";

interface ChannelState {
  name: string;
  icon: string;
  subtitle: string;
  enabled: boolean;
  expanded: boolean;
}

const channels: ChannelState[] = [
  { name: "Telegram", icon: "send", subtitle: "Messaging Bot", enabled: true, expanded: true },
  { name: "Slack", icon: "forum", subtitle: "Workspace App", enabled: false, expanded: false },
  { name: "Twilio", icon: "call", subtitle: "Voice & SMS API", enabled: true, expanded: false },
  { name: "SMS", icon: "sms", subtitle: "Provider", enabled: false, expanded: false },
  { name: "WhatsApp", icon: "chat", subtitle: "Business API", enabled: true, expanded: false },
  { name: "Voice", icon: "mic", subtitle: "Speech API", enabled: true, expanded: false },
];

export default function ChannelsPage() {
  const [channelStates, setChannelStates] = useState(channels);

  const toggleChannel = (idx: number) => {
    setChannelStates(prev => prev.map((c, i) => i === idx ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleExpand = (idx: number) => {
    setChannelStates(prev => prev.map((c, i) => i === idx ? { ...c, expanded: !c.expanded } : c));
  };

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">Channels</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Manage your inbound and outbound communication vectors. Configure endpoints, authenticate tokens, and monitor connection status across all deployed channels.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {channelStates.map((ch, idx) => (
          <GlassCard key={ch.name} className="flex flex-col">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/50 text-on-surface">
                  <span className="material-symbols-outlined text-3xl">{ch.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface text-[18px]">{ch.name}</h3>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{ch.subtitle}</span>
                </div>
              </div>
              <ToggleSwitch checked={ch.enabled} onChange={() => toggleChannel(idx)} />
            </div>

            <button
              onClick={() => toggleExpand(idx)}
              className="text-sm text-primary flex items-center gap-1 hover:text-primary/80 transition-colors mb-4 w-fit"
            >
              Configure Parameters
              <span className="material-symbols-outlined text-sm">{ch.expanded ? "expand_less" : "expand_more"}</span>
            </button>

            <div className={`config-panel ${ch.expanded ? "open" : ""} flex-1 flex flex-col gap-4`}>
              {ch.name === "Telegram" && (
                <>
                  <Field label="BOT TOKEN" type="password" defaultValue="123456789:ABCdefGHIjkl" />
                  <Field label="CHAT ID" type="text" defaultValue="-1001234567890" />
                </>
              )}
              {ch.name === "Slack" && (
                <>
                  <Field label="BOT TOKEN" type="password" placeholder="xoxb-..." />
                  <Field label="APP TOKEN" type="password" placeholder="xapp-..." />
                </>
              )}
              {ch.name === "Twilio" && (
                <>
                  <Field label="SID" type="text" defaultValue="ACfxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                  <Field label="AUTH TOKEN" type="password" defaultValue="some_auth_token_here" />
                </>
              )}
              {ch.name === "SMS" && (
                <>
                  <SelectField label="PROVIDER" options={["Twilio", "MessageBird"]} />
                  <Field label="PHONE NUMBER" type="text" defaultValue="+1234567890" />
                </>
              )}
              {ch.name === "WhatsApp" && (
                <>
                  <Field label="BUSINESS ID" type="text" defaultValue="9876543210" />
                  <Field label="API KEY" type="password" defaultValue="xyz789ABC..." />
                </>
              )}
              {ch.name === "Voice" && (
                <>
                  <SelectField label="SERVICE PROVIDER" options={["Google Cloud STT", "AWS Transcribe"]} />
                  <SelectField label="LANGUAGE" options={["en-US", "en-GB"]} />
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-end">
              <button onClick={() => alert(`Testing ${ch.name} connection...`)} className={`btn-test w-full py-2 border rounded-lg font-body-bold text-sm transition-all ${
                ch.enabled ? "border-brand-orange text-brand-orange" : "border-outline-variant text-on-surface-variant"
              }`}>
                Test Connection
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
}

function Field({ label, type, defaultValue, placeholder }: { label: string; type: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase">{label}</label>
      <input
        className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-log-mono text-log-mono focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
        type={type} defaultValue={defaultValue} placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="font-label-caps text-label-caps text-on-surface-variant block uppercase">{label}</label>
      <select className="w-full bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-body-base focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
