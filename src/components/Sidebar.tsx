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
} from "lucide-react";
import type { ResearchHistoryItem } from "@/lib/contracts";

export type WorkspaceTab = "research" | "bytes" | "history" | "saved";

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
  savedCount: number;
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
  savedCount,
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
                v3.0
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden flex items-center justify-center p-space-xs text-outline hover:text-on-surface hover:bg-surface-container rounded transition-colors"
              type="button"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Research Button */}
          <div className="px-space-xs">
            <button
              onClick={() => {
                onNewResearch();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-space-sm py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl transition-all shadow-xs group font-medium"
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

          {/* Main Focused Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-xs pt-1">
            {/* 1. Deep Research (Pillar 1) */}
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
                <span className="text-xs">Deep Research</span>
              </div>
              <span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container">
                Pillar A
              </span>
            </button>

            {/* 2. Founder Bytes (Pillar 2) */}
            <button
              onClick={() => {
                onTabChange("bytes");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "bytes"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${currentTab === "bytes" ? "text-tertiary" : "text-outline"}`} />
                <span className="text-xs">Founder Bytes</span>
              </div>
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </button>

            {/* 3. History */}
            <button
              onClick={() => {
                onTabChange("history");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "history"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <History className={`w-4 h-4 ${currentTab === "history" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">History</span>
              </div>
              {history.length > 0 && (
                <span className="font-mono text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container">
                  {history.length}
                </span>
              )}
            </button>

            {/* 4. Saved */}
            <button
              onClick={() => {
                onTabChange("saved");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors text-left ${
                currentTab === "saved"
                  ? "bg-surface-container-high text-on-surface font-semibold border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className={`w-4 h-4 ${currentTab === "saved" ? "text-primary" : "text-outline"}`} />
                <span className="text-xs">Saved</span>
              </div>
              {savedCount > 0 && (
                <span className="font-mono text-[10px] text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Recent Research Quick-Access List */}
          <div className="flex-1 flex flex-col min-h-0 pt-3 border-t border-outline-variant/20 px-space-xs">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-mono text-outline uppercase tracking-wider">
                Recent Queries
              </span>
              <button
                onClick={() => onTabChange("history")}
                className="text-[10px] text-primary hover:underline"
                type="button"
              >
                View all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {history.length === 0 ? (
                <div className="py-6 text-center text-outline/60 text-xs">
                  No previous queries yet.
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

        {/* Footer: TinyFish Engine Info & Wallet Status */}
        <div className="mt-auto pt-3 border-t border-outline-variant/30 px-space-sm space-y-2">
          <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-on-surface flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                TinyFish Connected
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-800/40">
                $17.00
              </span>
            </div>
            <p className="text-[10px] text-outline leading-tight">
              Search • Fetch • TinyMonitor
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
