"use client";

import { useState } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { formatRelativeTime } from "@/lib/utils";

const mockSessions = [
  { id: "s1", room: "main", summary: "Discussing architecture for the new module", createdAt: new Date(Date.now() - 10 * 60000), updatedAt: new Date() },
  { id: "s2", room: "main", summary: "Reviewing PR #402 for performance", createdAt: new Date(Date.now() - 2 * 3600000), updatedAt: new Date(Date.now() - 2 * 3600000) },
  { id: "s3", room: "main", summary: "Setting up sprint goals for Q3", createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) },
];

export default function ChatListPage() {
  const [search, setSearch] = useState("");
  const filtered = mockSessions.filter(s =>
    s.summary?.toLowerCase().includes(search.toLowerCase())
  );

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
          {filtered.length === 0 && (
            <div className="text-center text-on-surface-variant text-sm p-md">
              No sessions found. Start a new chat.
            </div>
          )}
          {filtered.map((s) => (
            <Link key={s.id} href={`/chat/${s.id}`}>
              <div className="p-md glass-card rounded-lg cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-body-bold font-body-bold text-on-surface truncate pr-4">
                    {s.summary?.split(" ").slice(0, 4).join(" ") || "New Session"}
                  </h3>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {formatRelativeTime(s.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate">{s.summary}</p>
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
          <button className="bg-primary text-on-primary font-body-bold py-md px-lg rounded-lg hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]">
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
