"use client";

import React, { useState } from "react";
import {
  Bookmark,
  FileText,
  Sparkles,
  ExternalLink,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { ResearchResponse, FounderByte } from "@/lib/contracts";

interface SavedViewProps {
  savedReports: ResearchResponse[];
  savedBytes: FounderByte[];
  onSelectReport: (report: ResearchResponse) => void;
  onRemoveReport: (taskId: string) => void;
  onRemoveByte: (byteId: string) => void;
}

export function SavedView({
  savedReports,
  savedBytes,
  onSelectReport,
  onRemoveReport,
  onRemoveByte,
}: SavedViewProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "reports" | "bytes">("all");

  const showReports = activeFilter === "all" || activeFilter === "reports";
  const showBytes = activeFilter === "all" || activeFilter === "bytes";

  const totalCount = savedReports.length + savedBytes.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-container-lowest">
      {/* Header Banner */}
      <div className="border-b border-outline-variant/30 bg-surface-container-low px-space-md py-space-sm sm:px-space-lg sm:py-space-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Bookmark className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-on-surface">
                Saved Items
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-outline">
                {totalCount} saved
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-outline">
              Your bookmarked Founder Bytes and saved Deep Research reports.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
              type="button"
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter("reports")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeFilter === "reports"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
              type="button"
            >
              Reports ({savedReports.length})
            </button>
            <button
              onClick={() => setActiveFilter("bytes")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeFilter === "bytes"
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
              type="button"
            >
              Founder Bytes ({savedBytes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto w-full px-space-md py-space-md sm:px-space-lg flex-1 space-y-6">
        {totalCount === 0 ? (
          <div className="py-20 text-center text-outline">
            <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No saved items yet.</p>
            <p className="text-xs mt-1">
              Click &quot;Save&quot; on any Deep Research report or Founder Byte to pin it here.
            </p>
          </div>
        ) : (
          <>
            {/* Section: Saved Reports */}
            {showReports && savedReports.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Saved Research Reports ({savedReports.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedReports.map((item) => (
                    <div
                      key={item.taskId}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-outline mb-1.5">
                          <span className="font-mono text-primary">{item.taskId}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface line-clamp-2">
                          {item.request.prompt}
                        </h3>
                        {item.report && (
                          <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                            {item.report.executiveSummary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-[11px] text-outline font-mono">
                          <span>{item.sources.length} sources verified</span>
                          <span>•</span>
                          <span>{item.comparison.length} entities analyzed</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                        <button
                          onClick={() => onSelectReport(item)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          type="button"
                        >
                          <span>Open full report</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemoveReport(item.taskId)}
                          className="text-outline hover:text-error transition-colors p-1"
                          title="Remove from saved"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Bookmarked Bytes */}
            {showBytes && savedBytes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Bookmarked Founder Bytes ({savedBytes.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedBytes.map((byte) => (
                    <div
                      key={byte.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/60 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-primary border border-primary/20">
                            {byte.source}
                          </span>
                          <span className="text-[11px] text-outline">{byte.publishedAt}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface line-clamp-2">
                          {byte.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                          {byte.summary}
                        </p>
                        <div className="p-2.5 rounded bg-surface-container text-xs text-on-surface border-l-2 border-primary">
                          <span className="font-semibold text-primary">Why it matters: </span>
                          <span className="line-clamp-2">{byte.whyItMatters}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                        <a
                          href={byte.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <span>Read original</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => onRemoveByte(byte.id)}
                          className="text-outline hover:text-error transition-colors p-1"
                          title="Remove bookmark"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
