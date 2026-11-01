"use client";

import React, { useState } from "react";
import type { UserProfile, FounderBriefItem, SavedInsight, UserTask } from "@/lib/client/workspaceState";
import type { ResearchHistoryItem } from "@/lib/contracts";

interface OverviewDashboardProps {
  profile: UserProfile | null;
  onOpenProfileSetup: () => void;
  onNavigateTab: (tab: "research" | "founderbrief" | "assistant" | "insights" | "tasks") => void;
  onQuickResearch: (prompt: string) => void;
  topBriefItems: FounderBriefItem[];
  onOpenBriefDetail: (item: FounderBriefItem) => void;
  savedInsights: SavedInsight[];
  tasks: UserTask[];
  onToggleTask: (id: string) => void;
  recentResearch: ResearchHistoryItem[];
  onSelectRecentResearch: (item: ResearchHistoryItem) => void;
}

const DEFAULT_SIGNALS: FounderBriefItem[] = [
  {
    id: "sig-1",
    headline: "Enterprise LLM Gateway pricing slashed by 30% across tier 1 vendors",
    summary:
      "Discounts concentrated on multi-tenant throughput commitments exceeding 50M tokens/day. Primary compression noted in European sovereign hosting options.",
    category: "pricing",
    relevanceExplanation: "Affects procurement & API infrastructure budgeting.",
    source: "CloudTelemetry Dispatch",
    publishedAt: "18m ago",
    matchedInterests: ["Pricing", "API Gateway", "Sovereign Cloud"],
  },
  {
    id: "sig-2",
    headline: "EU AI Act compliance enforcement guidelines published for EMEA data centers",
    summary:
      "Audit scopes now mandate transparent logging architecture for autonomous agents interacting with core banking and regulated user personal directories.",
    category: "compliance",
    relevanceExplanation: "Mandatory compliance for autonomous workflow pipelines in EU.",
    source: "EUR-Lex Regulatory Monitor",
    publishedAt: "1h ago",
    matchedInterests: ["Compliance", "EU AI Act", "Auditing"],
  },
  {
    id: "sig-3",
    headline: "Series B consolidation: 2 rival data pipeline tooling startups merge",
    summary:
      "Combined venture aims to capture mid-market ingestion layers to counter snowflake ecosystem bundling. Total post-merger evaluation tagged at $410M.",
    category: "m&a",
    relevanceExplanation: "Market consolidation in data ingestion tools.",
    source: "VentureCapital Index",
    publishedAt: "3h ago",
    matchedInterests: ["M&A", "Consolidation", "Pipelines"],
  },
];

export function OverviewDashboard({
  profile,
  onOpenProfileSetup,
  onNavigateTab,
  onQuickResearch,
  topBriefItems,
  onOpenBriefDetail,
  savedInsights,
  tasks,
  onToggleTask,
  recentResearch,
  onSelectRecentResearch,
}: OverviewDashboardProps) {
  const [selectedNiche, setSelectedNiche] = useState<"B2B SaaS" | "Sustainable Packaging" | "Fintech Infra">("B2B SaaS");
  const [isNicheDropdownOpen, setIsNicheDropdownOpen] = useState(false);
  const [activeDateFilter, setActiveDateFilter] = useState("30D");

  const niches: Array<"B2B SaaS" | "Sustainable Packaging" | "Fintech Infra"> = [
    "B2B SaaS",
    "Sustainable Packaging",
    "Fintech Infra",
  ];

  // Combine topBriefItems or fallback to the reference signals
  const displaySignals = topBriefItems.length >= 3 ? topBriefItems.slice(0, 3) : DEFAULT_SIGNALS;

  return (
    <div className="flex flex-col w-full pb-space-xl animate-in fade-in duration-200">
      {/* Top Control Bar / Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-md mb-space-md border-b border-outline-variant/20">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
            </span>
            <span className="font-label-sm text-[11px] font-mono uppercase tracking-widest text-outline">
              Realtime Feed • Live Telemetry
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-semibold">
            Market Intelligence Overview
          </h1>
        </div>

        {/* Dropdowns & Filter Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Niche Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNicheDropdownOpen(!isNicheDropdownOpen)}
              className="h-9 px-space-md bg-surface-container-low hover:bg-surface-container-high transition-colors rounded flex items-center gap-space-sm text-on-surface font-body-md text-xs sm:text-sm select-none border border-outline-variant/30 cursor-pointer"
              id="niche-selector-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-primary-container">category</span>
              <span className="font-medium text-on-surface">{selectedNiche}</span>
              <span className="material-symbols-outlined text-[16px] text-outline transition-transform duration-200">
                {isNicheDropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {isNicheDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-surface-container-highest border border-outline-variant/40 rounded-lg shadow-2xl py-1 z-30 animate-in fade-in duration-100">
                {niches.map((niche) => (
                  <button
                    key={niche}
                    onClick={() => {
                      setSelectedNiche(niche);
                      setIsNicheDropdownOpen(false);
                    }}
                    className="w-full text-left px-space-md py-2 text-on-surface hover:bg-surface-container flex items-center justify-between font-body-sm text-xs transition-colors cursor-pointer"
                    type="button"
                  >
                    <span>{niche}</span>
                    {selectedNiche === niche && (
                      <span className="material-symbols-outlined text-[14px] text-primary-container">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Selector */}
          <button
            onClick={() => setActiveDateFilter(activeDateFilter === "30D" ? "90D" : "30D")}
            className="h-9 px-3 bg-surface-container-low border border-outline-variant/30 hover:border-on-surface rounded flex items-center gap-2 text-on-surface font-body-md text-xs transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
            <span className="font-mono text-on-surface">Oct 1 – Oct 31, 2024</span>
            <span className="font-label-sm text-[10px] text-outline bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30 font-mono">
              30D
            </span>
          </button>

          {/* Filter settings icon button */}
          <button
            onClick={onOpenProfileSetup}
            className="h-9 w-9 bg-surface-container-low border border-outline-variant/30 hover:border-on-surface rounded flex items-center justify-center text-on-surface transition-colors cursor-pointer"
            title="Filter settings"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>

          {/* Primary CTA: Export Spec */}
          <button
            onClick={() => onNavigateTab("research")}
            className="h-9 px-4 bg-primary-container hover:bg-[#ff771a] transition-colors rounded text-white font-body-md text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Spec</span>
          </button>
        </div>
      </section>

      {/* SECTION A: High-Level KPI Cards (4 Items) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
        {/* KPI 1 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-mono uppercase tracking-wider text-outline">
                SIGNAL VOLUME
              </span>
              <span className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                Active Market Signals
              </span>
            </div>
            <span className="font-label-sm text-[11px] font-mono text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high">
              +18.4%
            </span>
          </div>
          <div className="mt-space-md flex items-end justify-between">
            <div>
              <div className="font-headline-lg text-2xl font-semibold text-on-surface tracking-tight leading-none font-mono">
                1,428
              </div>
              <div className="font-label-sm text-[11px] text-outline mt-1 font-mono">vs 1,206 prev month</div>
            </div>
            {/* Sparkline SVG 1 */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="sparkGrad1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6600" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ff6600" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0 32 Q 20 28, 40 18 T 70 12 T 100 4 L 100 40 L 0 40 Z" fill="url(#sparkGrad1)"></path>
                <path
                  d="M 0 32 Q 20 28, 40 18 T 70 12 T 100 4"
                  fill="none"
                  stroke="#ff6600"
                  strokeLinecap="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-mono uppercase tracking-wider text-outline">
                VELOCITY TRACKER
              </span>
              <span className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                Competitor Launches
              </span>
            </div>
            <span className="font-label-sm text-[11px] font-mono text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high">
              +6 this wk
            </span>
          </div>
          <div className="mt-space-md flex items-end justify-between">
            <div>
              <div className="font-headline-lg text-2xl font-semibold text-on-surface tracking-tight leading-none font-mono">
                34
              </div>
              <div className="font-label-sm text-[11px] text-outline mt-1 font-mono">22 tier-1 features</div>
            </div>
            {/* Sparkline SVG 2 */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="sparkGrad2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6600" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ff6600" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0 30 L 25 35 L 45 15 L 70 24 L 100 6 L 100 40 L 0 40 Z" fill="url(#sparkGrad2)"></path>
                <path
                  d="M 0 30 L 25 35 L 45 15 L 70 24 L 100 6"
                  fill="none"
                  stroke="#ff6600"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-mono uppercase tracking-wider text-outline">
                MARKET SENTIMENT
              </span>
              <span className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                Niche Sentiment Score
              </span>
            </div>
            <span className="font-label-sm text-[11px] font-mono text-primary-container px-1.5 py-0.5 rounded bg-surface-container-high">
              +4.2 pts Bullish
            </span>
          </div>
          <div className="mt-space-md flex items-end justify-between">
            <div>
              <div className="font-headline-lg text-2xl font-semibold text-on-surface tracking-tight leading-none font-mono">
                88.6<span className="text-sm text-outline font-normal">/100</span>
              </div>
              <div className="font-label-sm text-[11px] text-outline mt-1 font-mono">Consensus: Overweight</div>
            </div>
            {/* Sparkline SVG 3 */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="sparkGrad3" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6600" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ff6600" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0 25 C 20 22, 40 28, 60 14 C 80 8, 90 6, 100 4 L 100 40 L 0 40 Z" fill="url(#sparkGrad3)"></path>
                <path
                  d="M 0 25 C 20 22, 40 28, 60 14 C 80 8, 90 6, 100 4"
                  fill="none"
                  stroke="#ff6600"
                  strokeLinecap="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-mono uppercase tracking-wider text-outline">
                PRIORITY INDEX
              </span>
              <span className="font-body-md text-xs sm:text-sm text-on-surface-variant font-medium mt-0.5">
                Pricing &amp; Reg Alerts
              </span>
            </div>
            <span className="font-label-sm text-[10px] font-mono text-white bg-primary-container px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              3 URGENT
            </span>
          </div>
          <div className="mt-space-md flex items-end justify-between">
            <div>
              <div className="font-headline-lg text-2xl font-semibold text-on-surface tracking-tight leading-none font-mono">
                12
              </div>
              <div className="font-label-sm text-[11px] text-outline mt-1 font-mono">9 Monitored / 3 Critical</div>
            </div>
            {/* Sparkline SVG 4 */}
            <div className="w-24 h-10">
              <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="sparkGrad4" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ff6600" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#ff6600" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0 34 L 30 20 L 50 30 L 75 10 L 100 8 L 100 40 L 0 40 Z" fill="url(#sparkGrad4)"></path>
                <path
                  d="M 0 34 L 30 20 L 50 30 L 75 10 L 100 8"
                  fill="none"
                  stroke="#ff6600"
                  strokeLinecap="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: Market & Competitor Graphs (2 Columns) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
        {/* Left Chart: Market Demand vs. Time */}
        <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-xs border-b border-outline-variant/20">
            <div>
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-sm text-base sm:text-lg text-on-surface font-semibold">
                  Market Demand vs. Time
                </h2>
                <span className="material-symbols-outlined text-[16px] text-outline" title="Verified aggregated signals">
                  info
                </span>
              </div>
              <p className="font-body-sm text-xs text-outline mt-0.5">Aggregate search volume &amp; buyer intent index</p>
            </div>
            <div className="flex items-center gap-space-xs">
              <button className="px-2.5 py-1 rounded bg-surface-container-high text-primary-container font-label-sm text-[11px] font-mono font-medium">
                W1-W4
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors font-label-sm text-[11px] font-mono">
                90D
              </button>
              <button className="px-2.5 py-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors font-label-sm text-[11px] font-mono">
                1Y
              </button>
            </div>
          </div>

          {/* Main Line Chart SVG Container */}
          <div className="relative w-full h-56 sm:h-64 mt-space-md select-none">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 240">
              <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff6600" stopOpacity="0.25"></stop>
                  <stop offset="50%" stopColor="#ff6600" stopOpacity="0.08"></stop>
                  <stop offset="100%" stopColor="#ff6600" stopOpacity="0"></stop>
                </linearGradient>
                <pattern id="gridPattern" width="150" height="48" patternUnits="userSpaceOnUse">
                  <path d="M 0 48 L 600 48 M 150 0 L 150 240" fill="none" stroke="#2a2a2a" strokeDasharray="2 4" strokeWidth="1"></path>
                </pattern>
              </defs>
              {/* Background Matrix Grid */}
              <rect fill="url(#gridPattern)" height="240" opacity="0.6" width="600"></rect>
              {/* Area Fill */}
              <path
                d="M 0 190 
                   C 60 185, 100 150, 150 145 
                   C 200 140, 240 170, 300 120 
                   C 360 70, 420 85, 450 60 
                   C 480 35, 540 45, 600 25 
                   L 600 240 L 0 240 Z"
                fill="url(#areaGradient)"
              ></path>
              {/* Smooth Primary Line */}
              <path
                d="M 0 190 
                   C 60 185, 100 150, 150 145 
                   C 200 140, 240 170, 300 120 
                   C 360 70, 420 85, 450 60 
                   C 480 35, 540 45, 600 25"
                fill="none"
                stroke="#ff6600"
                strokeLinecap="round"
                strokeWidth="2.5"
              ></path>
              {/* Key Data Nodes */}
              <circle cx="150" cy="145" fill="#ff6600" r="4" stroke="#131313" strokeWidth="2"></circle>
              <circle cx="300" cy="120" fill="#ff6600" r="4" stroke="#131313" strokeWidth="2"></circle>
              <circle cx="450" cy="60" fill="#ff6600" r="4" stroke="#131313" strokeWidth="2"></circle>
              <circle cx="600" cy="25" fill="#ffffff" r="5" stroke="#ff6600" strokeWidth="2.5"></circle>
              {/* Active Marker Crosshair on Week 4 Peak */}
              <line stroke="#ff6600" strokeDasharray="3 3" strokeOpacity="0.4" x1="450" x2="450" y1="0" y2="240"></line>
            </svg>
            {/* Tooltip Overlay */}
            <div className="absolute left-[70%] top-6 -translate-x-1/2 bg-surface-container-highest border border-outline-variant/40 px-space-sm py-1.5 rounded shadow-xl pointer-events-none flex flex-col gap-0.5">
              <span className="font-label-sm text-[10px] font-mono text-outline">WEEK 3 SIGNAL</span>
              <span className="font-mono text-xs font-bold text-on-surface">
                Index: 94.2 <span className="text-primary-container font-normal">(+14%)</span>
              </span>
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between items-center pt-space-md text-outline font-label-sm text-[11px] font-mono border-t border-outline-variant/20 mt-2">
            <span>OCT 01 (W1)</span>
            <span>OCT 08 (W2)</span>
            <span>OCT 15 (W3)</span>
            <span>OCT 22 (W4)</span>
            <span className="text-on-surface font-medium">OCT 31 (NOW)</span>
          </div>
        </div>

        {/* Right Chart: Competitor Signal Volume & Share */}
        <div className="lg:col-span-5 bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
          <div className="pb-space-md border-b border-outline-variant/20">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-base sm:text-lg text-on-surface font-semibold">
                Competitor Signal Volume
              </h2>
              <span className="font-label-sm text-[10px] font-mono text-outline px-1.5 py-0.5 rounded bg-surface-container-high">
                TOP 3 RANKED
              </span>
            </div>
            <p className="font-body-sm text-xs text-outline mt-0.5">Volume comparison among top tracked rivals</p>
          </div>

          {/* Bar Graph Module matching reference */}
          <div className="flex flex-col justify-around py-space-sm gap-space-lg flex-1 my-2">
            {/* Competitor 1 (Lead - Acme Corp) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-body-sm text-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  <span className="font-semibold text-on-surface">Acme Corp</span>
                  <span className="font-label-sm text-[10px] text-primary-container px-1 rounded bg-primary-container/10 border border-primary-container/20 font-mono">
                    LEAD
                  </span>
                </div>
                <div className="flex items-center gap-space-xs font-mono">
                  <span className="font-semibold text-on-surface">420</span>
                  <span className="text-outline text-[11px]">signals (43%)</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
              </div>
            </div>

            {/* Competitor 2 (Veloce AI) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-body-sm text-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-outline"></span>
                  <span className="font-medium text-on-surface">Veloce AI</span>
                </div>
                <div className="flex items-center gap-space-xs font-mono">
                  <span className="text-on-surface">310</span>
                  <span className="text-outline text-[11px]">signals (32%)</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-on-surface rounded-full transition-all duration-500" style={{ width: "63%" }}></div>
              </div>
            </div>

            {/* Competitor 3 (Strata Cloud) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-body-sm text-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-surface-bright"></span>
                  <span className="font-medium text-on-surface">Strata Cloud</span>
                </div>
                <div className="flex items-center gap-space-xs font-mono">
                  <span className="text-on-surface">245</span>
                  <span className="text-outline text-[11px]">signals (25%)</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-surface-bright rounded-full transition-all duration-500" style={{ width: "50%" }}></div>
              </div>
            </div>
          </div>

          {/* Quick Distribution Summary Footnote */}
          <div className="pt-space-md flex items-center justify-between text-outline font-label-sm text-[11px] font-mono border-t border-outline-variant/20">
            <span>Aggregate Baseline: 975 events</span>
            <button
              onClick={() => onQuickResearch("Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)")}
              className="text-primary-container hover:underline cursor-pointer flex items-center gap-1 font-mono font-medium"
            >
              <span>Deep Breakdown →</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION C & D: Live Niche Updates & Competitor Watchlist */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Left: Live Niche Signals Feed */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-primary-container">rss_feed</span>
              <h3 className="font-headline-sm text-base text-on-surface font-semibold">Live Niche Signals</h3>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-sm text-[11px] text-outline font-mono">STREAMING</span>
            </div>
          </div>

          {/* Feed Container */}
          <div className="flex flex-col gap-space-sm flex-1 my-3">
            {displaySignals.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenBriefDetail(item)}
                className="group p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-all flex flex-col gap-space-xs cursor-pointer relative overflow-hidden border border-outline-variant/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-sm text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-container-highest text-primary-container">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="font-label-sm text-[11px] text-outline font-mono">• {item.publishedAt}</span>
                  </div>
                  <span className="font-label-sm text-xs text-outline group-hover:text-primary-container transition-colors flex items-center gap-1 font-mono">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Brief me</span>
                    <span className="material-symbols-outlined text-[16px] transform group-hover:translate-x-0.5 transition-transform text-primary-container">
                      arrow_forward
                    </span>
                  </span>
                </div>
                <h4 className="font-body-md text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                  {item.headline}
                </h4>
                <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Feed Action Footer */}
          <div className="pt-space-md flex items-center justify-between border-t border-outline-variant/20">
            <span className="font-label-sm text-[11px] text-outline font-mono">
              Showing 3 of 48 today
            </span>
            <button
              onClick={() => onNavigateTab("founderbrief")}
              className="font-body-sm text-xs text-primary-container hover:underline font-medium transition-colors cursor-pointer"
            >
              View full signal timeline →
            </button>
          </div>
        </div>

        {/* Right: Competitor Watchlist */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-space-md border-b border-outline-variant/20">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary-container">visibility</span>
                <h3 className="font-headline-sm text-base text-on-surface font-semibold">Competitor Watchlist</h3>
              </div>
              <button
                onClick={() => onNavigateTab("research")}
                className="h-8 px-space-sm bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded text-on-surface font-body-sm text-xs flex items-center gap-1 cursor-pointer border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add Entity</span>
              </button>
            </div>

            {/* Competitor List Elements matching reference */}
            <div className="flex flex-col gap-space-sm mt-3">
              {/* Competitor Item 1 */}
              <div
                onClick={() => onQuickResearch("Acme Corp GPU compute node pricing, infrastructure announcements, and enterprise tier terms")}
                className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold font-mono text-on-surface text-xs">
                      AC
                    </div>
                    <div>
                      <h4 className="font-body-md text-xs sm:text-sm font-semibold text-on-surface leading-tight group-hover:text-primary-container transition-colors">
                        Acme Corp
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
                        <span className="font-label-sm text-[10px] text-primary-container font-mono uppercase">
                          Active monitoring
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[11px] text-outline font-mono">2h ago</span>
                </div>
                <div className="mt-1 pl-10">
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    Updated pricing tiers • introduced pay-as-you-go GPU compute nodes to counter serverless providers.
                  </p>
                  <div className="mt-2 flex items-center gap-space-sm">
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      Infra Layer
                    </span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      H100 Clusters
                    </span>
                  </div>
                </div>
              </div>

              {/* Competitor Item 2 */}
              <div
                onClick={() => onQuickResearch("Veloce AI automated workflow orchestration beta features, Jira GitHub bindings, and waitlist")}
                className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold font-mono text-on-surface text-xs">
                      VA
                    </div>
                    <div>
                      <h4 className="font-body-md text-xs sm:text-sm font-semibold text-on-surface leading-tight group-hover:text-primary-container transition-colors">
                        Veloce AI
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span className="font-label-sm text-[10px] text-primary-container font-mono uppercase">
                          Active monitoring
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[11px] text-outline font-mono">5h ago</span>
                </div>
                <div className="mt-1 pl-10">
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    Launched automated workflow orchestration beta to enterprise waitlist, including direct Jira/GitHub bindings.
                  </p>
                  <div className="mt-2 flex items-center gap-space-sm">
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      Workflow Automation
                    </span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      Closed Beta
                    </span>
                  </div>
                </div>
              </div>

              {/* Competitor Item 3 */}
              <div
                onClick={() => onQuickResearch("Strata Cloud SOC2 Type II audit, Tokyo regional availability zone, and APAC expansion")}
                className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold font-mono text-outline text-xs">
                      SC
                    </div>
                    <div>
                      <h4 className="font-body-md text-xs sm:text-sm font-semibold text-on-surface leading-tight group-hover:text-primary-container transition-colors">
                        Strata Cloud
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                        <span className="font-label-sm text-[10px] text-outline font-mono uppercase">
                          Quiet
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[11px] text-outline font-mono">1d ago</span>
                </div>
                <div className="mt-1 pl-10">
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    Updated SOC2 Type II audit report &amp; added Tokyo regional availability zone for latency-critical nodes.
                  </p>
                  <div className="mt-2 flex items-center gap-space-sm">
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      Compliance
                    </span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-mono">
                      APAC Expansion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Watchlist Summary Footer */}
          <div className="pt-space-md flex items-center justify-between border-t border-outline-variant/20 mt-3">
            <span className="font-label-sm text-[11px] text-outline font-mono">Auto-sync interval: 60s</span>
            <button
              onClick={() => onNavigateTab("research")}
              className="font-body-sm text-xs text-outline hover:text-on-surface transition-colors flex items-center gap-1 font-mono cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Manual Sync</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
