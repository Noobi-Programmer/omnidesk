"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Globe, Terminal } from "lucide-react";
import type { ResearchPlan, ResearchStage, SourceDocument } from "@/lib/contracts";

interface ResearchProgressProps {
  currentStage: ResearchStage | "idle";
  progressPercent: number;
  progressMsg: string;
  plan: ResearchPlan | null;
  sources: SourceDocument[];
  agentLiveUrl: string | null;
  isRunning: boolean;
}

export function ResearchProgress({
  currentStage,
  progressPercent,
  progressMsg,
  plan,
  sources,
  agentLiveUrl,
  isRunning,
}: ResearchProgressProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (currentStage === "idle") return null;

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-md flex flex-col gap-space-sm shadow-sm">
      {/* Progress status line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono-sm text-mono-sm text-outline">
        <div className="flex items-center gap-space-xs">
          {isRunning ? (
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-secondary" />
          )}
          <span className="text-on-surface font-medium uppercase tracking-wider">
            {currentStage}
          </span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface-variant truncate max-w-lg">{progressMsg}</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span>{progressPercent}%</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline font-mono"
            type="button"
          >
            <Terminal className="w-3 h-3" />
            <span>Telemetry</span>
            {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-container rounded-full h-1 overflow-hidden">
        <div
          className="bg-primary-container h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
        />
      </div>

      {/* Collapsible Telemetry / Technical Details */}
      {showDetails && (
        <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2 font-mono-sm text-[11px] text-on-surface-variant">
          {plan && (
            <div className="space-y-1">
              <span className="text-outline uppercase text-[10px] tracking-wider">
                Planned TinyFish Queries ({plan.queries.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {plan.queries.map((q) => (
                  <span
                    key={q.id}
                    className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    &ldquo;{q.query}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-outline uppercase text-[10px] tracking-wider">
                Active Sources ({sources.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {sources.map((s) => (
                  <span
                    key={s.id}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-outline text-[11px]"
                  >
                    <Globe className="w-2.5 h-2.5" />
                    <span>{s.domain}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === "ok" ? "bg-secondary" : "bg-outline"}`} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Browser Agent Stream PIP (if active) */}
      {agentLiveUrl && (
        <div className="mt-2 rounded overflow-hidden border border-primary/40 shadow-lg">
          <div className="bg-surface-container px-3 py-1.5 flex items-center justify-between font-mono-sm text-[11px] text-on-surface">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>TinyFish Browser Agent Live Execution</span>
            </div>
            <a
              href={agentLiveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              <span>Full screen</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <iframe
            src={agentLiveUrl}
            title="TinyFish Browser Agent Live View"
            className="w-full h-64 border-0 bg-white"
          />
        </div>
      )}
    </div>
  );
}
