"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Mail,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";
import type {
  ResearchResponse,
  ProgressEventPayload,
  ResearchPlan,
  SourceDocument,
  ActionDraft,
  ResearchStage,
} from "@/lib/contracts";

const CANONICAL_PROMPT =
  "Find five reliable packaging suppliers in Bengaluru for a small D2C brand. Compare their product range, pricing, minimum order quantity, delivery, credibility and contact details. Recommend the best three and draft an enquiry email to the top choice.";

export default function Dashboard() {
  const [prompt, setPrompt] = useState(CANONICAL_PROMPT);
  const [mode, setMode] = useState<"quick" | "standard" | "deep">("standard");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<ResearchStage | "idle">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [agentLiveUrl, setAgentLiveUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const startResearch = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentStage("planning");
    setProgressPercent(5);
    setProgressMsg("Connecting to research orchestrator...");
    setPlan(null);
    setSources([]);
    setAgentLiveUrl(null);
    setResult(null);

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
        throw new Error(`API responded with status ${response.status}`);
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
                  setResult(data.data as ResearchResponse);
                }
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setProgressMsg(`Encountered error: ${(err as Error).message}`);
      }
    } finally {
      setIsRunning(false);
      setCurrentStage("done");
      setProgressPercent(100);
    }
  };

  const handleCopyEmail = (action: ActionDraft) => {
    if (action.payload.kind === "email") {
      const emailContent = `To: ${action.payload.to || "(Direct supplier desk)"}\nSubject: ${
        action.payload.subject
      }\n\n${action.payload.body}`;
      navigator.clipboard.writeText(emailContent);
      setCopiedActionId(action.id);
      setTimeout(() => setCopiedActionId(null), 2500);
    }
  };

  const handleApproveEmail = async (action: ActionDraft) => {
    if (action.payload.kind === "email") {
      try {
        const res = await fetch(`/api/actions/${action.id}/decision`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "approve",
            editedPayload: {
              to: action.payload.to,
              subject: action.payload.subject,
              body: action.payload.body,
            },
          }),
        });
        const json = await res.json();
        if (json.data?.mailto) {
          window.location.href = json.data.mailto;
        }
      } catch {
        // Fallback to clipboard
        handleCopyEmail(action);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-indigo-500/20 shadow-lg">
            OD
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-zinc-100 tracking-tight">OmniDesk</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-indigo-400 font-mono border border-indigo-500/20">
                AI Chief of Staff
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400">
          <div className="hidden md:flex items-center space-x-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400">
            <span className="text-zinc-500 font-semibold">TinyFish Stack:</span>
            <span className="text-emerald-400">Search</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400">Fetch</span>
            <span className="text-zinc-600">·</span>
            <span className="text-indigo-400">Agent Browser</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-zinc-300">Live Web Grounded</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Human-Gated</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Search & Prompt Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-zinc-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Executive Research Directive</span>
            </div>
            <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
              {(["quick", "standard", "deep"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded capitalize font-medium transition ${
                    mode === m
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="Give OmniDesk a strategic research, comparison, or supplier sourcing directive..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
            />
            <button
              onClick={startResearch}
              disabled={isRunning || !prompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition shadow-lg shadow-indigo-600/20"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Deploy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-zinc-500">Quick presets:</span>
            <button
              onClick={() => setPrompt(CANONICAL_PROMPT)}
              className="text-xs text-zinc-400 bg-zinc-800/60 hover:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-700/50 transition truncate max-w-md"
            >
              Packaging Suppliers (Bengaluru D2C)
            </button>
          </div>
        </div>

        {/* Live Mission Control Banner (Shown while running or after plan) */}
        {(isRunning || currentStage !== "idle") && (
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center space-x-2">
                {isRunning ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-semibold text-zinc-200 uppercase tracking-wider">{currentStage}</span>
                <span>—</span>
                <span className="text-zinc-300">{progressMsg}</span>
              </div>
              <span>{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Planned queries & discovered sources pills */}
            {plan && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-500 font-mono">Queries:</span>
                {plan.queries.map((q) => (
                  <span key={q.id} className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                    &quot;{q.query}&quot;
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Browser Agent PIP View (if active) */}
        {agentLiveUrl && (
          <div className="bg-zinc-900 border border-indigo-500/40 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono font-medium">Live Browser Agent Automation (TinyFish)</span>
              </div>
              <a
                href={agentLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
              >
                <span>Fullscreen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe src={agentLiveUrl} title="TinyFish Agent Live View" className="w-full h-72 border-0 bg-white" />
          </div>
        )}

        {/* Results View: Decision Matrix & Action Dock */}
        {result && (
          <div className="space-y-6">
            {/* Top Recommendations Card */}
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-zinc-100">Executive Synthesis & Decision</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {result.recommendations.map((rec) => (
                  <div
                    key={rec.rank}
                    className={`p-4 rounded-lg border ${
                      rec.rank === 1
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-zinc-950 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          rec.rank === 1
                            ? "bg-emerald-500 text-zinc-950"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        RANK #{rec.rank}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">Confidence: {rec.confidence}</span>
                    </div>

                    <h3 className="font-semibold text-zinc-100 mb-1">
                      {result.comparison.find((c) => c.id === rec.itemId)?.name || `Option ${rec.rank}`}
                    </h3>

                    <p className="text-xs text-zinc-300 leading-relaxed mb-3">{rec.rationale}</p>

                    {rec.risks.length > 0 && (
                      <div className="flex items-start space-x-1.5 text-xs text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{rec.risks[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-zinc-200">Verifiable Comparison Matrix</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {result.sources.length} sources analyzed · Zero fabricated claims
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 w-40">Attribute</th>
                      {result.comparison.map((col) => (
                        <th key={col.id} className="px-4 py-3 min-w-[200px]">
                          <div className="font-semibold text-zinc-200">{col.name}</div>
                          {col.website && (
                            <a
                              href={col.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-indigo-400 hover:underline flex items-center space-x-1 mt-0.5"
                            >
                              <span className="truncate max-w-[150px]">{col.website.replace("https://", "")}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {result.plan.comparisonCriteria.map((crit) => (
                      <tr key={crit} className="hover:bg-zinc-800/20 transition">
                        <td className="px-4 py-3 font-mono font-medium text-zinc-400 capitalize">
                          {crit.replace("_", " ")}
                        </td>
                        {result.comparison.map((col) => {
                          const val = col.facts[crit];
                          const isNotFound = !val || val === "Not found";
                          return (
                            <td key={col.id} className="px-4 py-3">
                              {isNotFound ? (
                                <span className="inline-block bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 px-2 py-0.5 rounded font-mono text-[11px]">
                                  Not found
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-zinc-200 font-medium">{val}</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td className="px-4 py-3 font-mono font-medium text-zinc-400">Evidence Score</td>
                      {result.comparison.map((col) => (
                        <td key={col.id} className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {col.evidenceScore}% Verified
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Dock (Human-in-the-Loop Gate) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-zinc-200">
                    Human-in-the-Loop Action Dock
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  OmniDesk prepares actions; actions wait for your approval.
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {result.actionDrafts.map((act) => (
                  <div key={act.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {act.type === "email" ? (
                          <Mail className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-medium text-xs text-zinc-200">{act.title}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                        {act.status}
                      </span>
                    </div>

                    {act.payload.kind === "email" && (
                      <div className="space-y-2">
                        <div className="text-xs text-zinc-400 font-mono">
                          To: <span className="text-zinc-200">{act.payload.to || "(Direct supplier sales)"}</span>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          Subject: <span className="text-zinc-200">{act.payload.subject}</span>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded p-3 text-xs text-zinc-300 font-sans whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                          {act.payload.body}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleApproveEmail(act)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Approve & Open Email</span>
                          </button>
                          <button
                            onClick={() => handleCopyEmail(act)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 transition"
                          >
                            {copiedActionId === act.id ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {act.payload.kind === "task" && (
                      <div className="space-y-2">
                        <p className="text-xs text-zinc-300">{act.payload.description}</p>
                        <div className="text-xs text-amber-400 font-mono">Due: {act.payload.dueHint}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
