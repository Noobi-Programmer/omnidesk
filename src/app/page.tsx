"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Sparkles,
  FileText,
  Table,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
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
  FounderByte,
} from "@/lib/contracts";
import { Sidebar, type WorkspaceTab } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ResearchComposer } from "@/components/ResearchComposer";
import { ResearchProgress } from "@/components/ResearchProgress";
import { DeepReportView } from "@/components/DeepReportView";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { SourcesSection } from "@/components/SourcesSection";
import { FounderBytesView } from "@/components/FounderBytesView";
import { HistoryView } from "@/components/HistoryView";
import { SavedView } from "@/components/SavedView";
import { ActionDrawer } from "@/components/ActionDrawer";
import { EvidenceModal } from "@/components/EvidenceModal";
import {
  getStoredHistory,
  saveToHistory,
  deleteFromHistory,
  clearAllHistory,
} from "@/lib/client/history";
import {
  UserProfile,
  getStoredProfile,
  saveStoredProfile,
} from "@/lib/client/workspaceState";

const INITIAL_PROMPT =
  "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)";

export default function WorkspacePage() {
  // Navigation State: "research" | "bytes" | "history" | "saved"
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("research");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile & Theme State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");

  // Research Engine State
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [mode, setMode] = useState<ResearchMode>("deep");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<ResearchStage | "idle">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [resultSubTab, setResultSubTab] = useState<"report" | "comparison" | "actions" | "sources">("report");

  // History State
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);

  // Saved Items State (Stored in localStorage)
  const [savedReports, setSavedReports] = useState<ResearchResponse[]>([]);
  const [savedBytes, setSavedBytes] = useState<FounderByte[]>([]);

  // Action Drawer & Modals
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

  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Initial State from LocalStorage
  useEffect(() => {
    // 1. Profile & Theme
    const storedProf = getStoredProfile();
    if (storedProf) {
      setProfile(storedProf);
      const theme = storedProf.theme || "dark";
      setCurrentTheme(theme);
      if (typeof document !== "undefined") {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } else {
      const defaultProf: UserProfile = {
        name: "Founder",
        role: "Founder & Operator",
        interests: ["Packaging & Manufacturing", "AI & Machine Learning", "Startups & Venture"],
        company: "CraftBrew Labs",
        isOnboarded: true,
        theme: "dark",
      };
      setProfile(defaultProf);
    }

    // 2. Research History
    const loadedHistory = getStoredHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0 && !result) {
      const latest = loadedHistory[0];
      setResult(latest.response);
      setPlan(latest.response.plan);
      setSources(latest.response.sources);
      setPrompt(latest.response.request.prompt);
      setMode(latest.response.request.mode);
      setCurrentStage("done");
      setProgressPercent(100);
      setProgressMsg("Loaded from saved session");
    }

    // 3. Saved Reports & Saved Bytes
    try {
      const storedReportsJson = localStorage.getItem("omnidesk_saved_reports");
      if (storedReportsJson) {
        setSavedReports(JSON.parse(storedReportsJson));
      }
      const storedBytesJson = localStorage.getItem("omnidesk_saved_bytes");
      if (storedBytesJson) {
        setSavedBytes(JSON.parse(storedBytesJson));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Theme Toggle Handler
  const handleToggleTheme = () => {
    const nextTheme: "dark" | "light" = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(nextTheme);
    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    if (profile) {
      const updated: UserProfile = { ...profile, theme: nextTheme };
      setProfile(updated);
      saveStoredProfile(updated);
    }
  };

  // Deep Research Runner
  const handleStartResearch = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentStage("planning");
    setProgressPercent(8);
    setProgressMsg("Formulating research plan and parsing constraints...");
    setPlan(null);
    setSources([]);
    setResult(null);
    setSelectedSupplierForDraft(null);
    setResultSubTab("report");

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

          if (!eventName || !dataText) continue;

          try {
            const parsedData = JSON.parse(dataText);

            if (eventName === "progress") {
              const p = parsedData as ProgressEventPayload;
              setCurrentStage(p.stage);
              setProgressPercent(p.progress);
              setProgressMsg(p.message);
            } else if (eventName === "plan") {
              setPlan(parsedData as ResearchPlan);
            } else if (eventName === "source_found") {
              const src = parsedData as SourceDocument;
              setSources((prev) => {
                if (prev.some((s) => s.id === src.id)) return prev;
                return [...prev, src];
              });
            } else if (eventName === "complete") {
              const completeRes = parsedData as ResearchResponse;
              setResult(completeRes);
              setIsRunning(false);
              setCurrentStage("done");
              setProgressPercent(100);
              setProgressMsg("Deep Research complete");

              const updatedHistory = saveToHistory(completeRes);
              setHistory(updatedHistory);
            } else if (eventName === "error") {
              setIsRunning(false);
              setProgressMsg(parsedData.message || "An unexpected error occurred");
            }
          } catch {
            // ignore non-json keepalives
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setProgressMsg("Research cancelled");
      } else {
        setProgressMsg(err instanceof Error ? err.message : "Network error");
      }
      setIsRunning(false);
    }
  };

  const handleNewResearch = () => {
    if (isRunning && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPrompt("");
    setPlan(null);
    setSources([]);
    setResult(null);
    setSelectedSupplierForDraft(null);
    setIsRunning(false);
    setCurrentStage("idle");
    setProgressPercent(0);
    setProgressMsg("");
    setCurrentTab("research");

    setTimeout(() => {
      if (composerTextareaRef.current) {
        composerTextareaRef.current.focus();
      }
    }, 50);
  };

  const handleSelectHistoryItem = (item: ResearchHistoryItem) => {
    setResult(item.response);
    setPlan(item.response.plan);
    setSources(item.response.sources);
    setPrompt(item.response.request.prompt);
    setMode(item.response.request.mode);
    setCurrentStage("done");
    setProgressPercent(100);
    setProgressMsg("Loaded from saved session");
    setCurrentTab("research");
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteFromHistory(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  // Saved Management
  const handleToggleSaveReport = (res: ResearchResponse) => {
    setSavedReports((prev) => {
      const exists = prev.some((r) => r.taskId === res.taskId);
      let updated: ResearchResponse[];
      if (exists) {
        updated = prev.filter((r) => r.taskId !== res.taskId);
      } else {
        updated = [res, ...prev];
      }
      try {
        localStorage.setItem("omnidesk_saved_reports", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleToggleSaveByte = (byte: FounderByte) => {
    setSavedBytes((prev) => {
      const exists = prev.some((b) => b.id === byte.id);
      let updated: FounderByte[];
      if (exists) {
        updated = prev.filter((b) => b.id !== byte.id);
      } else {
        updated = [byte, ...prev];
      }
      try {
        localStorage.setItem("omnidesk_saved_bytes", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleRemoveReport = (taskId: string) => {
    setSavedReports((prev) => {
      const updated = prev.filter((r) => r.taskId !== taskId);
      try {
        localStorage.setItem("omnidesk_saved_reports", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleRemoveByte = (byteId: string) => {
    setSavedBytes((prev) => {
      const updated = prev.filter((b) => b.id !== byteId);
      try {
        localStorage.setItem("omnidesk_saved_bytes", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleOpenDraftForSupplier = (supplier: ComparisonItem) => {
    setSelectedSupplierForDraft(supplier);
    setIsDrawerOpen(true);
  };

  const handleInspectEvidence = (
    fieldLabel: string,
    evidence: EvidenceField<string>,
    supplierName: string
  ) => {
    setEvidenceModalData({
      isOpen: true,
      title: `${supplierName} - ${fieldLabel}`,
      fieldLabel,
      evidence,
      supplierName,
    });
  };

  const isCurrentReportSaved = result
    ? savedReports.some((r) => r.taskId === result.taskId)
    : false;

  const savedByteIdsSet = new Set(savedBytes.map((b) => b.id));
  const totalSavedCount = savedReports.length + savedBytes.length;

  return (
    <div className="flex h-screen w-full bg-surface-container-lowest text-on-surface antialiased overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onNewResearch={handleNewResearch}
        history={history}
        activeTaskId={result?.taskId || null}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        savedCount={totalSavedCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full pl-0 lg:pl-64 overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          isLiveEngine={Boolean(process.env.NEXT_PUBLIC_TINYFISH_API_KEY || true)}
          profile={profile}
          onOpenProfileSetup={() => {}}
          currentTheme={currentTheme}
          onToggleTheme={handleToggleTheme}
          activeTabLabel={
            currentTab === "research"
              ? "Deep Research"
              : currentTab === "bytes"
              ? "Founder Bytes"
              : currentTab === "history"
              ? "Research History"
              : "Saved Items"
          }
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto mt-14 flex flex-col">
          {/* TAB 1: PILLAR A - DEEP RESEARCH */}
          {currentTab === "research" && (
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
              {/* Composer */}
              <ResearchComposer
                prompt={prompt}
                setPrompt={setPrompt}
                mode={mode}
                setMode={setMode}
                isRunning={isRunning}
                onSubmit={handleStartResearch}
                textareaRef={composerTextareaRef}
              />

              {/* Progress */}
              {isRunning && (
                <ResearchProgress
                  currentStage={currentStage}
                  progressPercent={progressPercent}
                  progressMsg={progressMsg}
                  plan={plan}
                  sources={sources}
                  agentLiveUrl={null}
                  isRunning={isRunning}
                />
              )}

              {/* Research Results */}
              {result && !isRunning && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Results Navigation Bar */}
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      <button
                        onClick={() => setResultSubTab("report")}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          resultSubTab === "report"
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                        type="button"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Executive Deep Report</span>
                      </button>

                      <button
                        onClick={() => setResultSubTab("comparison")}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          resultSubTab === "comparison"
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                        type="button"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Comparison Matrix ({result.comparison.length})</span>
                      </button>

                      <button
                        onClick={() => setResultSubTab("actions")}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          resultSubTab === "actions"
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                        type="button"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Commercial Actions ({result.actionDrafts.length})</span>
                      </button>

                      <button
                        onClick={() => setResultSubTab("sources")}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          resultSubTab === "sources"
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container text-outline hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                        type="button"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Sources ({result.sources.length})</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-outline">
                      <span>Task: {result.taskId}</span>
                      <span>•</span>
                      <span>{result.stats.durationMs / 1000}s</span>
                    </div>
                  </div>

                  {/* Sub-view: Deep Report */}
                  {resultSubTab === "report" && (
                    <DeepReportView
                      response={result}
                      onSaveReport={handleToggleSaveReport}
                      isSaved={isCurrentReportSaved}
                    />
                  )}

                  {/* Sub-view: Comparison Matrix */}
                  {resultSubTab === "comparison" && (
                    <div className="space-y-4">
                      <ComparisonMatrix
                        items={result.comparison}
                        onSelectSupplierForDraft={handleOpenDraftForSupplier}
                        onInspectEvidence={handleInspectEvidence}
                      />
                    </div>
                  )}

                  {/* Sub-view: Actions */}
                  {resultSubTab === "actions" && (
                    <div className="space-y-4">
                      <RecommendationPanel
                        recommendations={result.recommendations}
                        comparison={result.comparison}
                      />
                    </div>
                  )}

                  {/* Sub-view: Sources */}
                  {resultSubTab === "sources" && (
                    <div className="space-y-4">
                      <SourcesSection sources={result.sources} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PILLAR B - FOUNDER BYTES & TINYMONITOR */}
          {currentTab === "bytes" && (
            <FounderBytesView
              onSaveByte={handleToggleSaveByte}
              savedByteIds={savedByteIdsSet}
            />
          )}

          {/* TAB 3: HISTORY */}
          {currentTab === "history" && (
            <HistoryView
              history={history}
              onSelectHistoryItem={(item) => {
                handleSelectHistoryItem(item);
                setCurrentTab("research");
              }}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearAllHistory={handleClearAllHistory}
            />
          )}

          {/* TAB 4: SAVED */}
          {currentTab === "saved" && (
            <SavedView
              savedReports={savedReports}
              savedBytes={savedBytes}
              onSelectReport={(rep) => {
                setResult(rep);
                setPlan(rep.plan);
                setSources(rep.sources);
                setPrompt(rep.request.prompt);
                setMode(rep.request.mode);
                setCurrentStage("done");
                setProgressPercent(100);
                setCurrentTab("research");
              }}
              onRemoveReport={handleRemoveReport}
              onRemoveByte={handleRemoveByte}
            />
          )}
        </main>
      </div>

      {/* Action Drawer */}
      {selectedSupplierForDraft && (
        <ActionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          selectedSupplier={selectedSupplierForDraft}
          actionDraft={result?.actionDrafts[0] || null}
        />
      )}

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))}
        title={evidenceModalData.title}
        fieldLabel={evidenceModalData.fieldLabel}
        evidence={evidenceModalData.evidence}
        supplierName={evidenceModalData.supplierName}
      />
    </div>
  );
}
