"use client";

import React from "react";
import { Mail, ExternalLink, ArrowUpRight } from "lucide-react";
import type { ComparisonItem, EvidenceField } from "@/lib/contracts";

interface ComparisonMatrixProps {
  items: ComparisonItem[];
  onSelectSupplierForDraft: (item: ComparisonItem) => void;
  onInspectEvidence: (
    fieldLabel: string,
    evidence: EvidenceField<string>,
    supplierName: string
  ) => void;
}

export function ComparisonMatrix({
  items,
  onSelectSupplierForDraft,
  onInspectEvidence,
}: ComparisonMatrixProps) {
  if (items.length === 0) {
    return (
      <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg text-center font-body-sm text-outline">
        No candidate comparisons available.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 overflow-hidden shadow-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead>
            <tr className="bg-surface-container text-outline font-label-sm text-label-sm select-none border-b border-outline-variant/30">
              <th className="py-space-sm px-space-md font-medium">Supplier</th>
              <th className="py-space-sm px-space-md font-medium">Product range</th>
              <th className="py-space-sm px-space-md font-medium">MOQ</th>
              <th className="py-space-sm px-space-md font-medium">Pricing</th>
              <th className="py-space-sm px-space-md font-medium">Delivery</th>
              <th className="py-space-sm px-space-md font-medium">Status</th>
              <th className="py-space-sm px-space-md font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {items.map((item) => {
              const moqEvidence = item.evidenceFields?.moq;
              const priceEvidence = item.evidenceFields?.pricing;
              const deliveryEvidence = item.evidenceFields?.delivery;
              const isMoqViolation = item.constraintFit === "does_not_meet";

              return (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container transition-colors group"
                >
                  {/* Supplier Name & Location */}
                  <td className="py-space-sm px-space-md">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">
                        {item.name}
                      </span>
                      {item.location && (
                        <span className="font-mono-sm text-mono-sm text-outline">
                          {item.location}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Product Range */}
                  <td className="py-space-sm px-space-md text-on-surface-variant">
                    <span>{item.facts.product_range || "Standard catalogue"}</span>
                  </td>

                  {/* MOQ */}
                  <td className="py-space-sm px-space-md font-mono-sm text-mono-sm">
                    {moqEvidence?.value ? (
                      <button
                        onClick={() =>
                          onInspectEvidence("MOQ", moqEvidence, item.name)
                        }
                        className={`text-left hover:underline cursor-pointer ${
                          isMoqViolation
                            ? "text-tertiary font-semibold"
                            : "text-on-surface"
                        }`}
                        title="Click to view extracted evidence quote"
                        type="button"
                      >
                        {moqEvidence.value}
                      </button>
                    ) : (
                      <span className={item.facts.moq === "Not found" ? "text-outline" : "text-on-surface"}>
                        {item.facts.moq || "Not found"}
                      </span>
                    )}
                  </td>

                  {/* Pricing */}
                  <td className="py-space-sm px-space-md font-mono-sm text-mono-sm">
                    {priceEvidence?.value ? (
                      <button
                        onClick={() =>
                          onInspectEvidence("Pricing", priceEvidence, item.name)
                        }
                        className="text-left text-on-surface hover:underline cursor-pointer"
                        title="Click to view extracted evidence quote"
                        type="button"
                      >
                        {priceEvidence.value}
                      </button>
                    ) : (
                      <span className="text-outline">
                        {item.facts.pricing || "Not found"}
                      </span>
                    )}
                  </td>

                  {/* Delivery */}
                  <td className="py-space-sm px-space-md text-on-surface-variant font-mono-sm text-mono-sm">
                    {deliveryEvidence?.value ? (
                      <button
                        onClick={() =>
                          onInspectEvidence("Delivery", deliveryEvidence, item.name)
                        }
                        className="text-left text-on-surface-variant hover:underline cursor-pointer"
                        title="Click to view extracted evidence quote"
                        type="button"
                      >
                        {deliveryEvidence.value}
                      </button>
                    ) : (
                      <span className="text-outline">
                        {item.facts.delivery || "Not found"}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-space-sm px-space-md">
                    {item.statusBadge === "verified" ? (
                      <span className="inline-flex items-center gap-1.5 px-space-xs py-[2px] rounded bg-secondary/10 text-secondary font-mono-sm text-mono-sm font-medium border border-secondary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Verified
                      </span>
                    ) : item.statusBadge === "does_not_meet" ? (
                      <span className="inline-flex items-center gap-1.5 px-space-xs py-[2px] rounded bg-tertiary/10 text-tertiary font-mono-sm text-mono-sm font-medium border border-tertiary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                        Does not meet
                      </span>
                    ) : item.statusBadge === "missing_info" ? (
                      <span className="inline-flex items-center gap-1.5 px-space-xs py-[2px] rounded bg-surface-container-highest text-outline font-mono-sm text-mono-sm border border-outline-variant/30">
                        Missing info
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-space-xs py-[2px] rounded bg-surface-container-highest text-outline font-mono-sm text-mono-sm border border-outline-variant/30">
                        Unverified
                      </span>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="py-space-sm px-space-md text-right">
                    <div className="inline-flex items-center gap-space-xs">
                      {item.specSheetUrl && (
                        <a
                          href={item.specSheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono-sm text-mono-sm text-primary hover:underline inline-flex items-center gap-[2px] mr-1"
                          title="Open technical spec document"
                        >
                          <span className="truncate max-w-[100px]">
                            {item.specSheetLabel || "spec-sheet.pdf"}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => onSelectSupplierForDraft(item)}
                        className="p-1 text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
                        title={`Draft enquiry to ${item.name}`}
                        type="button"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (< md) */}
      <div className="md:hidden divide-y divide-outline-variant/20">
        {items.map((item) => {
          const isMoqViolation = item.constraintFit === "does_not_meet";

          return (
            <div key={item.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-on-surface text-base">
                    {item.name}
                  </h4>
                  {item.location && (
                    <span className="font-mono-sm text-xs text-outline">
                      {item.location}
                    </span>
                  )}
                </div>

                {item.statusBadge === "verified" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/10 text-secondary font-mono-sm text-[11px] font-medium border border-secondary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Verified
                  </span>
                ) : item.statusBadge === "does_not_meet" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-mono-sm text-[11px] font-medium border border-tertiary/20">
                    Does not meet
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-outline font-mono-sm text-[11px]">
                    {item.statusBadge || "Unverified"}
                  </span>
                )}
              </div>

              {/* Key Values */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-sm bg-surface-container p-2.5 rounded border border-outline-variant/30">
                <div>
                  <span className="text-outline block text-[10px] uppercase">MOQ</span>
                  <span className={isMoqViolation ? "text-tertiary font-bold" : "text-on-surface"}>
                    {item.facts.moq || "Not found"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Pricing</span>
                  <span className="text-on-surface">
                    {item.facts.pricing || "Not found"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Delivery</span>
                  <span className="text-on-surface-variant">
                    {item.facts.delivery || "Not found"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Format</span>
                  <span className="text-on-surface-variant truncate block">
                    {item.facts.product_range || "Standard"}
                  </span>
                </div>
              </div>

              {/* Mobile Action Bar */}
              <div className="flex items-center justify-between pt-1">
                {item.specSheetUrl ? (
                  <a
                    href={item.specSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-xs font-mono flex items-center gap-1 hover:underline"
                  >
                    <span>{item.specSheetLabel || "spec-sheet.pdf"}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => onSelectSupplierForDraft(item)}
                  className="px-3 py-1 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded text-xs font-medium flex items-center gap-1.5 transition"
                  type="button"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Prepare enquiry</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
