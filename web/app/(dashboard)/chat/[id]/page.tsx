"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPSessionMessages, useMCPSessions } from "@/lib/use-mcp";
import { parseSessionMessages, parseSessions } from "@/lib/parsers";
import { formatDate } from "@/lib/utils";

const AGENT_SENDERS = new Set(["Clara", "assistant", "bot", "clara"]);

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = typeof params.id === "string" ? params.id : null;
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesRaw = useMCPSessionMessages(sessionId);
  const sessionsRaw = useMCPSessions(20);

  const messages = useMemo(() => messagesRaw.data ? parseSessionMessages(messagesRaw.data) : [], [messagesRaw.data]);
  const sessions = useMemo(() => sessionsRaw.data ? parseSessions(sessionsRaw.data) : [], [sessionsRaw.data]);

  const currentSession = sessions.find((s) => s.id === sessionId);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return;
    setSending(true);
    try {
      const resp = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim(), target: "dm" }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setInput("");
      messagesRaw.refetch();
    } catch (err) {
      alert(`Failed to send: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSending(false);
    }
  };

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
          {sessionsRaw.loading && (
            <div className="p-md space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          )}
          {sessions.map((s) => (
            <Link key={s.id} href={`/chat/${s.id}`}>
              <div className={`p-md rounded-lg cursor-pointer transition-colors ${
                s.id === sessionId
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-surface-container"
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-body-bold font-body-bold truncate text-sm text-on-surface">
                    {s.preview?.split(" ").slice(0, 3).join(" ") || `Session ${s.id}`}
                  </h3>
                  <span className="text-xs text-outline">{s.messageCount} msgs</span>
                </div>
                <p className="text-sm text-outline truncate">{s.preview || s.room}</p>
              </div>
            </Link>
          ))}
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
            <h2 className="text-headline-md font-headline-md text-on-surface">
              {currentSession?.preview?.split(" ").slice(0, 4).join(" ") || "Chat Session"}
            </h2>
            <span className="px-2 py-1 rounded bg-primary/10 text-primary font-label-caps text-label-caps border border-primary/30 uppercase">Local Mode</span>
          </div>
          <div className="flex items-center gap-sm">
            <button onClick={() => messagesRaw.refetch()} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-gutter flex flex-col gap-xl z-10">
          {messagesRaw.loading && (
            <div className="space-y-4 p-md">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-20 w-3/4 rounded-2xl ${i % 2 === 0 ? "" : ""}`} />
                </div>
              ))}
            </div>
          )}
          {messagesRaw.error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-error font-body-base">{messagesRaw.error}</div>
            </div>
          )}
          {!messagesRaw.loading && !messagesRaw.error && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl block mb-2">forum</span>
                <p>No messages yet. Start the conversation.</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => {
            const isAgent = AGENT_SENDERS.has(msg.sender);
            return (
              <div key={i} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] p-md relative group ${
                  isAgent
                    ? "bg-surface-container border border-outline-variant rounded-2xl rounded-tl-sm"
                    : "bg-surface-container-high border border-outline-variant rounded-2xl rounded-tr-sm"
                }`}>
                  {isAgent && (
                    <div className="absolute -left-3 top-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                      <span className="material-symbols-outlined text-[12px] text-on-primary fill">smart_toy</span>
                    </div>
                  )}
                  <div className="text-on-surface font-body-base whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-gutter border-t border-outline-variant bg-surface/80 backdrop-blur-xl shrink-0 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end bg-surface-container border border-outline-variant rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all p-2">
              <textarea
                className="w-full bg-transparent text-on-surface font-body-base outline-none resize-none min-h-[44px] py-2 px-3 placeholder-on-surface-variant"
                placeholder="Type a message..." rows={1} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <div className="flex items-center gap-2 pr-1 pb-1 shrink-0">
                <button onClick={handleSend} disabled={sending || !input.trim()} className="bg-primary text-on-primary p-2 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined fill">{sending ? "hourglass_top" : "send"}</span>
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
