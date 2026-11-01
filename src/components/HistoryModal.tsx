"use client";

import React from "react";
import { X, History, Trash2, ArrowRight, RotateCcw } from "lucide-react";
import type { ResearchHistoryItem } from "@/lib/contracts";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ResearchHistoryItem[];
  onSelect: (item: ResearchHistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onSelect,
  onDelete,
  onClearAll,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface-container rounded-lg border border-outline-variant/60 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant/30 bg-surface-container-low">
          <div className="flex items-center gap-space-xs">
            <History className="w-5 h-5 text-primary" />
            <h2 className="font-headline-sm text-base text-on-surface font-medium">
              Research History ({history.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            type="button"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="py-12 text-center text-outline font-body-sm">
              <History className="w-8 h-8 text-outline mx-auto mb-2 opacity-50" />
              <p>No research sessions saved yet.</p>
              <p className="text-xs text-outline mt-1">
                Completed research runs will automatically be preserved in your local browser history.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-surface-container-low hover:bg-surface-container-high rounded border border-outline-variant/30 flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-sm text-[11px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/20">
                      {item.id}
                    </span>
                    <span className="font-mono-sm text-[11px] text-outline">
                      {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-on-surface truncate mt-1">
                    {item.query}
                  </h4>
                  <div className="flex items-center gap-3 font-mono-sm text-[11px] text-outline-variant mt-1">
                    <span>
                      {item.response.comparison?.length || 0} suppliers qualified
                    </span>
                    <span>•</span>
                    <span>
                      {item.response.sources?.length || 0} sources indexed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-sm text-xs flex items-center gap-1 transition shadow-sm cursor-pointer font-medium"
                    type="button"
                  >
                    <span>Reopen</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => onDelete(item.id, e)}
                    className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded transition-colors"
                    title="Delete session"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-space-lg py-space-sm bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-outline hover:text-error transition font-mono flex items-center gap-1"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-space-md py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded text-xs transition"
              type="button"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
