"use client";

import React from "react";
import { Menu, User, Sun, Moon, Sparkles } from "lucide-react";
import type { UserProfile } from "@/lib/client/workspaceState";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isLiveEngine: boolean;
  profile: UserProfile | null;
  onOpenProfileSetup: () => void;
  currentTheme: "dark" | "light";
  onToggleTheme: () => void;
  activeTabLabel?: string;
}

export function Header({
  onToggleMobileMenu,
  isLiveEngine,
  profile,
  onOpenProfileSetup,
  currentTheme,
  onToggleTheme,
  activeTabLabel = "Intelligence",
}: HeaderProps) {
  const greeting = profile?.name ? `Hello, ${profile.name.split(" ")[0]}` : "Workspace";

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-4 lg:px-margin-desktop border-b border-outline-variant/30 transition-colors">
      {/* Left: Mobile hamburger & Breadcrumb */}
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
          <span className="font-label-md text-outline">{greeting}</span>
          <span className="font-label-md text-outline-variant">/</span>
          <span className="font-label-md text-on-surface font-medium capitalize">
            {activeTabLabel}
          </span>
        </div>
      </div>

      {/* Right: Theme Toggle, Live Engine Indicator & User Avatar */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        {/* Workspace Theme Toggle (Inside workspace only, defaults dark) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container border border-outline-variant/20 transition-all flex items-center justify-center"
          title={`Switch to ${currentTheme === "dark" ? "Light" : "Dark"} mode`}
          type="button"
          aria-label="Toggle theme"
        >
          {currentTheme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Live / Mock Indicator */}
        <div
          className="flex items-center gap-space-xs text-outline font-mono-sm text-[11px] bg-surface-container px-space-sm py-[4px] rounded border border-outline-variant/30"
          title={isLiveEngine ? "TinyFish Live Web Search & Fetch active" : "Mock demo pipeline"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveEngine ? "bg-secondary animate-pulse" : "bg-primary"
            }`}
          />
          <span className="font-medium text-on-surface-variant hidden sm:inline">
            {isLiveEngine ? "LIVE ENGINE" : "LOCAL DEMO"}
          </span>
          <span className="font-medium text-on-surface-variant sm:hidden">
            {isLiveEngine ? "LIVE" : "DEMO"}
          </span>
        </div>

        {/* Profile Pill */}
        <div
          onClick={onOpenProfileSetup}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-container text-on-primary-container cursor-pointer shadow-sm hover:ring-2 hover:ring-primary/40 transition-all"
          title={profile?.name ? `${profile.name} (${profile.role})` : "Configure Profile"}
        >
          <User className="w-3.5 h-3.5" />
          <span className="font-label-sm text-xs font-medium max-w-[80px] truncate hidden md:inline">
            {profile?.name ? profile.name.split(" ")[0] : "Profile"}
          </span>
        </div>
      </div>
    </header>
  );
}
