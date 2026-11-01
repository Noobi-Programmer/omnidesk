"use client";

import React from "react";
import type { Recommendation, ComparisonItem } from "@/lib/contracts";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  comparison: ComparisonItem[];
  extractionMethod?: string;
}

export function RecommendationPanel({
  recommendations,
  comparison,
  extractionMethod = "Deterministic extraction",
}: RecommendationPanelProps) {
  if (recommendations.length === 0) return null;

  const topRec = recommendations[0];
  const topSupplier = comparison.find((c) => c.id === topRec?.itemId);

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col gap-space-xs shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
          Recommendation
        </span>
        <span className="font-mono-sm text-mono-sm text-outline">
          {extractionMethod}
        </span>
      </div>

      <p className="font-body-md text-body-md text-on-surface leading-relaxed max-w-4xl">
        {topRec.rationale}
      </p>

      {/* Secondary caveats or risks if present */}
      {topRec.risks && topRec.risks.length > 0 && (
        <div className="mt-2 pt-2 border-t border-outline-variant/20 flex flex-wrap gap-2 text-xs">
          <span className="font-mono-sm text-outline">Important caveat:</span>
          <span className="text-tertiary font-mono-sm">{topRec.risks[0]}</span>
        </div>
      )}
    </div>
  );
}
