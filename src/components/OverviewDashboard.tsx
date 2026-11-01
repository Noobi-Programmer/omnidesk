"use client";

import React from "react";
import {
  Compass,
  Sparkles,
  Bot,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { UserProfile, FounderBriefItem, SavedInsight, UserTask } from "@/lib/client/workspaceState";
import type { ResearchHistoryItem } from "@/lib/contracts";

interface OverviewDashboardProps {
  profile: UserProfile | null;
  onOpenProfileSetup: () => void;
  onNavigateTab: (tab: "research" | "founderbrief" | "assistant" | "insights" | "tasks") => void;
  onQuickResearch: (prompt: string) => void;
  topBriefItems: FounderBriefItem[];
  onOpenBriefDetail: (item: FounderBriefItem) => void;
  savedInsights: SavedInsight[];
  tasks: UserTask[];
  onToggleTask: (id: string) => void;
  recentResearch: ResearchHistoryItem[];
  onSelectRecentResearch: (item: ResearchHistoryItem) => void;
}

export function OverviewDashboard({
  profile,
  onOpenProfileSetup,
  onNavigateTab,
  onQuickResearch,
  topBriefItems,
  onOpenBriefDetail,
  savedInsights,
  tasks,
  onToggleTask,
  recentResearch,
  onSelectRecentResearch,
}: OverviewDashboardProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const userName = profile?.name ? profile.name.split(" ")[0] : "Executive";
  const userRole = profile?.role || "Decision Maker";

  return (
    <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
      {/* Executive Welcome Hero Banner */}
      <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono-sm text-[11px] text-outline uppercase tracking-wider">
              OmniDesk Executive Intelligence
            </span>
          </div>
          <h1 className="font-headline-md text-xl sm:text-2xl text-on-surface font-semibold tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="font-body-sm text-outline max-w-xl text-xs sm:text-sm">
            Here is your live intelligence dashboard customized for{" "}
            <span className="text-on-surface-variant font-medium">{userRole}</span>
            {profile?.company ? ` at ${profile.company}` : ""}. Know what is happening, investigate
            deeply, and execute vetted decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab("research")}
            className="px-3.5 py-2 bg-primary-container hover:bg-[#6c78de] text-on-primary-container rounded font-label-md text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            type="button"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Launch Web Research</span>
          </button>
          <button
            onClick={() => onNavigateTab("assistant")}
            className="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-outline-variant/30 font-label-md text-xs font-medium flex items-center gap-1.5 transition"
            type="button"
          >
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab("founderbrief")}
          className="bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 p-3.5 flex flex-col gap-1 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-outline text-xs">
            <span className="font-medium">Signals Feed</span>
            <Sparkles className="w-3.5 h-3.5 text-tertiary" />
          </div>
          <div className="text-xl font-headline-sm font-semibold text-on-surface">
            {topBriefItems.length} Active
          </div>
          <span className="text-[11px] text-outline-variant">Personalized updates</span>
        </div>

        <div
          onClick={() => onNavigateTab("research")}
          className="bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 p-3.5 flex flex-col gap-1 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-outline text-xs">
            <span className="font-medium">Research Runs</span>
            <Compass className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-headline-sm font-semibold text-on-surface">
            {recentResearch.length}
          </div>
          <span className="text-[11px] text-outline-variant">Locally persisted runs</span>
        </div>

        <div
          onClick={() => onNavigateTab("insights")}
          className="bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 p-3.5 flex flex-col gap-1 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-outline text-xs">
            <span className="font-medium">Saved Insights</span>
            <Bookmark className="w-3.5 h-3.5 text-outline" />
          </div>
          <div className="text-xl font-headline-sm font-semibold text-on-surface">
            {savedInsights.length}
          </div>
          <span className="text-[11px] text-outline-variant">Executive conclusions</span>
        </div>

        <div
          onClick={() => onNavigateTab("tasks")}
          className="bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 p-3.5 flex flex-col gap-1 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-outline text-xs">
            <span className="font-medium">Pending Tasks</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
          </div>
          <div className="text-xl font-headline-sm font-semibold text-on-surface">
            {pendingTasks.length}
          </div>
          <span className="text-[11px] text-outline-variant">Follow-ups &amp; audits</span>
        </div>
      </div>

      {/* Two Column Layout: FounderBrief Signals + Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left Column (2 Cols): FounderBrief Highlights */}
        <div className="lg:col-span-2 flex flex-col gap-space-md">
          <div className="bg-surface-container-low rounded border border-outline-variant/30 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tertiary" />
                <h2 className="font-headline-sm text-sm text-on-surface font-semibold">
                  FounderBrief Signals (Curated for You)
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab("founderbrief")}
                className="text-xs text-primary hover:text-[#6c78de] font-medium flex items-center gap-1 transition"
                type="button"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {topBriefItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container rounded border border-outline-variant/20 p-3.5 flex flex-col gap-2 group hover:border-outline-variant/50 transition cursor-pointer"
                  onClick={() => onOpenBriefDetail(item)}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono-sm text-outline">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-medium">
                      {item.category}
                    </span>
                    <span>{item.publishedAt} • {item.source}</span>
                  </div>
                  <h3 className="font-headline-sm text-sm text-on-surface font-medium leading-snug group-hover:text-primary transition-colors">
                    {item.headline}
                  </h3>
                  <p className="font-body-sm text-xs text-outline line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-outline">
                    <span className="italic">{item.relevanceExplanation}</span>
                    <span className="text-primary font-medium flex items-center gap-0.5">
                      Brief me &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Research Jump Starters */}
          <div className="bg-surface-container-low rounded border border-outline-variant/30 p-4 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <Compass className="w-4 h-4 text-primary" />
              <h3 className="font-headline-sm text-xs font-semibold text-on-surface uppercase tracking-wider">
                Instant Sourcing Presets
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onQuickResearch(
                    "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)"
                  )
                }
                className="p-2.5 bg-surface-container hover:bg-surface-container-high rounded border border-outline-variant/20 text-left transition flex flex-col gap-1"
                type="button"
              >
                <div className="flex items-center justify-between text-xs font-medium text-on-surface">
                  <span>EU Cold Brew Can Suppliers</span>
                  <ArrowRight className="w-3 h-3 text-outline" />
                </div>
                <span className="text-[11px] text-outline">250ml slim, MOQ &lt; 50k, BPA-NI liners</span>
              </button>

              <button
                onClick={() =>
                  onQuickResearch(
                    "Compare corrugated box and eco-friendly mailer packaging suppliers in Bengaluru (MOQ < 2000, 3-ply kraft)"
                  )
                }
                className="p-2.5 bg-surface-container hover:bg-surface-container-high rounded border border-outline-variant/20 text-left transition flex flex-col gap-1"
                type="button"
              >
                <div className="flex items-center justify-between text-xs font-medium text-on-surface">
                  <span>Bengaluru D2C Packaging</span>
                  <ArrowRight className="w-3 h-3 text-outline" />
                </div>
                <span className="text-[11px] text-outline">3-ply kraft, MOQ &lt; 2000, FSC certified</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Pending Tasks & Recent Research */}
        <div className="flex flex-col gap-space-md">
          {/* Action Tasks Widget */}
          <div className="bg-surface-container-low rounded border border-outline-variant/30 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h3 className="font-headline-sm text-sm text-on-surface font-semibold">
                  Follow-ups ({pendingTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("tasks")}
                className="text-xs text-primary hover:text-[#6c78de] font-medium transition"
                type="button"
              >
                Manage
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center text-outline text-xs">
                  All action items completed. Great job!
                </div>
              ) : (
                pendingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => onToggleTask(task.id)}
                      className="mt-0.5 rounded border-outline-variant bg-surface text-primary focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-on-surface font-medium truncate">{task.title}</span>
                      {task.dueHint && (
                        <span className="text-[10px] text-outline">{task.dueHint}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Runs */}
          <div className="bg-surface-container-low rounded border border-outline-variant/30 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-outline" />
                <h3 className="font-headline-sm text-sm text-on-surface font-semibold">
                  Recent Research
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {recentResearch.length === 0 ? (
                <div className="py-6 text-center text-outline text-xs">
                  No prior research runs in this workspace yet.
                </div>
              ) : (
                recentResearch.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectRecentResearch(item)}
                    className="p-2 rounded bg-surface-container hover:bg-surface-container-high transition border border-outline-variant/20 text-xs cursor-pointer flex flex-col gap-1"
                  >
                    <span className="text-on-surface font-medium line-clamp-1">
                      {item.query}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-outline font-mono-sm">
                      <span>{item.response.comparison.length} candidate items</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
