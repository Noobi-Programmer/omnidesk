"use client";

import React from "react";
import { Bookmark, ExternalLink, Trash2, Calendar, FileText } from "lucide-react";
import type { SavedInsight } from "@/lib/client/workspaceState";

interface SavedInsightsViewProps {
  insights: SavedInsight[];
  onDeleteInsight: (id: string) => void;
  onInspectInsight: (insight: SavedInsight) => void;
}

export function SavedInsightsView({
  insights,
  onDeleteInsight,
  onInspectInsight,
}: SavedInsightsViewProps) {
  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col gap-space-md shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Saved Insights ({insights.length})
          </h2>
        </div>
        <span className="font-mono-sm text-[11px] text-outline">
          Bookmarked intelligence signals &amp; supplier conclusions
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="py-12 text-center text-outline font-body-sm flex flex-col items-center gap-2">
          <Bookmark className="w-8 h-8 opacity-40 mb-1" />
          <p className="font-medium text-on-surface-variant">No saved insights yet</p>
          <p className="text-xs text-outline max-w-sm">
            When reviewing FounderBrief signals or supplier comparison matrices, click &ldquo;Save insight&rdquo; to collect them here for executive reviews.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-surface-container rounded border border-outline-variant/30 p-4 flex flex-col justify-between gap-3 group hover:border-outline-variant/60 transition"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono-sm text-outline">
                  <span className="text-primary font-medium">{ins.sourceTitle}</span>
                  <span>{new Date(ins.savedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-headline-sm text-sm text-on-surface font-medium leading-snug">
                  {ins.title}
                </h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                  {ins.takeaway}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                {ins.sourceUrl ? (
                  <a
                    href={ins.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-mono-sm text-[11px] flex items-center gap-1"
                  >
                    <span>View original source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => onDeleteInsight(ins.id)}
                  className="p-1 text-outline hover:text-error rounded transition"
                  title="Remove saved insight"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
