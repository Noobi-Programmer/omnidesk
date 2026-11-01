"use client";

import React from "react";
import {
  Compass,
  Inbox,
  CheckCircle,
  History,
  Plus,
  ChevronsUpDown,
  User,
  Trash2,
  X,
} from "lucide-react";
import type { ResearchHistoryItem } from "@/lib/contracts";

interface SidebarProps {
  currentTab: "research" | "inbox" | "tasks" | "history";
  onTabChange: (tab: "research" | "inbox" | "tasks" | "history") => void;
  onNewResearch: () => void;
  history: ResearchHistoryItem[];
  activeTaskId: string | null;
  onSelectHistoryItem: (item: ResearchHistoryItem) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
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
        className={`fixed left-0 top-0 h-full w-60 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between py-space-sm px-space-xs transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-space-sm overflow-hidden">
          {/* Header & Logo */}
          <div className="flex items-center justify-between px-space-sm py-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-medium">
                OmniDesk
              </span>
              <span className="font-mono-sm text-mono-sm text-outline px-space-xs py-[1px] bg-surface-container rounded border border-outline-variant/30">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="flex items-center justify-center p-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors"
                title="Workspace: Intelligence Desk"
                type="button"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
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
              className="w-full flex items-center justify-between px-space-sm py-space-xs bg-surface-container text-on-surface hover:bg-surface-container-high rounded border border-outline-variant/40 transition-colors text-left group"
              type="button"
            >
              <div className="flex items-center gap-space-xs">
                <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-label-md text-label-md">New Research</span>
              </div>
              <kbd className="font-mono-sm text-mono-sm text-outline bg-surface-container-lowest px-1 py-0.5 rounded border border-outline-variant/30">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-[2px] px-space-xs">
            <button
              onClick={() => {
                onTabChange("research");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-sm py-[6px] rounded transition-colors text-left ${
                currentTab === "research"
                  ? "bg-surface-container-high text-on-surface font-medium border-l-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Compass className="w-4 h-4 text-primary" />
                <span className="font-body-sm text-body-sm">Research</span>
              </div>
            </button>

            <button
              onClick={() => {
                onTabChange("inbox");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-sm py-[6px] rounded transition-colors text-left ${
                currentTab === "inbox"
                  ? "bg-surface-container-high text-on-surface font-medium border-l-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <Inbox className="w-4 h-4 text-outline" />
                <span className="font-body-sm text-body-sm">Inbox</span>
              </div>
              <span className="font-mono-sm text-[10px] text-outline px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/30">
                Roadmap
              </span>
            </button>

            <button
              onClick={() => {
                onTabChange("tasks");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-sm py-[6px] rounded transition-colors text-left ${
                currentTab === "tasks"
                  ? "bg-surface-container-high text-on-surface font-medium border-l-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <CheckCircle className="w-4 h-4 text-outline" />
                <span className="font-body-sm text-body-sm">Tasks</span>
              </div>
              <span className="font-mono-sm text-[10px] text-outline px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/30">
                Roadmap
              </span>
            </button>

            <button
              onClick={() => {
                onTabChange("history");
                onCloseMobile();
              }}
              className={`flex items-center justify-between px-space-sm py-[6px] rounded transition-colors text-left ${
                currentTab === "history"
                  ? "bg-surface-container-high text-on-surface font-medium border-l-2 border-primary-container"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
              type="button"
            >
              <div className="flex items-center gap-space-sm">
                <History className="w-4 h-4 text-outline" />
                <span className="font-body-sm text-body-sm">History</span>
              </div>
              {history.length > 0 && (
                <span className="font-mono-sm text-mono-sm text-outline">
                  {history.length}
                </span>
              )}
            </button>
          </nav>

          {/* Divider */}
          <div className="h-[1px] bg-surface-container mx-space-sm my-space-xs" />

          {/* Recent Research Runs */}
          <div className="flex flex-col gap-[2px] px-space-xs flex-1 overflow-hidden">
            <div className="px-space-sm py-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider flex items-center justify-between">
              <span>Recent</span>
              <span className="font-mono-sm text-[10px] text-outline-variant">
                Local
              </span>
            </div>

            <div className="flex flex-col gap-[1px] overflow-y-auto max-h-[38vh] pr-1">
              {history.length === 0 ? (
                <div className="px-space-sm py-2 text-outline font-body-sm text-[12px] italic">
                  No prior sessions yet. Run a research query to start.
                </div>
              ) : (
                history.slice(0, 8).map((item) => {
                  const isActive = item.id === activeTaskId;
                  return (
                    <div
                      key={item.id}
                      className={`group flex items-center justify-between px-space-sm py-[5px] rounded transition-colors ${
                        isActive
                          ? "bg-surface-container-high text-on-surface font-medium"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onCloseMobile();
                        }}
                        className="truncate text-left flex-1 font-body-sm text-[12px]"
                        title={item.query}
                        type="button"
                      >
                        <span className="truncate block">{item.query}</span>
                      </button>
                      <button
                        onClick={(e) => onDeleteHistoryItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-outline hover:text-error transition-all"
                        title="Delete session"
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

        {/* User Card */}
        <div className="p-space-xs border-t border-outline-variant/30">
          <div className="flex items-center justify-between p-space-sm rounded hover:bg-surface-container transition-colors cursor-pointer">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <User className="w-4 h-4 text-on-primary-container" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface leading-none">
                  Apex Global
                </span>
                <span className="font-mono-sm text-mono-sm text-outline leading-none mt-1">
                  Local Workspace
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-secondary" title="Workspace active" />
          </div>
        </div>
      </aside>
    </>
  );
}
