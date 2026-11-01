"use client";

import React from "react";
import { Menu, User, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu: () => void;
  isLiveEngine: boolean;
}

export function Header({ onToggleMobileMenu, isLiveEngine }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-4 lg:px-margin-desktop border-b border-outline-variant/30">
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
          <span className="font-label-md text-outline">Workspace</span>
          <span className="font-label-md text-outline-variant">/</span>
          <span className="font-label-md text-on-surface font-medium">Intelligence</span>
        </div>
      </div>

      {/* Right: Live Engine Indicator & User Avatar */}
      <div className="flex items-center gap-space-md">
        <div
          className="flex items-center gap-space-xs text-outline font-mono-sm text-[11px] bg-surface-container px-space-sm py-[4px] rounded border border-outline-variant/30"
          title={isLiveEngine ? "TinyFish Live Web Search & Fetch active" : "Mock demo pipeline"}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveEngine ? "bg-secondary animate-pulse" : "bg-primary"}`} />
          <span className="font-medium text-on-surface-variant">
            {isLiveEngine ? "LIVE ENGINE" : "LOCAL DEMO"}
          </span>
        </div>

        <div
          className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-primary/40 transition-all"
          title="Account Profile"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
