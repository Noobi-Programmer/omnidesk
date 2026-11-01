"use client";

import React from "react";
import {
  Compass,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Table,
  Mail,
  ExternalLink,
  Layers,
  Search,
  Sliders,
  ChevronRight,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
  onExploreWorkspace: () => void;
}

export function LandingPage({
  onGetStarted,
  onLogIn,
  onExploreWorkspace,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#111316] text-[#e2e2e6] selection:bg-[#5e6ad2] selection:text-white flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#111316]/90 backdrop-blur-md z-40 border-b border-[#26292e]/80 flex items-center justify-between px-6 lg:px-12">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-white tracking-tight">
              OmniDesk
            </span>
            <span className="font-mono text-[10px] text-[#908f9e] px-1.5 py-0.5 bg-[#1e2023] rounded border border-[#26292e]">
              v2.4
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-8 text-xs text-[#908f9e]">
            <a href="#capabilities" className="hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogIn}
            className="px-3.5 py-1.5 text-xs text-[#c6c5d5] hover:text-white transition-colors cursor-pointer font-medium"
            type="button"
          >
            Log in
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-1.5 bg-[#5e6ad2] hover:bg-[#6c78de] text-white rounded text-xs font-medium transition shadow-sm cursor-pointer flex items-center gap-1.5"
            type="button"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left: Value Proposition */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181a1d] border border-[#26292e] text-xs font-mono text-[#908f9e] w-fit">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Personalized Research &amp; Intelligence Workspace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold text-white tracking-tight leading-[1.12]">
              Your research. <br />
              Your intelligence. <br />
              <span className="text-[#bdc2ff]">One workspace.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#908f9e] leading-relaxed max-w-xl">
              Stay on top of important updates, research the web, and turn what you learn into
              meaningful next steps — with an AI workspace that understands what matters to you.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 bg-[#5e6ad2] hover:bg-[#6c78de] text-white rounded font-medium text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreWorkspace}
                className="px-5 py-3 bg-[#181a1d] hover:bg-[#1e2023] text-white rounded border border-[#26292e] font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span>Explore the workspace</span>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-mono text-[#908f9e] border-t border-[#26292e]/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Verbatim quote evidence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span>Human-authorized actions</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Polished Interactive Workspace Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-[#181a1d] rounded-lg border border-[#26292e] shadow-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#26292e]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#37393c]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#37393c]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#37393c]" />
                  <span className="ml-2 font-mono text-[11px] text-[#908f9e]">
                    Workspace / Intelligence
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e2023] text-[#10b981] font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    LIVE ENGINE
                  </span>
                </div>
              </div>

              {/* Mockup Query Composer Box */}
              <div className="bg-[#1e2023] rounded p-3 flex flex-col gap-2 border border-[#26292e]/60">
                <div className="flex items-center justify-between text-xs text-[#908f9e]">
                  <span className="font-medium text-white">What would you like to get done?</span>
                  <span className="font-mono text-[10px]">Target: EU/EMEA • BPA-NI</span>
                </div>
                <div className="text-xs text-[#e2e2e6] font-mono bg-[#111316] p-2 rounded border border-[#26292e]/40">
                  Compare EU cold brew aluminum can suppliers (250ml slim, MOQ &lt; 50k, recyclable liners)
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-[#282a2d] text-white font-medium">Deep (Active)</span>
                    <span className="px-2 py-0.5 text-[#908f9e]">Standard</span>
                  </div>
                  <span className="text-[#5e6ad2] font-medium flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Executing TinyFish Web Agent...
                  </span>
                </div>
              </div>

              {/* Mockup FounderBrief Card Preview */}
              <div className="bg-[#1e2023] rounded p-3 flex flex-col gap-2 border border-[#26292e]/60">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#908f9e]">
                  <span className="px-1.5 py-0.5 bg-[#282a2d] text-[#bdc2ff] rounded font-medium">
                    Regulations
                  </span>
                  <span>2h ago • EU Food Safety Authority</span>
                </div>
                <h4 className="text-xs font-semibold text-white">
                  European Commission Approves Standardized BPA-NI Food Liner Directives
                </h4>
                <p className="text-[11px] text-[#908f9e] line-clamp-2">
                  Mandatory migration limits accelerate beverage canning line conversions across Germany and Netherlands.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-[#26292e]/40 text-[10px]">
                  <span className="text-[#908f9e] italic">
                    Affects your 250ml slim packaging supplier compliance &amp; MOQ.
                  </span>
                  <button
                    onClick={onExploreWorkspace}
                    className="text-[#bdc2ff] hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    Brief me &rarr;
                  </button>
                </div>
              </div>

              {/* Mockup Comparison Matrix Snippet */}
              <div className="bg-[#1e2023] rounded p-2.5 flex flex-col gap-1.5 border border-[#26292e]/60 text-[11px] font-mono">
                <div className="flex items-center justify-between text-[#908f9e] text-[10px] pb-1 border-b border-[#26292e]/40">
                  <span>Candidate Supplier</span>
                  <span>MOQ</span>
                  <span>Status</span>
                </div>
                <div className="flex items-center justify-between text-[#e2e2e6]">
                  <span className="font-medium text-white">Envases Group (NL)</span>
                  <span>25,000 units</span>
                  <span className="text-[#10b981] font-semibold">● Verified</span>
                </div>
                <div className="flex items-center justify-between text-[#e2e2e6]">
                  <span className="font-medium text-white">Ardagh Metal (DE)</span>
                  <span>20,000 units</span>
                  <span className="text-[#10b981] font-semibold">● Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Overview (Section C) */}
      <section id="capabilities" className="py-20 px-6 lg:px-12 bg-[#181a1d] border-t border-[#26292e]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-2 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Three Connected AI Capabilities
            </h2>
            <p className="text-sm text-[#908f9e]">
              OmniDesk unites real-time market intelligence, conversational investigation, and deep web extraction in one cohesive workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: FounderBrief */}
            <div className="bg-[#111316] rounded-lg border border-[#26292e] p-6 flex flex-col justify-between gap-4 hover:border-[#5e6ad2]/50 transition">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded bg-[#1e2023] text-[#ffb95f] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">FounderBrief</h3>
                <p className="text-xs text-[#908f9e] leading-relaxed">
                  Personalized intelligence feed showing relevant news, startup updates, funding rounds, competitor launches, AI tools, and market trends tailored to your role.
                </p>
              </div>
              <div className="pt-3 border-t border-[#26292e] flex items-center text-xs text-[#bdc2ff] font-medium">
                <span>Instant “Brief me” deep dives &rarr;</span>
              </div>
            </div>

            {/* Card 2: OmniDesk AI PA */}
            <div className="bg-[#111316] rounded-lg border border-[#26292e] p-6 flex flex-col justify-between gap-4 hover:border-[#5e6ad2]/50 transition">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded bg-[#1e2023] text-[#bdc2ff] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">OmniDesk AI PA</h3>
                <p className="text-xs text-[#908f9e] leading-relaxed">
                  Conversational assistant that helps investigate questions, prepare reports, save findings, and create follow-up tasks. Consequential actions always ask for your explicit approval.
                </p>
              </div>
              <div className="pt-3 border-t border-[#26292e] flex items-center text-xs text-[#bdc2ff] font-medium">
                <span>Human authorization gate &rarr;</span>
              </div>
            </div>

            {/* Card 3: Web Agent */}
            <div className="bg-[#111316] rounded-lg border border-[#26292e] p-6 flex flex-col justify-between gap-4 hover:border-[#5e6ad2]/50 transition">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded bg-[#1e2023] text-[#10b981] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Web Agent</h3>
                <p className="text-xs text-[#908f9e] leading-relaxed">
                  Deep web research across live sites. Verifies facts with exact verbatim citations, builds constraint-aware candidate matrices, and drafts inquiries without hallucinated data.
                </p>
              </div>
              <div className="pt-3 border-t border-[#26292e] flex items-center text-xs text-[#bdc2ff] font-medium">
                <span>Evidence-backed decisions &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Workflow Explanation: Signal -> Brief -> Action (Section D) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              The Product Loop
            </h2>
            <p className="text-sm text-[#908f9e]">
              A continuous, low-friction loop connecting discovery to verified execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#181a1d] rounded-lg border border-[#26292e] p-6 flex flex-col gap-3">
              <span className="font-mono text-xs text-[#5e6ad2] font-semibold uppercase tracking-wider">
                01. Signal
              </span>
              <h4 className="text-base font-medium text-white">Detect Ecosystem Shifts</h4>
              <p className="text-xs text-[#908f9e] leading-relaxed">
                Discover a competitor launch, packaging regulation change, or benchmark release right in your curated FounderBrief feed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#181a1d] rounded-lg border border-[#26292e] p-6 flex flex-col gap-3">
              <span className="font-mono text-xs text-[#5e6ad2] font-semibold uppercase tracking-wider">
                02. Brief
              </span>
              <h4 className="text-base font-medium text-white">Understand Implications</h4>
              <p className="text-xs text-[#908f9e] leading-relaxed">
                Open “Brief me” to immediately review What Happened, Why It Matters To You, and strategic recommendations with primary sources.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#181a1d] rounded-lg border border-[#26292e] p-6 flex flex-col gap-3">
              <span className="font-mono text-xs text-[#5e6ad2] font-semibold uppercase tracking-wider">
                03. Action
              </span>
              <h4 className="text-base font-medium text-white">Execute With Safety</h4>
              <p className="text-xs text-[#908f9e] leading-relaxed">
                Save key conclusions, assign follow-up audit tasks, or generate commercial supplier inquiry drafts with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA (Section E) */}
      <section className="py-20 px-6 lg:px-12 bg-[#181a1d] border-t border-[#26292e]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Know what's happening. Research anything. Get things done.
          </h2>
          <p className="text-sm text-[#908f9e] max-w-xl">
            Step into OmniDesk's personal AI research workspace. No complicated setup, no fake data, no ungrounded claims.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 bg-[#5e6ad2] hover:bg-[#6c78de] text-white rounded font-medium text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span>Get started with OmniDesk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreWorkspace}
              className="px-5 py-3 bg-[#111316] hover:bg-[#1e2023] text-white rounded border border-[#26292e] font-medium text-sm transition cursor-pointer"
              type="button"
            >
              <span>Explore Demo Workspace</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#26292e] bg-[#111316] text-xs text-[#908f9e] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">OmniDesk</span>
          <span>•</span>
          <span>Executive Intelligence &amp; Supplier Workspace</span>
        </div>
        <div className="font-mono text-[11px]">
          Built with TinyFish Web Intelligence • Team Thambiis
        </div>
      </footer>
    </div>
  );
}
