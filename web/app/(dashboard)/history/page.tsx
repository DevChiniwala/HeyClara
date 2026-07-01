"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import { useMCPMessages } from "@/lib/use-mcp";
import { parseMessages } from "@/lib/parsers";

export default function HistoryPage() {
  const router = useRouter();
  const { data: raw, loading, error } = useMCPMessages(50);
  const messages = useMemo(() => raw ? parseMessages(raw) : [], [raw]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = messages.filter((e) =>
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.sender.toLowerCase().includes(search.toLowerCase())
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
        {error && <div className="mt-md text-error text-sm">{error}</div>}
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
          </div>
        </div>

        {loading && (
          <div className="divide-y divide-outline-variant/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-lg py-4 flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="px-lg py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl block mb-2">forum</span>
            <p className="text-body-base font-body-base">
              {search ? "No messages match your search." : "No messages yet."}
            </p>
          </div>
        )}

        <div className="divide-y divide-outline-variant/50">
          {pageEntries.map((entry, i) => {
            const isAgent = !["user", "you"].includes(entry.sender.toLowerCase());
            return (
              <div
                key={i}
                className="px-lg py-4 hover:bg-surface-variant/40 transition-colors cursor-pointer flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-full ${isAgent ? "bg-primary/20 border border-primary/30" : "bg-surface-container-high border border-outline-variant"} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`material-symbols-outlined text-lg ${isAgent ? "text-primary" : "text-on-surface-variant"}`}>
                    {isAgent ? "smart_toy" : "person"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-body-bold font-body-bold text-on-surface text-sm">
                      {entry.sender}
                    </span>
                    <Badge variant="info">{isAgent ? "AI" : "User"}</Badge>
                    <span className="text-label-caps font-label-caps text-on-surface-variant ml-auto">
                      {entry.timestamp}
                    </span>
                  </div>
                  <p className="text-body-base font-body-base text-on-surface-variant truncate">
                    {entry.content}
                  </p>
                </div>
              </div>
            );
          })}
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
