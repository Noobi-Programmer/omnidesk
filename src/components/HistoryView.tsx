"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { ResearchHistoryItem } from "@/lib/contracts";

interface HistoryViewProps {
  history: ResearchHistoryItem[];
  onSelectHistoryItem: (item: ResearchHistoryItem) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  onClearAllHistory?: () => void;
}

export function HistoryView({
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory,
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = history.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.query.toLowerCase().includes(term) ||
      item.response.taskId.toLowerCase().includes(term) ||
      item.response.plan.objective.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-container-lowest">
      {/* Header Banner */}
      <div className="border-b border-outline-variant/30 bg-surface-container-low px-space-md py-space-sm sm:px-space-lg sm:py-space-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <History className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-on-surface">
                Research History
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-outline">
                {history.length} runs
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-outline">
              Review and revisit past multi-source investigations and executive reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search filter */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container text-on-surface rounded-lg border border-outline-variant/40 focus:outline-hidden focus:border-primary"
              />
            </div>

            {history.length > 0 && onClearAllHistory && (
              <button
                onClick={onClearAllHistory}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-outline hover:text-error hover:bg-surface-container transition-colors"
                type="button"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-6xl mx-auto w-full px-space-md py-space-md sm:px-space-lg flex-1">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-outline">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No previous research runs found.</p>
            <p className="text-xs mt-1">Start a new deep research session from the top search bar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-primary border border-primary/20">
                      {item.response.taskId}
                    </span>
                    <span className="text-xs text-outline flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {item.response.mock && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-outline font-mono">
                        MOCK
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                    {item.query}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-outline font-mono">
                    <span>{item.response.sources.length} sources</span>
                    <span>•</span>
                    <span>{item.response.comparison.length} entities</span>
                    {item.response.report && (
                      <>
                        <span>•</span>
                        <span className="text-primary">Deep Report Ready</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHistoryItem(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors"
                    type="button"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5 text-outline" />
                  </button>

                  <button
                    onClick={(e) => onDeleteHistoryItem(item.id, e)}
                    className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-colors"
                    title="Delete item"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
