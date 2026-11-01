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
  Radio,
  Clock,
  LayoutDashboard,
  Bot,
  CheckCircle2,
  Settings,
  LogOut,
  ExternalLink,
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
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between py-space-sm px-space-xs transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-space-sm overflow-hidden flex-1">
          {/* Header & Logo */}
          <div className="flex items-center justify-between px-space-sm py-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
                OmniDesk
              </span>
              <span className="font-mono text-[10px] text-primary px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onOpenProfileSetup && (
                <button
                  onClick={onOpenProfileSetup}
                  className="p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded transition"
                  title="Workspace Preferences"
                  type="button"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onCloseMobile}
                className="lg:hidden flex items-center justify-center p-space-xs text-outline hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                type="button"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Research Button */}
          <div className="px-space-xs">
            <button
              onClick={() => {
                onNewResearch();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-space-sm py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition-all shadow-xs group font-medium cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">New Research</span>
              </div>
              <kbd className="font-mono text-[10px] text-on-primary/80 bg-black/20 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Main Navigation Links matching OmniDesk UX Guidelines */}
          <nav className="flex flex-col gap-1 px-space-xs pt-1">
            {/* 1. Overview */}
            <button
              onClick={() => {
                onTabChange("overview");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "overview"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${currentTab === "overview" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">Overview</span>
              </div>
            </button>

            {/* 2. FounderBrief */}
            <button
              onClick={() => {
                onTabChange("founderbrief");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "founderbrief"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${currentTab === "founderbrief" ? "text-tertiary" : "text-outline"}`} />
                <span className="text-xs">FounderBrief</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            </button>

            {/* 3. AI Assistant */}
            <button
              onClick={() => {
                onTabChange("assistant");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "assistant"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Bot className={`w-4 h-4 ${currentTab === "assistant" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">AI Assistant</span>
              </div>
            </button>

            {/* 4. Web Research (Stitch Web Agent) */}
            <button
              onClick={() => {
                onTabChange("research");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "research"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Compass className={`w-4 h-4 ${currentTab === "research" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">Web Research</span>
              </div>
            </button>

            {/* 5. Saved Insights */}
            <button
              onClick={() => {
                onTabChange("insights");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "insights"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className={`w-4 h-4 ${currentTab === "insights" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">Saved Insights</span>
              </div>
              {(savedInsightsCount > 0 || savedCount > 0) && (
                <span className="font-mono text-[10px] text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  {savedInsightsCount || savedCount}
                </span>
              )}
            </button>

            {/* 6. Tasks / Follow-ups */}
            <button
              onClick={() => {
                onTabChange("tasks");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "tasks"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${currentTab === "tasks" ? "text-secondary" : "text-outline"}`} />
                <span className="text-xs">Tasks</span>
              </div>
              {pendingTasksCount > 0 && (
                <span className="font-mono text-[10px] text-secondary px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                  {pendingTasksCount}
                </span>
              )}
            </button>
          </nav>

          {/* Recent Research Quick-Access List */}
          <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-outline-variant/20 px-space-xs">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider">
                Recent Research
              </span>
              <button
                onClick={() => onTabChange("history")}
                className="text-[10px] text-primary hover:underline cursor-pointer"
                type="button"
              >
                View all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {history.length === 0 ? (
                <div className="py-6 text-center text-outline/60 text-xs">
                  Your research will appear here.
                </div>
              ) : (
                history.slice(0, 5).map((item) => {
                  const isActive = item.response.taskId === activeTaskId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onTabChange("research");
                        onCloseMobile();
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? "bg-surface-container-high text-on-surface font-medium"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Clock className="w-3 h-3 text-outline shrink-0" />
                        <span className="truncate">{item.query}</span>
                      </div>
                      <button
                        onClick={(e) => onDeleteHistoryItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-outline hover:text-error rounded transition-opacity"
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

        {/* Footer: User Profile & Landing/Logout Link */}
        <div className="mt-auto pt-3 border-t border-outline-variant/30 px-space-xs space-y-2">
          <div className="p-2 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
            <div
              onClick={onOpenProfileSetup}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition"
              title="Click to edit profile"
            >
              <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-medium text-xs shrink-0">
                {profile?.name ? profile.name[0].toUpperCase() : "O"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {profile?.name || "OmniDesk User"}
                </span>
                <span className="text-[10px] text-outline truncate">
                  {profile?.role || "Personal Workspace"}
                </span>
              </div>
            </div>

            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="p-1.5 text-outline hover:text-on-surface rounded transition"
                title="Return to Public Landing Page"
                type="button"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
