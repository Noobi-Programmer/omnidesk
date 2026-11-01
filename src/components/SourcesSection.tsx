"use client";

import React, { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { SourceDocument } from "@/lib/contracts";

interface SourcesSectionProps {
  sources: SourceDocument[];
}

export function SourcesSection({ sources }: SourcesSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (sources.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-md flex flex-col gap-space-sm">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between text-left w-full group cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
          <ChevronDown
            className={`w-4 h-4 text-outline group-hover:text-primary transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="font-medium">
            Sources ({sources.length} primary registries &amp; verified catalogs)
          </span>
        </div>
        <span className="font-mono-sm text-mono-sm text-outline group-hover:text-on-surface-variant transition-colors">
          Cross-indexed
        </span>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="flex flex-col gap-space-xs pt-space-xs pl-space-md divide-y divide-outline-variant/10">
          {sources.map((s, idx) => {
            const displayTitle = s.title || s.domain;

            return (
              <div
                key={s.id}
                className="flex items-baseline justify-between font-mono-sm text-mono-sm text-on-surface-variant hover:text-on-surface py-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate max-w-xl">
                  <span className="text-outline">{idx + 1}.</span>
                  <span className="truncate">{displayTitle}</span>
                  {s.fetchedVia === "agent" && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1 rounded ml-1">
                      Agent
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-space-sm shrink-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5"
                    title={s.url}
                  >
                    <span>{s.domain}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
