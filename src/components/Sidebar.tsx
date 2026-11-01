"use client";

import React from "react";
import {
  Compass,
  History,
  Plus,
  Trash2,
  X,
  Sparkles,
  Bookmark,
  Clock,
  LayoutDashboard,
  Bot,
  CheckCircle2,
  Settings,
} from "lucide-react";
import type { ResearchHistoryItem } from "@/lib/contracts";
import type { UserProfile } from "@/lib/client/workspaceState";

export type WorkspaceTab =
  | "overview"
  | "founderbrief"
  | "assistant"
  | "research"
  | "insights"
  | "tasks"
  | "bytes"
  | "history"
  | "saved";

export interface SidebarProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onNewResearch: () => void;
  history: ResearchHistoryItem[];
  activeTaskId: string | null;
  onSelectHistoryItem: (item: ResearchHistoryItem) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  profile?: UserProfile | null;
  onOpenProfileSetup?: () => void;
  onGoToLanding?: () => void;
  pendingTasksCount?: number;
  savedInsightsCount?: number;
  savedCount?: number;
}

export function Sidebar({
  currentTab,
  onTabChange,
  onNewResearch,
  history,
  activeTaskId,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  isOpenMobile,
  onCloseMobile,
  profile,
  onOpenProfileSetup,
  onGoToLanding,
  pendingTasksCount = 0,
  savedInsightsCount = 0,
  savedCount = 0,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-60 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header & Logo */}
          <div className="h-14 px-space-md flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <span className="w-5 h-5 bg-primary-container rounded flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[13px]">deployed_code</span>
              </span>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-sm text-sm font-semibold text-on-surface tracking-tight">
                  OmniDesk
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant font-mono px-1 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">
                  v2.4
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              {onOpenProfileSetup && (
                <button
                  onClick={onOpenProfileSetup}
                  className="p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded transition cursor-pointer ml-1"
                  title="Workspace Preferences"
                  type="button"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onCloseMobile}
                className="lg:hidden flex items-center justify-center p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                type="button"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Research Button */}
          <div className="p-space-md">
            <button
              onClick={() => {
                onNewResearch();
                onCloseMobile();
              }}
              className="w-full h-9 bg-primary-container hover:bg-[#ff771a] text-white font-body-md text-xs font-semibold rounded flex items-center justify-center gap-space-xs transition-colors shadow-none cursor-pointer"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>New Research</span>
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="flex flex-col gap-0.5 px-space-xs">
            {/* 1. Overview */}
            <button
              onClick={() => {
                onTabChange("overview");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "overview"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <LayoutDashboard className={`w-4 h-4 ${currentTab === "overview" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">Overview</span>
              </div>
            </button>

            {/* 2. Web Research */}
            <button
              onClick={() => {
                onTabChange("research");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "research"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Compass className={`w-4 h-4 ${currentTab === "research" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">Research</span>
              </div>
            </button>

            {/* 3. FounderBrief */}
            <button
              onClick={() => {
                onTabChange("founderbrief");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "founderbrief"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Sparkles className={`w-4 h-4 ${currentTab === "founderbrief" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">FounderBrief</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            </button>

            {/* 4. AI Assistant */}
            <button
              onClick={() => {
                onTabChange("assistant");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "assistant"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Bot className={`w-4 h-4 ${currentTab === "assistant" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
            </button>

            {/* 5. Saved Insights */}
            <button
              onClick={() => {
                onTabChange("insights");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "insights"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Bookmark className={`w-4 h-4 ${currentTab === "insights" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">Inbox</span>
              </div>
              {(savedInsightsCount > 0 || savedCount > 0) && (
                <span className="font-mono text-[10px] text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">
                  {savedInsightsCount || savedCount}
                </span>
              )}
            </button>

            {/* 6. Tasks */}
            <button
              onClick={() => {
                onTabChange("tasks");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "tasks"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <CheckCircle2 className={`w-4 h-4 ${currentTab === "tasks" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">Tasks</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="font-mono text-[10px] text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">
                  {pendingTasksCount}
                </span>
              )}
            </button>

            {/* 7. History */}
            <button
              onClick={() => {
                onTabChange("history");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-md py-2 transition-colors text-left rounded-r cursor-pointer ${
                currentTab === "history"
                  ? "text-on-surface font-semibold border-l-2 border-primary-container bg-surface-container-low pl-[calc(1rem-2px)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <History className={`w-4 h-4 ${currentTab === "history" ? "text-primary-container" : "text-outline"}`} />
                <span className="text-xs font-medium">History</span>
              </div>
            </button>
          </nav>

          {/* Recent Searches / Research */}
          <div className="px-space-md mt-space-md pt-space-sm border-t border-outline-variant/20 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="font-label-sm text-[10px] uppercase tracking-wider text-outline mb-space-xs font-mono font-semibold flex items-center justify-between">
              <span>Recent Searches</span>
              <button
                onClick={() => onTabChange("history")}
                className="text-[10px] text-primary-container hover:underline cursor-pointer lowercase"
                type="button"
              >
                view all
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {history.length === 0 ? (
                <div className="flex flex-col gap-1 py-1">
                  {[
                    "Q4 Macro Risk Model",
                    "L2 Consensus Latency",
                    "Yield Telemetry Cluster 09",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        onTabChange("research");
                        onCloseMobile();
                      }}
                      className="text-left font-mono text-[11px] text-on-surface-variant hover:text-on-surface truncate py-0.5 transition-colors block w-full cursor-pointer"
                      type="button"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              ) : (
                history.slice(0, 6).map((item) => {
                  const isActive = item.response.taskId === activeTaskId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onTabChange("research");
                        onCloseMobile();
                      }}
                      className={`group flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                        isActive
                          ? "bg-surface-container-low text-on-surface font-medium border-l border-primary-container"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Clock className="w-3 h-3 text-outline shrink-0" />
                        <span className="truncate text-[11px] font-mono">{item.query}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteHistoryItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-outline hover:text-error rounded transition-opacity"
                        title="Delete query"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer: User Profile */}
        <div className="p-space-md border-t border-outline-variant/20">
          <div
            onClick={onOpenProfileSetup}
            className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-space-sm cursor-pointer transition"
            title="Workspace Preferences"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 font-medium text-xs font-mono">
                {profile?.name ? profile.name[0].toUpperCase() : "A"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-sm text-xs text-on-surface font-semibold truncate">
                  {profile?.company || profile?.name || "Apex Global"}
                </span>
                <span className="font-label-sm text-[10px] text-outline truncate font-mono">
                  {profile?.role || "Enterprise"}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px] shrink-0">unfold_more</span>
          </div>
        </div>
      </aside>
    </>
  );
}
