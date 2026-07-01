"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPSessions } from "@/lib/use-mcp";
import { parseSessions } from "@/lib/parsers";

export default function ChatListPage() {
  const router = useRouter();
  const { data: raw, loading, error } = useMCPSessions(50);
  const sessions = useMemo(() => raw ? parseSessions(raw) : [], [raw]);
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.preview?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-gutter -mt-6">
      {/* Session List Pane */}
      <div className="w-80 border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-md border-b border-outline-variant">
          <div className="relative flex items-center bg-surface-container border border-outline-variant rounded-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
            <input
              className="w-full bg-transparent text-on-surface font-body-base py-2 pl-10 pr-3 outline-none rounded-lg placeholder-on-surface-variant"
              placeholder="Search sessions..." type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-xs">
          {loading && (
            <div className="p-md space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-lg p-md">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-64" />
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="p-md text-error text-sm">
              Failed to load sessions: {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center text-on-surface-variant text-sm p-md">
              {search ? "No sessions match your search." : "No sessions yet. Start a new chat."}
            </div>
          )}
          {filtered.map((s) => (
            <Link key={s.id} href={`/chat/${s.id}`}>
              <div className="p-md glass-card rounded-lg cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-body-bold font-body-bold text-on-surface truncate pr-4">
                    {s.preview?.split(" ").slice(0, 4).join(" ") || `Session ${s.id}`}
                  </h3>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {s.messageCount} msgs
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate">{s.preview || `Room: ${s.room}`}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Empty Chat Pane */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-on-surface-variant space-y-4">
          <span className="material-symbols-outlined text-6xl block">chat_bubble</span>
          <p className="text-headline-md font-headline-md text-on-surface">Select a session</p>
          <p className="text-body-base font-body-base">Choose a conversation from the left or start a new one.</p>
          <button onClick={handleNewChat} className="bg-primary text-on-primary font-body-bold py-md px-lg rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <span className="flex items-center gap-sm">
              <span className="material-symbols-outlined fill">add_comment</span>
              New Chat
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
