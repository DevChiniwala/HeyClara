"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";

const mockMessages = [
  { id: 1, sessionId: "s1", sender: "user", content: "Can you provide a simple React component for a glassmorphic card?", isFromAgent: false, createdAt: new Date(Date.now() - 60000), deliveryStatus: "sent" },
  { id: 2, sessionId: "s1", sender: "Clara", content: "Certainly. Here is a minimal implementation of a glassmorphic card using Tailwind CSS:\n\n```tsx\nexport const GlassCard = ({ children }) => {\n  return (\n    <div className=\"bg-black/40 backdrop-blur-md border border-[#ff5a1f]/30 rounded-xl p-6 shadow-[0_0_15px_rgba(255,90,31,0.1)]\">\n      {children}\n    </div>\n  );\n};\n```\n\nThis creates a semi-transparent card with an orange border and subtle glow effect.", isFromAgent: true, createdAt: new Date(Date.now() - 30000), deliveryStatus: "sent", metadata: { model: "gpt-4-turbo", tokens_prompt: 45, tokens_completion: 92, cost_usd: 0.0023 } },
];

export default function ChatSessionPage() {
  const params = useParams();
  const [input, setInput] = useState("");

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-gutter -mt-6">
      {/* Session List Pane */}
      <div className="w-80 border-r border-outline-variant flex flex-col shrink-0 bg-surface-container-low/30">
        <div className="p-md border-b border-outline-variant">
          <div className="relative flex items-center bg-surface-container border border-outline-variant rounded-lg">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">search</span>
            <input className="w-full bg-transparent text-on-surface font-body-base py-2 pl-10 pr-3 outline-none rounded-lg" placeholder="Search..." type="text" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-sm space-y-1">
          <div className="p-md bg-primary/10 border border-primary/30 rounded-lg cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-body-bold font-body-bold text-primary truncate text-sm">Project Research</h3>
              <span className="text-xs text-on-surface-variant">10m ago</span>
            </div>
            <p className="text-sm text-on-surface-variant truncate">Discussing architecture for the new module...</p>
          </div>
          <div className="p-md rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-body-bold font-body-bold text-on-surface-variant truncate text-sm">Code Review</h3>
              <span className="text-xs text-outline">2h ago</span>
            </div>
            <p className="text-sm text-outline truncate">Reviewing PR #402 for performance...</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Pane */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px] ai-pulse opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
        </div>

        {/* Header */}
        <header className="h-16 border-b border-outline-variant bg-surface/60 backdrop-blur-md flex items-center justify-between px-gutter shrink-0 relative z-10">
          <div className="flex items-center gap-md">
            <h2 className="text-headline-md font-headline-md text-on-surface">Project Research</h2>
            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-label-caps text-label-caps border border-primary/30 uppercase">Local Mode</span>
          </div>
          <div className="flex items-center gap-sm">
            <button onClick={() => alert("Downloading chat...")} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button onClick={() => alert("Deleting chat...")} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-gutter flex flex-col gap-xl z-10">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromAgent ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[75%] ${msg.isFromAgent ? "" : "bg-surface-container-high border border-outline-variant rounded-2xl rounded-tr-sm"} ${msg.isFromAgent ? "bg-surface-container border border-outline-variant rounded-2xl rounded-tl-sm" : ""} p-md relative group`}>
                {msg.isFromAgent && (
                  <div className="absolute -left-3 top-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                    <span className="material-symbols-outlined text-[12px] text-on-primary fill">smart_toy</span>
                  </div>
                )}
                <div className="text-on-surface font-body-base whitespace-pre-wrap">{msg.content}</div>
                <div className="flex items-center justify-between mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-on-surface-variant font-log-mono">{formatDate(msg.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {msg.metadata && (
                      <details className="text-[10px]">
                        <summary className="text-outline cursor-pointer hover:text-on-surface transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">data_object</span>
                        </summary>
                        <pre className="mt-1 bg-surface-dim p-2 rounded border border-outline-variant/50 font-log-mono text-[10px] text-on-surface-variant">
                          {JSON.stringify(msg.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                    {!msg.isFromAgent && (
                      <span className="material-symbols-outlined text-[14px] text-green-400">done_all</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-gutter border-t border-outline-variant bg-surface/80 backdrop-blur-xl shrink-0 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <select className="bg-surface-container border border-outline-variant text-xs text-on-surface-variant rounded-md px-2 py-1 outline-none focus:border-primary">
                <option>Clara Default</option>
                <option>Clara Developer</option>
              </select>
            </div>
            <div className="relative flex items-end bg-surface-container border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all p-2">
              <textarea
                className="w-full bg-transparent text-on-surface font-body-base outline-none resize-none min-h-[44px] py-2 px-3 placeholder-on-surface-variant"
                placeholder="Type a message..." rows={1} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) e.preventDefault(); }}
              />
              <div className="flex items-center gap-2 pr-1 pb-1 shrink-0">
                <button onClick={() => alert("Voice input not implemented")} className="p-2 text-outline hover:text-on-surface transition-colors rounded-lg">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button onClick={() => { if (input.trim()) alert(`Sending: ${input}`); }} className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                  <span className="material-symbols-outlined fill">send</span>
                </button>
              </div>
            </div>
            <div className="text-center mt-1 text-[10px] text-outline font-log-mono">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
