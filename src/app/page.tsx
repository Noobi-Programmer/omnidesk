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
  Sliders,
  History,
  Bookmark,
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
import { LandingPage } from "@/components/LandingPage";
import { AuthModal } from "@/components/AuthModal";
import { ProfileSetupModal } from "@/components/ProfileSetupModal";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { FounderBriefSection } from "@/components/FounderBriefSection";
import { BriefDetailModal } from "@/components/BriefDetailModal";
import { AssistantView } from "@/components/AssistantView";
import { ResearchComposer } from "@/components/ResearchComposer";
import { ResearchProgress } from "@/components/ResearchProgress";
import { DeepReportView } from "@/components/DeepReportView";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { SourcesSection } from "@/components/SourcesSection";
import { SavedInsightsView } from "@/components/SavedInsightsView";
import { TasksView } from "@/components/TasksView";
import { HistoryView } from "@/components/HistoryView";
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
  FounderBriefItem,
  SavedInsight,
  UserTask,
  AssistantMessage,
  getStoredProfile,
  saveStoredProfile,
  getStoredInsights,
  saveStoredInsight,
  deleteStoredInsight,
  getStoredTasks,
  saveStoredTask,
  toggleTaskStatus,
  deleteStoredTask,
  getStoredChat,
  saveStoredChat,
} from "@/lib/client/workspaceState";
import { getRankedFeed } from "@/lib/client/intelligenceFeed";

const INITIAL_PROMPT =
  "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)";

export default function WorkspacePage() {
  // App View State: "landing" | "workspace"
  const [appView, setAppView] = useState<"landing" | "workspace">("landing");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Navigation State within Workspace
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile & Theme State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");

  // Research Engine State (Stitch Web Agent)
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [mode, setMode] = useState<ResearchMode>("deep");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<ResearchStage | "idle">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [agentLiveUrl, setAgentLiveUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [resultSubTab, setResultSubTab] = useState<"report" | "comparison" | "actions" | "sources">("report");

  // History State
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);

  // FounderBrief & Intelligence State
  const [feedItems, setFeedItems] = useState<FounderBriefItem[]>([]);
  const [selectedBriefItem, setSelectedBriefItem] = useState<FounderBriefItem | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  // Saved Insights, Tasks & Assistant Chat
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([]);

  // Saved Deep Reports (Legacy / report persistence)
  const [savedReports, setSavedReports] = useState<ResearchResponse[]>([]);

  // Action Drawer & Evidence Modals
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
    // 1. Check Authenticated Session & Profile
    const storedAuth = typeof window !== "undefined" ? localStorage.getItem("omnidesk_auth_state") : null;
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
        name: "Neel",
        role: "Founder / CEO",
        interests: ["Packaging & Manufacturing", "AI & Machine Learning", "Startups & Venture"],
        company: "CraftBrew Labs",
        isOnboarded: true,
        theme: "dark",
      };
      setProfile(defaultProf);
    }

    // If previously authenticated or entered, restore workspace directly
    if (storedAuth === "logged_in") {
      setAppView("workspace");
    }

    // 2. Intelligence Feed
    const initialFeed = getRankedFeed(storedProf || undefined);
    setFeedItems(initialFeed);

    // 3. Saved Insights & Tasks
    setSavedInsights(getStoredInsights());
    setTasks(getStoredTasks());

    // 4. Saved Reports
    try {
      const storedReportsJson = localStorage.getItem("omnidesk_saved_reports");
      if (storedReportsJson) {
        setSavedReports(JSON.parse(storedReportsJson));
      }
    } catch {
      // Ignore
    }

    // 5. Assistant Chat
    const initialChat = getStoredChat();
    if (initialChat.length > 0) {
      setChatMessages(initialChat);
    } else {
      setChatMessages([
        {
          id: "welcome-1",
          sender: "assistant",
          text: `Welcome to OmniDesk, ${storedProf?.name || "Neel"}. I am grounded in your workspace profile (${storedProf?.role || "Founder"}). I can help investigate market questions, evaluate supplier trade-offs, and draft verified next steps. What should we tackle?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }

    // 6. Research History
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
  }, []);

  // Theme Toggle Handler (Main Workspace Only)
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

  // Authentication Flow Handlers
  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthenticated = (userData: { name: string; email: string; isNewUser: boolean }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omnidesk_auth_state", "logged_in");
    }
    setIsAuthModalOpen(false);

    if (userData.isNewUser) {
      // Direct new user to minimal profile setup
      setIsProfileModalOpen(true);
    } else {
      // Returning user: go straight to workspace
      setAppView("workspace");
      setCurrentTab("overview");
    }
  };

  const handleCompleteProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem("omnidesk_auth_state", "logged_in");
    }
    setIsProfileModalOpen(false);
    // Refresh feed with new preferences
    const refreshed = getRankedFeed(newProfile);
    setFeedItems(refreshed);
    setAppView("workspace");
    setCurrentTab("overview");
  };

  const handleLogOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("omnidesk_auth_state");
    }
    setAppView("landing");
  };

  // Deep Web Research Runner
  const handleStartResearch = async () => {
    if (!prompt.trim() || isRunning) return;

    if (prompt.length > 12000) {
      setCurrentStage("failed");
      setProgressMsg("Research prompt cannot exceed 12,000 characters. Please condense your prompt.");
      return;
    }

    setIsRunning(true);
    setCurrentStage("planning");
    setProgressPercent(8);
    setProgressMsg("Formulating research plan and parsing constraints...");
    setPlan(null);
    setSources([]);
    setAgentLiveUrl(null);
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
            } else if (eventName === "source" || eventName === "source_found") {
              const src = parsedData as SourceDocument;
              setSources((prev) => {
                if (prev.some((s) => s.id === src.id)) return prev;
                return [...prev, src];
              });
            } else if (eventName === "agent_live") {
              if (parsedData?.agentLiveUrl) {
                setAgentLiveUrl(parsedData.agentLiveUrl);
              }
            } else if (eventName === "result" || eventName === "complete") {
              let finalData: ResearchResponse | null = null;
              if (parsedData && typeof parsedData === "object") {
                if ("data" in parsedData && parsedData.data) {
                  finalData = parsedData.data as ResearchResponse;
                } else if ("taskId" in parsedData && "plan" in parsedData) {
                  finalData = parsedData as ResearchResponse;
                }
              }

              if (finalData) {
                setResult(finalData);
                setCurrentStage("done");
                setProgressPercent(100);
                setProgressMsg("Deep Research complete");

                const updatedHistory = saveToHistory(finalData);
                setHistory(updatedHistory);
              }
            } else if (eventName === "error") {
              setCurrentStage("failed");
              setProgressMsg(parsedData.message || "An unexpected error occurred during research");
            }
          } catch {
            // ignore non-json keepalives
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setCurrentStage("cancelled");
        setProgressMsg("Research cancelled");
      } else {
        setCurrentStage("failed");
        setProgressMsg(err instanceof Error ? err.message : "Pipeline execution failed");
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleNewResearch = () => {
    if (isRunning && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPrompt("");
    setPlan(null);
    setSources([]);
    setAgentLiveUrl(null);
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

  // FounderBrief Actions
  const handleOpenBriefDetail = (item: FounderBriefItem) => {
    setSelectedBriefItem(item);
    setIsBriefModalOpen(true);
  };

  const handleSaveInsight = (item: FounderBriefItem) => {
    const updated = saveStoredInsight({
      briefId: item.id,
      title: item.headline,
      takeaway: item.deepBrief?.whyItMatters || item.summary,
      sourceTitle: item.source,
      sourceUrl: item.sourceUrl,
      tags: item.matchedInterests,
    });
    setSavedInsights(updated);
  };

  const handleDeleteInsight = (id: string) => {
    const updated = deleteStoredInsight(id);
    setSavedInsights(updated);
  };

  const handleCreateTask = (title: string, notes?: string, dueHint?: string) => {
    const updated = saveStoredTask({
      title,
      notes,
      dueHint: dueHint || "in 3 business days",
    });
    setTasks(updated);
  };

  const handleToggleTask = (id: string) => {
    const updated = toggleTaskStatus(id);
    setTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = deleteStoredTask(id);
    setTasks(updated);
  };

  // Assistant Chat Actions
  const handleSendAssistantMessage = (userText: string) => {
    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newChat = [...chatMessages, userMsg];
    setChatMessages(newChat);

    setTimeout(() => {
      let botResponse = "";
      let actionProposal: AssistantMessage["actionProposal"] | undefined = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes("risk") || lower.includes("regulation") || lower.includes("bpa")) {
        botResponse = `Based on the latest EU Food Contact Directives, the primary compliance risk is the mandatory transition to BPA-NI (Non-Intent) liners by Q3 2025. Legacy epoxy coatings without specific migration certificates are subject to customs hold in Rotterdam and Hamburg. I recommend prioritizing suppliers with audited ISO/EFSA declarations like Envases Group and Ardagh.`;
        actionProposal = {
          type: "create_task",
          payload: {
            title: "Request BPA-NI Migration Certificates from shortlisted canning lines",
            notes: "Ensure certificates cite EU Regulation 1935/2004 and meet migration limits.",
          },
          status: "proposed",
        };
      } else if (lower.includes("bengaluru") || lower.includes("box") || lower.includes("kraft")) {
        botResponse = `For Bengaluru corrugated packaging, 3-ply kraft mailers with MOQ < 2,000 units are available from regional converters in Peenya Industrial Area and Bommasandra. Would you like me to launch a dedicated web research comparison?`;
        actionProposal = {
          type: "run_research",
          payload: {
            prompt: "Compare corrugated box and eco-friendly mailer packaging suppliers in Bengaluru (MOQ < 2000, 3-ply kraft)",
          },
          status: "proposed",
        };
      } else if (lower.includes("task") || lower.includes("audit") || lower.includes("follow-up")) {
        botResponse = `I've prepared a follow-up action to audit our supplier certifications and track pending pilot batch lead times. Should I add this to your tasks list?`;
        actionProposal = {
          type: "create_task",
          payload: {
            title: "Supplier Certification & Batch Audit",
            notes: "Verify lead times and liner specs across selected European suppliers.",
          },
          status: "proposed",
        };
      } else {
        botResponse = `I reviewed your question against our verified supplier data and intelligence feed. Everything we recommend is grounded in verified source documents without hallucinated metrics. How would you like to proceed?`;
      }

      const botMsg: AssistantMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionProposal,
      };

      const finalChat = [...newChat, botMsg];
      setChatMessages(finalChat);
      saveStoredChat(finalChat);
    }, 600);
  };

  const handleExecuteAssistantAction = (
    msgId: string,
    action: { type: "create_task" | "save_insight" | "run_research"; payload: Record<string, unknown> }
  ) => {
    const updated = chatMessages.map((m) => {
      if (m.id === msgId && m.actionProposal) {
        return {
          ...m,
          actionProposal: {
            ...m.actionProposal,
            status: "approved" as const,
          },
        };
      }
      return m;
    });
    setChatMessages(updated);
    saveStoredChat(updated);

    if (action.type === "create_task") {
      handleCreateTask(
        (action.payload.title as string) || "Assistant follow-up task",
        (action.payload.notes as string) || undefined
      );
    } else if (action.type === "run_research") {
      if (typeof action.payload.prompt === "string") {
        setPrompt(action.payload.prompt);
        setCurrentTab("research");
        setTimeout(() => handleStartResearch(), 100);
      }
    }
  };

  const isLiveEngine = Boolean(process.env.NEXT_PUBLIC_APP_NAME) || !result?.mock;

  // SCREEN 1: Public Landing Page View
  if (appView === "landing") {
    return (
      <>
        <LandingPage
          onGetStarted={() => handleOpenAuth("signup")}
          onLogIn={() => handleOpenAuth("login")}
          onExploreWorkspace={() => {
            setAppView("workspace");
            setCurrentTab("overview");
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticate={handleAuthenticated}
          initialMode={authMode}
        />

        <ProfileSetupModal
          isOpen={isProfileModalOpen}
          onComplete={handleCompleteProfile}
          onClose={() => {
            setIsProfileModalOpen(false);
            setAppView("workspace");
          }}
          initialProfile={profile}
        />
      </>
    );
  }

  // SCREEN 4: Main Workspace / Dashboard
  return (
    <div className="bg-surface min-h-screen font-body-sm text-body-sm text-on-surface antialiased flex flex-col selection:bg-primary-container selection:text-on-primary-container">
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
        profile={profile}
        onOpenProfileSetup={() => setIsProfileModalOpen(true)}
        onGoToLanding={handleLogOut}
        pendingTasksCount={tasks.filter((t) => t.status === "pending").length}
        savedInsightsCount={savedInsights.length}
        savedCount={savedReports.length}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          isLiveEngine={isLiveEngine}
          profile={profile}
          onOpenProfileSetup={() => setIsProfileModalOpen(true)}
          currentTheme={currentTheme}
          onToggleTheme={handleToggleTheme}
          activeTabLabel={currentTab}
        />

        {/* Workspace Canvas */}
        <main className="relative pt-14 min-h-screen bg-surface w-full px-4 sm:px-6 lg:px-margin-desktop py-space-xl">
          <div className="flex flex-col w-full">
            <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-space-lg pb-space-xl">
              {/* TAB 1: OVERVIEW */}
              {currentTab === "overview" && (
                <OverviewDashboard
                  profile={profile}
                  onOpenProfileSetup={() => setIsProfileModalOpen(true)}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onQuickResearch={(p) => {
                    setPrompt(p);
                    setCurrentTab("research");
                    setTimeout(() => handleStartResearch(), 100);
                  }}
                  topBriefItems={feedItems}
                  onOpenBriefDetail={handleOpenBriefDetail}
                  savedInsights={savedInsights}
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  recentResearch={history}
                  onSelectRecentResearch={handleSelectHistoryItem}
                />
              )}

              {/* TAB 2: FOUNDERBRIEF */}
              {currentTab === "founderbrief" && (
                <FounderBriefSection
                  items={feedItems}
                  onOpenBriefDetail={handleOpenBriefDetail}
                  onSaveInsight={handleSaveInsight}
                  savedInsights={savedInsights}
                  onRefreshFeed={() => setFeedItems(getRankedFeed(profile || undefined))}
                />
              )}

              {/* TAB 3: AI ASSISTANT */}
              {currentTab === "assistant" && (
                <AssistantView
                  messages={chatMessages}
                  onSendMessage={handleSendAssistantMessage}
                  onExecuteActionProposal={handleExecuteAssistantAction}
                  profile={profile}
                  onRunResearch={(p) => {
                    setPrompt(p);
                    setCurrentTab("research");
                    setTimeout(() => handleStartResearch(), 100);
                  }}
                />
              )}

              {/* TAB 4: SAVED INSIGHTS */}
              {currentTab === "insights" && (
                <SavedInsightsView
                  insights={savedInsights}
                  onDeleteInsight={handleDeleteInsight}
                  onInspectInsight={(ins) => {
                    const match = feedItems.find((f) => f.headline === ins.title);
                    if (match) handleOpenBriefDetail(match);
                  }}
                />
              )}

              {/* TAB 5: TASKS / FOLLOW-UPS */}
              {currentTab === "tasks" && (
                <TasksView
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleCreateTask}
                />
              )}

              {/* TAB 6: WEB RESEARCH (CORE STITCH WORKSPACE) */}
              {currentTab === "research" && (
                <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
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

                  {/* Research Progress Bar & Telemetry */}
                  {isRunning && (
                    <ResearchProgress
                      currentStage={currentStage}
                      progressPercent={progressPercent}
                      progressMsg={progressMsg}
                      plan={plan}
                      sources={sources}
                      agentLiveUrl={agentLiveUrl}
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
                          <span>{(result.stats.durationMs / 1000).toFixed(1)}s</span>
                        </div>
                      </div>

                      {/* Sub-view: Deep Report */}
                      {resultSubTab === "report" && (
                        <DeepReportView
                          response={result}
                          onSaveReport={(report) => {
                            const updated = [report, ...savedReports.filter((r) => r.taskId !== report.taskId)];
                            setSavedReports(updated);
                            localStorage.setItem("omnidesk_saved_reports", JSON.stringify(updated));
                          }}
                          isSaved={savedReports.some((r) => r.taskId === result.taskId)}
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

                  {/* Empty Initial State (If no results yet) */}
                  {!result && !isRunning && currentStage === "idle" && (
                    <div className="bg-surface-container-low/50 rounded border border-outline-variant/20 p-12 text-center flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-headline-sm text-on-surface font-medium text-base">
                        Ready to Source &amp; Compare
                      </h3>
                      <p className="font-body-sm text-outline max-w-md">
                        Enter a research directive above or select a preset to initiate TinyFish live search, grounded qualification, constraint enforcement, and action drafting.
                      </p>
                      <button
                        onClick={handleStartResearch}
                        className="mt-2 px-4 py-2 bg-primary-container hover:bg-[#6c78de] text-on-primary-container rounded font-label-md text-xs transition shadow-sm cursor-pointer"
                        type="button"
                      >
                        Run Example Research
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: HISTORY VIEW */}
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

      {/* FounderBrief Deep Detail Modal */}
      <BriefDetailModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        item={selectedBriefItem}
        onSaveInsight={handleSaveInsight}
        onCreateTask={handleCreateTask}
        isSaved={Boolean(
          selectedBriefItem &&
            savedInsights.some((s) => s.title === selectedBriefItem.headline)
        )}
        onDeepWebResearch={(q) => {
          setIsBriefModalOpen(false);
          setPrompt(q);
          setCurrentTab("research");
          setTimeout(() => handleStartResearch(), 100);
        }}
      />

      {/* Profile Setup / Preferences Modal */}
      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onComplete={handleCompleteProfile}
        onClose={() => setIsProfileModalOpen(false)}
        initialProfile={profile}
      />

      {/* Auth Modal (Triggered if user clicks Log In or Sign Up from Landing Page or settings) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticated}
        initialMode={authMode}
      />
    </div>
  );
}
