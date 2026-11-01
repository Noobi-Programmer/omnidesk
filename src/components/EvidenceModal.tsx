"use client";

import React from "react";
import { X, ExternalLink, ShieldCheck, FileText, Clock } from "lucide-react";
import type { EvidenceField } from "@/lib/contracts";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fieldLabel: string;
  evidence: EvidenceField<string> | null;
  supplierName?: string;
}

export function EvidenceModal({
  isOpen,
  onClose,
  title,
  fieldLabel,
  evidence,
  supplierName,
}: EvidenceModalProps) {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-surface-container rounded-lg border border-outline-variant/60 shadow-2xl p-space-lg flex flex-col gap-space-md"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30">
          <div className="flex items-center gap-space-xs">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <h3 className="font-headline-sm text-sm text-on-surface font-medium">
              Verified Fact Citation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            type="button"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-space-sm font-body-sm text-xs">
          {supplierName && (
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">
                Supplier
              </span>
              <span className="font-medium text-on-surface text-sm">
                {supplierName}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">
              Extracted Attribute ({fieldLabel})
            </span>
            <div className="font-mono-sm text-on-surface font-semibold bg-surface-container-low p-2 rounded border border-outline-variant/30">
              {evidence.value || "Not found"}
            </div>
          </div>

          {/* Supporting Quote */}
          {evidence.supportingQuote && (
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">
                Exact Grounded Substring Quote
              </span>
              <blockquote className="bg-surface-container-low/70 border-l-2 border-secondary p-2.5 rounded-r font-mono-sm text-[11px] text-on-surface-variant leading-relaxed italic">
                &ldquo;{evidence.supportingQuote}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Source Document Metadata */}
          <div className="flex flex-col gap-1 pt-1 border-t border-outline-variant/20">
            {evidence.sourceTitle && (
              <div className="flex items-center gap-1.5 text-on-surface-variant font-mono-sm text-[11px]">
                <FileText className="w-3 h-3 text-outline shrink-0" />
                <span className="truncate">{evidence.sourceTitle}</span>
              </div>
            )}

            {evidence.sourceUrl && (
              <a
                href={evidence.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline font-mono-sm text-[11px] truncate"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{evidence.sourceUrl}</span>
              </a>
            )}

            {evidence.retrievedAt && (
              <div className="flex items-center gap-1 text-outline font-mono-sm text-[10px] mt-1">
                <Clock className="w-2.5 h-2.5" />
                <span>Indexed at {new Date(evidence.retrievedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-space-xs">
          <button
            onClick={onClose}
            className="px-space-md py-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded font-label-sm text-xs transition-colors"
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
