"use client";

import React, { useState } from "react";
import {
  X,
  Bookmark,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { FounderBriefItem } from "@/lib/client/workspaceState";

interface BriefDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FounderBriefItem | null;
  onSaveInsight: (item: FounderBriefItem) => void;
  onCreateTask: (title: string, notes?: string) => void;
  isSaved: boolean;
  onDeepWebResearch?: (query: string) => void;
}

export function BriefDetailModal({
  isOpen,
  onClose,
  item,
  onSaveInsight,
  onCreateTask,
  isSaved,
  onDeepWebResearch,
}: BriefDetailModalProps) {
  const [taskCreated, setTaskCreated] = useState(false);

  if (!isOpen || !item) return null;

  const brief = item.deepBrief;

  const handleCreateTaskClick = () => {
    onCreateTask(
      `Investigate implications: ${item.headline}`,
      `Review key takeaways regarding ${item.category} (${item.source}):\n${brief?.whyItMatters || item.summary}`
    );
    setTaskCreated(true);
    setTimeout(() => setTaskCreated(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface-container rounded-lg border border-outline-variant/60 shadow-2xl flex flex-col overflow-hidden max-h-[88vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-sm text-outline">
            <span className="text-primary font-medium">{item.category}</span>
            <span>•</span>
            <span>{item.source}</span>
            <span>•</span>
            <span>{item.publishedAt}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            type="button"
            aria-label="Close brief"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-md">
          {/* Main Headline */}
          <h2 className="font-headline-sm text-lg text-on-surface font-semibold leading-snug">
            {item.headline}
          </h2>

          {/* Section 1: What Happened */}
          {brief?.whatHappened && (
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
                What Happened
              </span>
              <ul className="space-y-1.5">
                {brief.whatHappened.map((pt, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 font-body-sm text-[13px] text-on-surface-variant leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 2: Why It Matters */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-[11px] text-secondary uppercase tracking-wider font-semibold">
              Why It Matters To You
            </span>
            <div className="bg-surface-container-low p-3 rounded border border-outline-variant/30 font-body-sm text-[13px] text-on-surface leading-relaxed">
              {brief?.whyItMatters || item.relevanceExplanation}
            </div>
          </div>

          {/* Section 3: Implications & Opportunities */}
          {brief?.implications && (
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-[11px] text-tertiary uppercase tracking-wider font-semibold">
                Strategic Implications
              </span>
              <ul className="space-y-1.5">
                {brief.implications.map((imp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 font-body-sm text-[13px] text-on-surface-variant leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1.5 shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: Sources & Citations */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
            <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider font-semibold">
              Primary Sources &amp; Evidence
            </span>
            <div className="flex flex-wrap gap-2">
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high text-primary rounded font-mono-sm text-[11px] flex items-center gap-1 border border-outline-variant/30 transition"
                >
                  <FileText className="w-3 h-3" />
                  <span>{item.source}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
              {brief?.citations?.map((cit, idx) => (
                <a
                  key={idx}
                  href={cit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded font-mono-sm text-[11px] flex items-center gap-1 border border-outline-variant/30 transition"
                >
                  <ExternalLink className="w-2.5 h-2.5 text-outline" />
                  <span>{cit.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-space-lg py-space-sm bg-surface-container-low border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSaveInsight(item)}
              className={`px-3 py-1.5 rounded text-xs font-mono-sm flex items-center gap-1.5 border transition ${
                isSaved
                  ? "bg-secondary/15 text-secondary border-secondary/40 font-medium"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-secondary" : ""}`} />
              <span>{isSaved ? "Insight Saved" : "Save Insight"}</span>
            </button>

            <button
              type="button"
              onClick={handleCreateTaskClick}
              className={`px-3 py-1.5 rounded text-xs font-mono-sm flex items-center gap-1.5 border transition ${
                taskCreated
                  ? "bg-secondary/15 text-secondary border-secondary/40 font-medium"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{taskCreated ? "Task Added!" : "Create Follow-up Task"}</span>
            </button>
          </div>

          {onDeepWebResearch && (
            <button
              type="button"
              onClick={() => {
                onDeepWebResearch(`Research implications of: ${item.headline}`);
                onClose();
              }}
              className="px-3 py-1.5 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-sm text-xs flex items-center gap-1.5 transition font-semibold shadow-sm cursor-pointer"
            >
              <span>Research on Web</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
