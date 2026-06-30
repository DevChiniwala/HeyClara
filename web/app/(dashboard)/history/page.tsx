"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

const historyEntries = Array.from({ length: 25 }, (_, i) => ({
  id: `msg_${i}`,
  preview: i % 3 === 0
    ? "Can you explain how the transformer attention mechanism works in large language models?"
    : i % 3 === 1
      ? "Write a Python function that implements a binary search tree with insert, delete, and traverse methods."
      : "What are the best practices for deploying machine learning models to production?",
  timestamp: new Date(Date.now() - i * 3600000 - Math.random() * 86400000),
  agent: i % 2 === 0 ? "Clara (Default)" : "Clara (Technical)",
  sessionId: `session_${Math.floor(i / 3)}`,
  tokens: Math.floor(Math.random() * 1500) + 100,
}));

export default function HistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = historyEntries.filter((e) =>
    e.preview.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageEntries = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <>
      <header className="mb-sm">
        <h1 className="text-display-lg font-display-lg text-on-surface mb-2">History</h1>
        <p className="text-body-base font-body-base text-on-surface-variant max-w-2xl">
          Browse past conversations, search message archives, and revisit previous sessions.
        </p>
      </header>

      <GlassCard className="overflow-hidden p-0">
        <div className="px-lg py-md border-b border-outline-variant/50 bg-surface-container-low/60 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input
                className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2 text-on-surface font-body-base focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select className="bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-body-base focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors">
              <option>All Agents</option>
              <option>Clara (Default)</option>
              <option>Clara (Technical)</option>
            </select>
            <input
              type="date"
              className="bg-surface-container-high border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface font-body-base focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors"
            />
          </div>
        </div>

        <div className="divide-y divide-outline-variant/50">
          {pageEntries.map((entry) => (
            <div
              key={entry.id}
              className="px-lg py-4 hover:bg-surface-variant/40 transition-colors cursor-pointer flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-lg">forum</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-body-bold font-body-bold text-on-surface text-sm">{entry.agent}</span>
                  <Badge variant="info">{entry.sessionId}</Badge>
                  <span className="text-label-caps font-label-caps text-on-surface-variant ml-auto">
                    {formatRelativeTime(entry.timestamp)}
                  </span>
                </div>
                <p className="text-body-base font-body-base text-on-surface-variant truncate">
                  {entry.preview}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-label-caps font-label-caps text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">token</span>
                    {entry.tokens} tokens
                  </span>
                  <button onClick={() => router.push(`/chat/${entry.sessionId}`)} className="text-label-caps font-label-caps text-primary hover:text-primary/80 transition-colors uppercase">
                    Open Session
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pageEntries.length === 0 && (
            <div className="px-lg py-12 text-center text-on-surface-variant">
              No messages match your search.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-lg py-md border-t border-outline-variant/50 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:border-brand-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                  p === currentPage
                    ? "bg-primary text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-on-surface-variant hover:text-on-surface hover:border-brand-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        )}
      </GlassCard>
    </>
  );
}
