"use client";

import React from "react";
import { Menu, User, Sun, Moon } from "lucide-react";
import type { UserProfile } from "@/lib/client/workspaceState";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isLiveEngine: boolean;
  profile: UserProfile | null;
  onOpenProfileSetup: () => void;
  currentTheme: "dark" | "light";
  onToggleTheme: () => void;
  activeTabLabel?: string;
  onSearchClick?: () => void;
}

export function Header({
  onToggleMobileMenu,
  isLiveEngine,
  profile,
  onOpenProfileSetup,
  currentTheme,
  onToggleTheme,
  activeTabLabel = "Intelligence",
  onSearchClick,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 bg-surface/85 backdrop-blur-xl z-40 flex items-center justify-between px-4 lg:px-margin-desktop border-b border-outline-variant/30 transition-colors shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left: Mobile hamburger & Terminal Breadcrumb */}
      <div className="flex items-center gap-space-sm">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded transition-colors"
          type="button"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-space-xs text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[16px] text-primary-container">terminal</span>
          <span className="font-mono text-xs text-outline hidden sm:inline">WORKSPACE://APEX-CORE-01</span>
          <span className="font-mono text-xs text-outline-variant hidden sm:inline">/</span>
          <span className="font-mono text-xs text-on-surface font-semibold capitalize">
            {activeTabLabel}
          </span>
        </div>

        <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-primary-container font-mono border border-primary-container/20">
          PROD_LIVE
        </span>
      </div>

      {/* Right: Search Artifacts Pill, Theme Toggle, Engine Status, Profile Avatar */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Quick Search Shortcut Pill */}
        <div
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-low border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:bg-surface-container transition"
          title="Search telemetry and research"
        >
          <span className="material-symbols-outlined text-[16px] text-outline">search</span>
          <span className="font-body-sm text-xs text-outline pr-space-md">Search telemetry...</span>
          <kbd className="font-label-sm text-[10px] font-mono text-outline bg-surface-container-high px-1 rounded border border-outline-variant/30">
            ⌘K
          </kbd>
        </div>

        {/* Workspace Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container border border-outline-variant/20 transition-all flex items-center justify-center cursor-pointer"
          title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} mode`}
          type="button"
          aria-label="Toggle theme"
        >
          {currentTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-primary-container" />
          )}
        </button>

        {/* Live / Mock Indicator */}
        <div
          className="flex items-center gap-space-xs text-outline font-mono-sm text-[11px] bg-surface-container px-space-sm py-[4px] rounded border border-outline-variant/30"
          title={isLiveEngine ? "TinyFish Live Web Search & Fetch active" : "Mock demo pipeline"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveEngine ? "bg-primary-container animate-pulse" : "bg-outline"
            }`}
          />
          <span className="font-medium text-on-surface-variant hidden sm:inline font-mono">
            {isLiveEngine ? "TINYFISH LIVE" : "DEMO ENGINE"}
          </span>
          <span className="font-medium text-on-surface-variant sm:hidden font-mono">
            {isLiveEngine ? "LIVE" : "DEMO"}
          </span>
        </div>

        {/* Profile Avatar Pill */}
        <div
          onClick={onOpenProfileSetup}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-container text-white cursor-pointer shadow-sm hover:bg-[#ff771a] transition-all"
          title={profile?.name ? `${profile.name} (${profile.role})` : "Configure Profile"}
        >
          <User className="w-3.5 h-3.5" />
          <span className="font-label-sm text-xs font-semibold max-w-[80px] truncate hidden md:inline">
            {profile?.name ? profile.name.split(" ")[0] : "Apex"}
          </span>
        </div>
      </div>
    </header>
  );
}
