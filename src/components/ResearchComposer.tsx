"use client";

import React from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import type { ResearchMode } from "@/lib/contracts";

interface ResearchComposerProps {
  prompt: string;
  setPrompt: (value: string) => void;
  mode: ResearchMode;
  setMode: (mode: ResearchMode) => void;
  onSubmit: () => void;
  isRunning: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const PRESETS = [
  {
    label: "EU Cold Brew Cans (Stitch Target)",
    query: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
    target: "EU/EMEA / BPA-NI Compliance",
  },
  {
    label: "Bengaluru D2C Packaging",
    query: "Find reliable custom corrugated packaging suppliers in Bengaluru for small D2C brand (MOQ < 500)",
    target: "India / FSC & ISO Certified",
  },
  {
    label: "Precision Aluminum Casing",
    query: "Precision aluminum casing CNC machining manufacturers in Germany with ISO 9001",
    target: "DACH / Industrial Spec",
  },
];

export function ResearchComposer({
  prompt,
  setPrompt,
  mode,
  setMode,
  onSubmit,
  isRunning,
  textareaRef,
}: ResearchComposerProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isRunning && prompt.trim()) {
        onSubmit();
      }
    }
  };

  // Derive target badge from current prompt
  const matchedPreset = PRESETS.find((p) => p.query.trim() === prompt.trim());
  const targetTag =
    matchedPreset?.target ||
    (prompt.toLowerCase().includes("eu") || prompt.toLowerCase().includes("cold brew")
      ? "Target: EU/EMEA / BPA-NI Compliance"
      : prompt.toLowerCase().includes("bengaluru")
      ? "Target: India / D2C Sourcing"
      : "Target: Verified Direct Manufacturers");

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col gap-space-md shadow-sm">
      {/* Top Header & Dynamic Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-medium flex items-center gap-2">
          <span>What would you like to get done?</span>
        </h1>
        <div className="flex items-center gap-space-xs font-mono-sm text-mono-sm text-outline">
          <span>{targetTag}</span>
        </div>
      </div>

      {/* Input Shell */}
      <div className="bg-surface-container rounded border border-outline-variant/40 p-space-sm flex flex-col gap-space-sm focus-within:bg-surface-container-high focus-within:border-primary-container transition-colors">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          rows={2}
          id="search-input"
          placeholder="Ask OmniDesk to research, compare, or qualify suppliers..."
          className="w-full bg-transparent resize-none outline-none font-body-md text-body-md text-on-surface placeholder:text-outline leading-relaxed font-sans"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-space-xs border-t border-outline-variant/20">
          {/* Modes */}
          <div className="flex items-center gap-[4px]" id="mode-selector">
            {(["quick", "standard", "deep"] as const).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  disabled={isRunning}
                  type="button"
                  className={`px-space-sm py-[4px] rounded font-label-sm text-label-sm capitalize transition-colors ${
                    isActive
                      ? "bg-surface-container-highest text-on-surface font-medium border border-outline-variant/50"
                      : "text-outline hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {m} {isActive && "(Active)"}
                </button>
              );
            })}
          </div>

          {/* Action & Shortcut Hint */}
          <div className="flex items-center justify-end gap-space-sm">
            <span className="font-mono-sm text-mono-sm text-outline hidden sm:inline select-none">
              ⌘ + Enter to execute
            </span>
            <button
              onClick={onSubmit}
              disabled={isRunning || !prompt.trim()}
              type="button"
              className="px-space-md py-[6px] bg-primary-container hover:bg-[#6c78de] disabled:opacity-50 disabled:hover:bg-primary-container text-on-primary-container rounded font-label-md text-label-md flex items-center gap-space-xs transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-on-primary-container" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-on-primary-container" />
                  <span>Research</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="font-mono-sm text-mono-sm text-outline">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPrompt(p.query)}
            disabled={isRunning}
            type="button"
            className="font-mono-sm text-[11px] text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/30 transition-colors truncate max-w-[280px]"
            title={p.query}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
