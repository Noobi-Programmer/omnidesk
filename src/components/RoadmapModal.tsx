"use client";

import React from "react";
import { X, Layers, Clock, ShieldCheck } from "lucide-react";

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: "Inbox" | "Tasks";
}

export function RoadmapModal({ isOpen, onClose, featureName }: RoadmapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface-container rounded-lg border border-outline-variant/60 shadow-2xl p-space-lg flex flex-col gap-space-md"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
          <div className="flex items-center gap-space-xs">
            <Clock className="w-4 h-4 text-tertiary" />
            <h3 className="font-headline-sm text-sm text-on-surface font-medium">
              Feature Roadmap: {featureName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-space-sm font-body-sm text-xs text-on-surface-variant leading-relaxed">
          <p>
            The <strong className="text-on-surface">{featureName}</strong> system is currently scheduled in the OmniDesk phased roadmap.
          </p>
          <div className="bg-surface-container-low p-3 rounded border border-outline-variant/30 space-y-1.5 font-mono-sm text-[11px]">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Core Journey Active</span>
            </div>
            <p className="text-outline">
              User Prompt → TinyFish Live Search → Retrieval → Entity Qualification → Evidence Extraction → Grounded Comparison → Action Drafting.
            </p>
          </div>
          <p className="text-outline">
            Outreach drafts prepared in the current session can be copied or launched via your email client using the contextual Action Drawer.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-space-md py-1.5 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-sm text-xs transition shadow-sm font-semibold cursor-pointer"
            type="button"
          >
            Back to Research
          </button>
        </div>
      </div>
    </div>
  );
}
