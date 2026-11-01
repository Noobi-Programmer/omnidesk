"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Edit3,
  Copy,
  CheckCircle2,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import type { ActionDraft, ComparisonItem, EmailActionPayload } from "@/lib/contracts";

interface ActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSupplier: ComparisonItem | null;
  actionDraft: ActionDraft | null;
}

export function ActionDrawer({
  isOpen,
  onClose,
  selectedSupplier,
  actionDraft,
}: ActionDrawerProps) {
  // Extract initial email details from draft or supplier
  const draftPayload =
    actionDraft?.payload && actionDraft.payload.kind === "email"
      ? (actionDraft.payload as EmailActionPayload)
      : null;

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedSupplier) {
      const email = selectedSupplier.email || draftPayload?.to || "";
      const subj =
        draftPayload?.subject ||
        `Inquiry: Commercial Supply & Technical Qualification (${selectedSupplier.name})`;
      const defaultBody =
        draftPayload?.body ||
        `Dear Commercial Sales Team,

We are conducting final qualification for supply partners aligned with our production schedule.

Could you please confirm the following technical and commercial terms based on your current production schedule:

1. Pricing tier for initial trial run vs scale volume.
2. Technical conformity and material safety declarations.
3. Current lead times from ${selectedSupplier.location || "your facility"}.
4. Availability of physical samples for evaluation.

We are ready to initiate testing upon confirmation.

Best regards,
Procurement Operations Team`;

      setTo(email);
      setSubject(subj);
      setBody(defaultBody);
    }
  }, [selectedSupplier, draftPayload]);

  if (!isOpen) return null;

  const hasVerifiedEmail = Boolean(to && to.includes("@"));
  const mailtoLink = hasVerifiedEmail
    ? `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : undefined;

  const handleCopyDraft = () => {
    const fullText = `To: ${to || "(Use website contact portal)"}\nSubject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const specsTag =
    draftPayload?.specsSummary ||
    (selectedSupplier
      ? `Specs verified: ${selectedSupplier.facts.product_range || "Standard"} • ${
          selectedSupplier.location || "Direct Supply"
        }`
      : "Specs verified by OmniDesk");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
      />

      {/* Slide-over Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[540px] bg-surface-container-low border-l border-outline-variant/30 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md bg-surface-container border-b border-outline-variant/30">
          <div className="flex items-center gap-space-xs">
            <Edit3 className="w-4 h-4 text-primary" />
            <h2
              id="drawer-title"
              className="font-headline-sm text-headline-sm text-on-surface font-medium"
            >
              Supplier Enquiry Draft
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title="Close Drawer"
            type="button"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
          {/* Metadata Row: To */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline" htmlFor="draft-to">
              Recipient
            </label>
            <div className="flex items-center bg-surface-container rounded border border-outline-variant/30 px-space-sm py-1.5 focus-within:bg-surface-container-high focus-within:border-primary transition-colors">
              <Mail className="w-4 h-4 text-outline mr-space-xs shrink-0" />
              <input
                id="draft-to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="No direct email verified — use contact page"
                className="w-full bg-transparent font-mono-sm text-mono-sm text-on-surface outline-none"
                type="text"
              />
            </div>
            {!hasVerifiedEmail && (
              <div className="flex items-center gap-1.5 text-tertiary font-mono-sm text-[11px] mt-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  No email published online. Copy draft to use on their contact form.
                </span>
              </div>
            )}
          </div>

          {/* Metadata Row: Subject */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-outline" htmlFor="draft-subject">
              Subject
            </label>
            <div className="flex items-center bg-surface-container rounded border border-outline-variant/30 px-space-sm py-1.5 focus-within:bg-surface-container-high focus-within:border-primary transition-colors">
              <input
                id="draft-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none font-sans"
                type="text"
              />
            </div>
          </div>

          {/* Specs Verified Indicator */}
          <div className="flex items-center gap-space-sm p-space-sm bg-surface-container rounded border border-outline-variant/20 font-mono-sm text-mono-sm text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
            <span className="truncate">{specsTag}</span>
          </div>

          {/* Editable Draft Body */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-label-sm text-outline" htmlFor="draft-body">
                Message Body
              </label>
              <span className="font-mono-sm text-[11px] text-outline">
                Grounded Markdown
              </span>
            </div>
            <textarea
              id="draft-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full flex-1 bg-surface-container rounded border border-outline-variant/30 p-space-sm font-mono-sm text-[12px] text-on-surface outline-none resize-none leading-relaxed focus:bg-surface-container-high focus:border-primary transition-colors font-mono"
            />
          </div>

          {/* Action confirmation banner */}
          {copied && (
            <div className="px-space-sm py-1.5 bg-secondary/10 border border-secondary/30 rounded text-secondary font-mono-sm text-mono-sm flex items-center gap-space-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Draft copied to clipboard</span>
            </div>
          )}

          {/* Direct website link fallback */}
          {selectedSupplier?.website && (
            <div className="flex items-center justify-between pt-1 font-mono-sm text-[11px] text-outline border-t border-outline-variant/20">
              <span>Official Website:</span>
              <a
                href={selectedSupplier.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <span>{selectedSupplier.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-space-lg py-space-md bg-surface-container border-t border-outline-variant/30 flex items-center justify-between">
          <button
            onClick={handleCopyDraft}
            className="px-space-md py-[6px] bg-surface-container-high hover:bg-surface-bright text-on-surface rounded font-label-sm text-label-sm flex items-center gap-space-xs transition-colors border border-outline-variant/40"
            type="button"
          >
            <Copy className="w-4 h-4 text-outline" />
            <span>Copy Draft</span>
          </button>

          <div className="flex items-center gap-space-sm">
            {hasVerifiedEmail && mailtoLink ? (
              <a
                href={mailtoLink}
                className="px-space-md py-[6px] bg-primary-container hover:bg-[#ff771a] text-white font-medium rounded font-label-sm text-label-sm flex items-center gap-space-xs transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Open in Email</span>
              </a>
            ) : (
              <button
                disabled
                title="Direct email is not verified for this supplier. Please copy the draft and submit via their contact portal."
                className="px-space-md py-[6px] bg-surface-container-highest text-outline cursor-not-allowed rounded font-label-sm text-label-sm flex items-center gap-space-xs opacity-60"
                type="button"
              >
                <Send className="w-4 h-4" />
                <span>Open in Email (No Email)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
