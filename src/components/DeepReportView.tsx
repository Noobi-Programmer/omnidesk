"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Building,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ResearchReport, ResearchResponse } from "@/lib/contracts";

interface DeepReportViewProps {
  report?: ResearchReport;
  response?: ResearchResponse;
  onSaveReport?: (response: ResearchResponse) => void;
  isSaved?: boolean;
}

export function DeepReportView({
  report: propReport,
  response,
  onSaveReport,
  isSaved = false,
}: DeepReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  // If report not passed directly, grab from response
  const report = propReport || response?.report;

  if (!report) {
    return (
      <div className="p-8 text-center text-outline">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No structured deep report available for this query.</p>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    let md = `# ${report.title}\n\n`;
    md += `**Objective:** ${report.objective}\n\n`;
    md += `## Executive Summary\n${report.executiveSummary}\n\n`;
    md += `## Methodology\n${report.methodology}\n\n`;
    md += `## Key Findings\n${report.keyFindings.map((f) => `- ${f}`).join("\n")}\n\n`;

    report.sections.forEach((s) => {
      md += `## ${s.heading}\n${s.content}\n\n`;
    });

    if (report.relevantEntities.length > 0) {
      md += `## Identified Entities\n`;
      report.relevantEntities.forEach((e) => {
        md += `- **${e.name}** (${e.type}): ${e.description}${e.sourceUrl ? ` [Link](${e.sourceUrl})` : ""}\n`;
      });
      md += `\n`;
    }

    if (report.statisticsAndEvidence.length > 0) {
      md += `## Statistics & Evidence\n`;
      report.statisticsAndEvidence.forEach((ev) => {
        md += `- **${ev.claim}**: ${ev.value} (Source: [${ev.sourceTitle}](${ev.sourceUrl}))\n`;
      });
      md += `\n`;
    }

    if (report.conflictsAndUncertainties.length > 0) {
      md += `## Missing Evidence & Uncertainties\n`;
      report.conflictsAndUncertainties.forEach((u) => {
        md += `- ${u}\n`;
      });
      md += `\n`;
    }

    if (report.implicationsAndConclusions.length > 0) {
      md += `## Strategic Implications & Recommendations\n`;
      report.implicationsAndConclusions.forEach((c) => {
        md += `- ${c}\n`;
      });
      md += `\n`;
    }

    md += `## Verified Sources & Citations\n`;
    report.citations.forEach((c, idx) => {
      md += `[${idx + 1}] [${c.sourceTitle}](${c.sourceUrl}) — retrieved ${c.retrievedAt}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `omnidesk-research-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Report Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              DEEP RESEARCH REPORT
            </span>
            <span className="text-xs text-outline flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-on-surface mt-1 tracking-tight">
            {report.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors"
            type="button"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
            <span>{copied ? "Copied MD" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors"
            type="button"
          >
            <Download className="w-3.5 h-3.5 text-outline" />
            <span>Export JSON</span>
          </button>

          {response && onSaveReport && (
            <button
              onClick={() => onSaveReport(response)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                isSaved
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30"
              }`}
              type="button"
            >
              <span>{isSaved ? "Saved" : "Save Report"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Executive Summary */}
      <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Executive Summary</span>
        </div>
        <p className="text-sm text-on-surface leading-relaxed">
          {report.executiveSummary}
        </p>
      </section>

      {/* 2. Key Findings Bullets */}
      <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Key Findings & Grounded Facts</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.keyFindings.map((finding, idx) => (
            <li
              key={idx}
              className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 text-xs sm:text-sm text-on-surface flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-snug">{finding}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Detailed Analysis Sections */}
      {report.sections.map((section) => (
        <section
          key={section.id}
          className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <h3 className="text-sm font-semibold text-on-surface">
              {section.heading}
            </h3>
            {section.citationIds.length > 0 && (
              <div className="flex items-center gap-1">
                {section.citationIds.map((cid) => (
                  <span
                    key={cid}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-primary border border-primary/20"
                    title={`Referencing ${cid}`}
                  >
                    [{cid.replace("cite-", "")}]
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs sm:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line space-y-2">
            {section.content}
          </div>
        </section>
      ))}

      {/* 4. Identified Entities & Benchmarks */}
      {report.relevantEntities.length > 0 && (
        <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Entities & Competitor Profiles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.relevantEntities.map((entity, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-on-surface">{entity.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono">
                      {entity.type}
                    </span>
                  </div>
                  <p className="text-xs text-outline mt-1.5 leading-relaxed">{entity.description}</p>
                </div>
                {entity.sourceUrl && (
                  <a
                    href={entity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <span>Official portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Statistics & Quantitative Evidence Table */}
      {report.statisticsAndEvidence.length > 0 && (
        <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Quantitative Evidence & Disclosures</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-outline-variant/20 rounded-lg overflow-hidden">
              <thead className="bg-surface-container text-on-surface font-semibold">
                <tr>
                  <th className="p-2.5">Fact / Constraint</th>
                  <th className="p-2.5">Extracted Value</th>
                  <th className="p-2.5">Verified Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                {report.statisticsAndEvidence.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/50">
                    <td className="p-2.5 font-medium text-on-surface">{ev.claim}</td>
                    <td className="p-2.5 font-mono text-primary">{ev.value}</td>
                    <td className="p-2.5">
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline max-w-[200px] truncate"
                      >
                        <span className="truncate">{ev.sourceTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. Conflicts & Missing Evidence */}
      {report.conflictsAndUncertainties.length > 0 && (
        <section className="p-5 rounded-xl bg-surface-container-low border border-amber-900/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Uncertainties & Unstated Disclosures</span>
          </div>
          <ul className="space-y-2">
            {report.conflictsAndUncertainties.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-on-surface-variant p-2.5 rounded bg-surface-container border border-outline-variant/20 flex items-start gap-2"
              >
                <span className="text-amber-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. Strategic Implications & Recommendations */}
      {report.implicationsAndConclusions.length > 0 && (
        <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Strategic Implications & Recommended Actions</span>
          </div>
          <ul className="space-y-2">
            {report.implicationsAndConclusions.map((item, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-on-surface p-3 rounded-lg bg-surface-container border-l-2 border-primary leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. Methodology & Pipeline Disclosure */}
      <section className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs text-outline space-y-1">
        <span className="font-semibold text-on-surface">Methodology:</span>
        <p className="leading-relaxed">{report.methodology}</p>
      </section>

      {/* 9. Verified Sources / Citations */}
      <section className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Primary Sources ({report.citations.length})</span>
          </div>
          {report.citations.length > 4 && (
            <button
              onClick={() => setShowAllSources(!showAllSources)}
              className="text-xs text-outline hover:text-on-surface inline-flex items-center gap-1"
              type="button"
            >
              <span>{showAllSources ? "Show fewer" : `Show all ${report.citations.length}`}</span>
              {showAllSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(showAllSources ? report.citations : report.citations.slice(0, 4)).map((cite, idx) => (
            <a
              key={cite.id}
              href={cite.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 hover:border-outline-variant/50 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono text-primary font-bold">[{idx + 1}] {cite.domain}</span>
                  <ExternalLink className="w-3 h-3 text-outline group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-xs font-medium text-on-surface mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {cite.sourceTitle}
                </h4>
                <p className="text-[11px] text-outline mt-1 line-clamp-2 leading-snug">
                  {cite.snippet}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-outline-variant/10 text-[10px] text-outline flex items-center justify-between">
                <span>Verified by TinyFish Fetch</span>
                <span>{new Date(cite.retrievedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
