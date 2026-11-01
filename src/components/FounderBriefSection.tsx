"use client";

import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import type { FounderBriefItem, SavedInsight, UserTask } from "@/lib/client/workspaceState";

interface FounderBriefSectionProps {
  items: FounderBriefItem[];
  onOpenBriefDetail: (item: FounderBriefItem) => void;
  onSaveInsight: (item: FounderBriefItem) => void;
  savedInsights: SavedInsight[];
  onRefreshFeed?: () => void;
  isRefreshing?: boolean;
}

export function FounderBriefSection({
  items,
  onOpenBriefDetail,
  onSaveInsight,
  savedInsights,
  onRefreshFeed,
  isRefreshing,
}: FounderBriefSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems =
    activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col gap-space-md shadow-sm">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            FounderBrief — Personalized Intelligence Feed
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshFeed && (
            <button
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded transition"
              title="Refresh intelligence feed"
              type="button"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          )}
          <span className="font-mono-sm text-[11px] text-outline bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
            {items.length} signals tailored to you
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded font-mono-sm text-[11px] transition shrink-0 ${
              activeCategory === cat
                ? "bg-surface-container-highest text-on-surface font-medium border border-outline-variant/60"
                : "bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/20"
            }`}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {filteredItems.map((item) => {
          const isSaved = savedInsights.some((ins) => ins.title === item.headline);

          return (
            <div
              key={item.id}
              className="bg-surface-container rounded border border-outline-variant/30 hover:border-outline-variant/70 p-4 flex flex-col justify-between gap-3 transition-colors group"
            >
              <div className="flex flex-col gap-2">
                {/* Meta Top Line */}
                <div className="flex items-center justify-between text-[11px] font-mono-sm text-outline">
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary font-medium">{item.category}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{item.source}</span>
                  </div>
                  <span>{item.publishedAt}</span>
                </div>

                {/* Headline */}
                <h3 className="font-headline-sm text-sm text-on-surface font-medium group-hover:text-primary transition-colors leading-snug">
                  {item.headline}
                </h3>

                {/* Summary */}
                <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed line-clamp-3">
                  {item.summary}
                </p>

                {/* Relevance Tag */}
                <div className="bg-surface-container-low/70 border border-outline-variant/20 rounded p-2 text-[11px] font-mono-sm text-on-surface-variant">
                  <span className="text-secondary font-medium mr-1.5">Why it matters:</span>
                  <span>{item.relevanceExplanation}</span>
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => onSaveInsight(item)}
                  className={`flex items-center gap-1 font-mono-sm text-[11px] transition ${
                    isSaved ? "text-secondary" : "text-outline hover:text-on-surface"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-secondary" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save insight"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBriefDetail(item)}
                  className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded font-label-sm text-[11px] flex items-center gap-1.5 transition border border-outline-variant/30 font-medium"
                >
                  <span>Brief me</span>
                  <ArrowRight className="w-3 h-3 text-primary" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
