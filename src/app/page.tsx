"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Sliders,
  Send,
  Mail,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import type {
  ResearchResponse,
  ProgressEventPayload,
  ResearchPlan,
  SourceDocument,
  ComparisonItem,
  EvidenceField,
  ResearchStage,
  ResearchMode,
  ResearchHistoryItem,
} from "@/lib/contracts";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ResearchComposer } from "@/components/ResearchComposer";
import { ResearchProgress } from "@/components/ResearchProgress";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { SourcesSection } from "@/components/SourcesSection";
import { ActionDrawer } from "@/components/ActionDrawer";
import { EvidenceModal } from "@/components/EvidenceModal";
import { HistoryModal } from "@/components/HistoryModal";
import { RoadmapModal } from "@/components/RoadmapModal";
import {
  getStoredHistory,
  saveToHistory,
  deleteFromHistory,
  clearAllHistory,
} from "@/lib/client/history";

const INITIAL_PROMPT =
  "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)";

export default function WorkspacePage() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [mode, setMode] = useState<ResearchMode>("deep");
  const [currentTab, setCurrentTab] = useState<"research" | "inbox" | "tasks" | "history">("research");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<ResearchStage | "idle">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [agentLiveUrl, setAgentLiveUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResponse | null>(null);

  // History state
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Contextual Drawer & Modal States
  const [selectedSupplierForDraft, setSelectedSupplierForDraft] = useState<ComparisonItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    title: string;
    fieldLabel: string;
    evidence: EvidenceField<string> | null;
    supplierName?: string;
  }>({
    isOpen: false,
    title: "",
    fieldLabel: "",
    evidence: null,
  });

  const [roadmapFeature, setRoadmapFeature] = useState<"Inbox" | "Tasks" | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load history on mount
  useEffect(() => {
    const loaded = getStoredHistory();
    setHistory(loaded);
    // If history exists, load the latest run into view
    if (loaded.length > 0 && !result) {
      const latest = loaded[0];
      setResult(latest.response);
      setPlan(latest.response.plan);
      setSources(latest.response.sources);
      setPrompt(latest.response.request.prompt);
      setMode(latest.response.request.mode);
      setCurrentStage("done");
      setProgressPercent(100);
      setProgressMsg("Loaded from local session");
    }
  }, []);

  const handleStartResearch = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentStage("planning");
    setProgressPercent(8);
    setProgressMsg("Formulating research plan and parsing constraints...");
    setPlan(null);
    setSources([]);
    setAgentLiveUrl(null);
    setResult(null);
    setSelectedSupplierForDraft(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`API returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const lines = evt.split("\n");
          let eventName = "";
          let dataText = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataText = line.substring(6).trim();
            }
          }

          if (eventName && dataText) {
            try {
              const data = JSON.parse(dataText);
              if (eventName === "progress") {
                const p = data as ProgressEventPayload;
                setCurrentStage(p.stage);
                setProgressPercent(p.progress);
                setProgressMsg(p.message);
              } else if (eventName === "plan") {
                setPlan(data as ResearchPlan);
              } else if (eventName === "source") {
                setSources((prev) => {
                  const filtered = prev.filter((s) => s.id !== data.id);
                  return [...filtered, data as SourceDocument];
                });
              } else if (eventName === "agent_live") {
                setAgentLiveUrl(data.agentLiveUrl);
              } else if (eventName === "result") {
                if (data.data) {
                  const res = data.data as ResearchResponse;
                  setResult(res);
                  // Save to bounded local history
                  const updatedHistory = saveToHistory(res);
                  setHistory(updatedHistory);
                }
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setProgressMsg(`Research paused: ${(err as Error).message}`);
      }
    } finally {
      setIsRunning(false);
      setCurrentStage("done");
      setProgressPercent(100);
    }
  };

  const handleSelectHistoryItem = (item: ResearchHistoryItem) => {
    setResult(item.response);
    setPlan(item.response.plan);
    setSources(item.response.sources);
    setPrompt(item.response.request.prompt);
    setMode(item.response.request.mode);
    setCurrentStage("done");
    setProgressPercent(100);
    setProgressMsg("Restored from history");
    setCurrentTab("research");
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteFromHistory(id);
    setHistory(updated);
    if (result?.taskId === id) {
      setResult(null);
      setPlan(null);
      setSources([]);
      setCurrentStage("idle");
    }
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
    setResult(null);
    setPlan(null);
    setSources([]);
    setCurrentStage("idle");
    setIsHistoryModalOpen(false);
  };

  const handleTabChange = (tab: "research" | "inbox" | "tasks" | "history") => {
    if (tab === "inbox") {
      setRoadmapFeature("Inbox");
    } else if (tab === "tasks") {
      setRoadmapFeature("Tasks");
    } else if (tab === "history") {
      setIsHistoryModalOpen(true);
    } else {
      setCurrentTab("research");
    }
  };

  const handleNewResearch = () => {
    setResult(null);
    setPlan(null);
    setSources([]);
    setCurrentStage("idle");
    setProgressPercent(0);
    setProgressMsg("");
    setCurrentTab("research");
    if (composerTextareaRef.current) {
      composerTextareaRef.current.focus();
    }
  };

  const handleOpenDraftForSupplier = (supplier: ComparisonItem) => {
    setSelectedSupplierForDraft(supplier);
    setIsDrawerOpen(true);
  };

  const handleOpenTopEnquiry = () => {
    if (result && result.comparison.length > 0) {
      const topChoice = result.comparison.find(
        (c) => c.id === result.recommendations[0]?.itemId
      ) || result.comparison[0];
      handleOpenDraftForSupplier(topChoice);
    }
  };

  const handleInspectEvidence = (
    fieldLabel: string,
    evidence: EvidenceField<string>,
    supplierName: string
  ) => {
    setEvidenceModalData({
      isOpen: true,
      title: `${supplierName} — ${fieldLabel}`,
      fieldLabel,
      evidence,
      supplierName,
    });
  };

  const handleRefineCriteria = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (composerTextareaRef.current) {
      composerTextareaRef.current.focus();
    }
  };

  // Derive dynamic results title and subtitle
  const resultTitle = result?.plan.category
    ? `Results: ${result.plan.category} (${result.plan.geography || "Sourcing"})`
    : prompt.toLowerCase().includes("can") || prompt.toLowerCase().includes("cold brew")
    ? "Results: Cold Brew Can Suppliers EU"
    : prompt.toLowerCase().includes("bengaluru")
    ? "Results: Corrugated Packaging Suppliers Bengaluru"
    : "Results: Qualified Candidate Suppliers";

  const resultSubtitle =
    result?.plan.hardConstraints && result.plan.hardConstraints.length > 0
      ? `Filtering on ${result.plan.hardConstraints.join(", ")}.`
      : "Filtering on format specifications, batch tolerances, and material certifications.";

  const isLiveEngine = Boolean(process.env.NEXT_PUBLIC_APP_NAME) || !result?.mock;

  return (
    <div className="bg-surface min-h-screen font-body-sm text-body-sm text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onNewResearch={handleNewResearch}
        history={history}
        activeTaskId={result?.taskId || null}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-60 flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          isLiveEngine={isLiveEngine}
        />

        {/* Workspace Canvas */}
        <main className="relative pt-14 min-h-screen bg-surface w-full px-4 sm:px-6 lg:px-margin-desktop py-space-xl">
          <div className="flex flex-col w-full">
            <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-space-lg pb-space-xl">
              {/* Research Composer */}
              <ResearchComposer
                prompt={prompt}
                setPrompt={setPrompt}
                mode={mode}
                setMode={setMode}
                onSubmit={handleStartResearch}
                isRunning={isRunning}
                textareaRef={composerTextareaRef}
              />

              {/* Real-time Progress Bar & Telemetry */}
              <ResearchProgress
                currentStage={currentStage}
                progressPercent={progressPercent}
                progressMsg={progressMsg}
                plan={plan}
                sources={sources}
                agentLiveUrl={agentLiveUrl}
                isRunning={isRunning}
              />

              {/* Execution Status Line (Measured metrics) */}
              {result && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-space-xs font-mono-sm text-mono-sm text-outline gap-2 border-b border-outline-variant/20 pb-2">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-on-surface-variant font-medium">
                      Completed in {(result.stats.durationMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span>
                      {result.sources.length} supplier catalogs &amp; registries scanned
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span>
                      {result.stats.searches} search queries
                    </span>
                  </div>

                  <div className="flex items-center gap-space-sm self-end sm:self-auto">
                    <span className="text-outline">
                      Scope: {result.plan.category || "Supplier Sourcing"}
                    </span>
                    <span className="px-space-xs py-[1px] bg-surface-container rounded border border-outline-variant/30 text-outline-variant font-mono">
                      ID: {result.taskId}
                    </span>
                  </div>
                </div>
              )}

              {/* Results View */}
              {result && (
                <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                        {resultTitle}
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        {resultSubtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-space-sm">
                      <button
                        onClick={handleRefineCriteria}
                        className="px-space-sm py-[6px] bg-surface-container-low hover:bg-surface-container rounded border border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-space-xs"
                        type="button"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Refine Criteria</span>
                      </button>

                      <button
                        onClick={handleOpenTopEnquiry}
                        className="px-space-md py-[6px] bg-primary-container hover:bg-[#6c78de] text-on-primary-container rounded font-label-sm text-label-sm flex items-center gap-space-xs transition-colors shadow-sm cursor-pointer"
                        type="button"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Prepare enquiry</span>
                      </button>
                    </div>
                  </div>

                  {/* Recommendation Summary Panel */}
                  <RecommendationPanel
                    recommendations={result.recommendations}
                    comparison={result.comparison}
                    extractionMethod={result.mock ? "Deterministic extraction" : "Grounded TinyFish extraction"}
                  />

                  {/* Comparison Data Grid Table */}
                  <ComparisonMatrix
                    items={result.comparison}
                    onSelectSupplierForDraft={handleOpenDraftForSupplier}
                    onInspectEvidence={handleInspectEvidence}
                  />

                  {/* Collapsible Sources Section */}
                  <SourcesSection sources={result.sources} />
                </div>
              )}

              {/* Empty Initial State (If no results yet) */}
              {!result && !isRunning && currentStage === "idle" && (
                <div className="bg-surface-container-low/50 rounded border border-outline-variant/20 p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-headline-sm text-on-surface font-medium text-base">
                    Ready to Sourced &amp; Compare
                  </h3>
                  <p className="font-body-sm text-outline max-w-md">
                    Enter a sourcing directive above or select a preset to initiate TinyFish live search, grounded qualification, constraint enforcement, and action drafting.
                  </p>
                  <button
                    onClick={handleStartResearch}
                    className="mt-2 px-4 py-2 bg-primary-container hover:bg-[#6c78de] text-on-primary-container rounded font-label-md text-xs transition shadow-sm"
                    type="button"
                  >
                    Run Example Research
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Contextual Action Drawer */}
      <ActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedSupplier={selectedSupplierForDraft}
        actionDraft={result?.actionDrafts[0] || null}
      />

      {/* Verified Fact Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() =>
          setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))
        }
        title={evidenceModalData.title}
        fieldLabel={evidenceModalData.fieldLabel}
        evidence={evidenceModalData.evidence}
        supplierName={evidenceModalData.supplierName}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* Feature Roadmap Modal */}
      <RoadmapModal
        isOpen={Boolean(roadmapFeature)}
        onClose={() => setRoadmapFeature(null)}
        featureName={roadmapFeature || "Inbox"}
      />
    </div>
  );
}
