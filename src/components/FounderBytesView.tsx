"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Globe,
  Tag,
  Clock,
  Calendar,
  Zap,
  Radio,
  Play,
  Pause,
  Trash2,
  Plus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import type {
  FounderByte,
  FeedCategory,
  ApiResponse,
  TinyMonitor,
  CreateMonitorRequest,
} from "@/lib/contracts";

const CATEGORIES: FeedCategory[] = [
  "All",
  "Startups",
  "Funding & VC",
  "AI & Technology",
  "Markets & Business",
  "Founder Insights",
  "Product Launches",
];

interface FounderBytesViewProps {
  onSaveByte?: (byte: FounderByte) => void;
  savedByteIds?: Set<string>;
}

export function FounderBytesView({
  onSaveByte,
  savedByteIds = new Set(),
}: FounderBytesViewProps) {
  const [activeTab, setActiveTab] = useState<"feed" | "monitors">("feed");

  // Feed state
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bytes, setBytes] = useState<FounderByte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Monitors state
  const [monitors, setMonitors] = useState<TinyMonitor[]>([]);
  const [isLoadingMonitors, setIsLoadingMonitors] = useState(false);
  const [runningMonitorId, setRunningMonitorId] = useState<string | null>(null);
  const [monitorsNotice, setMonitorsNotice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Monitor Form State
  const [newMonType, setNewMonType] = useState<"search" | "fetch">("search");
  const [newMonName, setNewMonName] = useState("");
  const [newMonQueryOrUrl, setNewMonQueryOrUrl] = useState("");
  const [newMonPurpose, setNewMonPurpose] = useState("");
  const [isSubmittingMon, setIsSubmittingMon] = useState(false);

  // 1. Fetch Feed Bytes
  const fetchBytes = async (live = false) => {
    try {
      if (live) setIsRefreshing(true);
      else setIsLoading(true);
      setFeedError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }
      if (live) {
        params.append("live", "true");
      }

      const res = await fetch(`/api/bytes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load intelligence bytes");
      const json: ApiResponse<FounderByte[]> = await res.json();
      if (json.data) {
        setBytes(json.data);
      }
    } catch (err: unknown) {
      setFeedError(err instanceof Error ? err.message : "Error fetching bytes");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 2. Fetch TinyMonitors
  const fetchMonitors = async () => {
    try {
      setIsLoadingMonitors(true);
      const res = await fetch("/api/monitors");
      if (res.ok) {
        const json: ApiResponse<TinyMonitor[]> = await res.json();
        if (json.data) {
          setMonitors(json.data);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingMonitors(false);
    }
  };

  useEffect(() => {
    fetchBytes(false);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (activeTab === "monitors") {
      fetchMonitors();
    }
  }, [activeTab]);

  // Monitor Actions
  const handleToggleStatus = async (mon: TinyMonitor) => {
    const nextStatus = mon.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/monitors/${mon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setMonitors((prev) =>
          prev.map((m) => (m.id === mon.id ? { ...m, status: nextStatus } : m))
        );
        setMonitorsNotice(`Monitor "${mon.name}" is now ${nextStatus}.`);
        setTimeout(() => setMonitorsNotice(null), 3000);
      }
    } catch {
      // Ignore
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      setRunningMonitorId(id);
      const res = await fetch(`/api/monitors/${id}/runs`, { method: "POST" });
      if (res.ok) {
        setMonitors((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, last_run_at: new Date().toISOString() } : m
          )
        );
        setMonitorsNotice("Immediate check completed. New intelligence ingested.");
        setTimeout(() => setMonitorsNotice(null), 4000);
        // Refresh feed in background
        fetchBytes(false);
      }
    } catch {
      // Ignore
    } finally {
      setRunningMonitorId(null);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMonitors((prev) => prev.filter((m) => m.id !== id));
        setMonitorsNotice("Subscription removed.");
        setTimeout(() => setMonitorsNotice(null), 3000);
      }
    } catch {
      // Ignore
    }
  };

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonName.trim() || !newMonQueryOrUrl.trim()) return;

    try {
      setIsSubmittingMon(true);
      const payload: CreateMonitorRequest = {
        name: newMonName.trim(),
        type: newMonType,
        config:
          newMonType === "search"
            ? {
                query: newMonQueryOrUrl.trim(),
                recency_minutes: 1440,
                result_limit: 8,
              }
            : {
                url: newMonQueryOrUrl.trim(),
                format: "markdown",
              },
        schedule_cron: "0 8 * * *",
        purpose: newMonPurpose.trim() || "Recurring intelligence monitoring for founders.",
      };

      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json: ApiResponse<TinyMonitor> = await res.json();
        if (json.data) {
          setMonitors((prev) => [json.data!, ...prev]);
        }
        setShowAddModal(false);
        setNewMonName("");
        setNewMonQueryOrUrl("");
        setNewMonPurpose("");
        setMonitorsNotice("New monitor subscription created successfully.");
        setTimeout(() => setMonitorsNotice(null), 4000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to create monitor");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create monitor");
    } finally {
      setIsSubmittingMon(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("reuters")) return "bg-amber-950/40 text-amber-300 border-amber-800/40";
    if (s.includes("y combinator") || s.includes("yc")) return "bg-orange-950/40 text-orange-300 border-orange-800/40";
    if (s.includes("twitter") || s.includes("x")) return "bg-sky-950/40 text-sky-300 border-sky-800/40";
    if (s.includes("stratechery") || s.includes("blog")) return "bg-emerald-950/40 text-emerald-300 border-emerald-800/40";
    if (s.includes("techcrunch")) return "bg-green-950/40 text-green-300 border-green-800/40";
    return "bg-surface-container-high text-on-surface-variant border-outline-variant/30";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-container-lowest">
      {/* Top Banner */}
      <div className="border-b border-outline-variant/30 bg-surface-container-low px-space-md py-space-sm sm:px-space-lg sm:py-space-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-on-surface">
                Founder Bytes
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TinyMonitor Active
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-outline">
              Curated intelligence digest and recurring monitoring for founders & operators.
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/30">
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "feed"
                    ? "bg-surface-container-highest text-on-surface shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
                type="button"
              >
                Intelligence Feed
              </button>
              <button
                onClick={() => setActiveTab("monitors")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "monitors"
                    ? "bg-surface-container-highest text-on-surface shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
                type="button"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>TinyMonitors ({monitors.length || 4})</span>
              </button>
            </div>

            {activeTab === "feed" && (
              <button
                onClick={() => fetchBytes(true)}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 transition-colors disabled:opacity-50"
                title="Sync live web intelligence via TinyFish Search"
                type="button"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-outline"}`} />
                <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Live Web Sync"}</span>
              </button>
            )}

            {activeTab === "monitors" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-xs"
                type="button"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subscription</span>
              </button>
            )}
          </div>
        </div>

        {/* FEED FILTERS (Visible on Feed tab) */}
        {activeTab === "feed" && (
          <div className="max-w-6xl mx-auto mt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30"
                    }`}
                    type="button"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, tech, founders..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container text-on-surface rounded-lg border border-outline-variant/40 focus:outline-hidden focus:border-primary placeholder:text-outline/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: FEED CARDS */}
      {activeTab === "feed" && (
        <div className="max-w-6xl mx-auto w-full px-space-md py-space-md sm:px-space-lg flex-1">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-outline">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm">Synthesizing intelligence bytes...</p>
            </div>
          ) : feedError ? (
            <div className="py-12 text-center text-sm text-error bg-error-container/10 border border-error/20 rounded-xl p-4">
              {feedError}
            </div>
          ) : bytes.length === 0 ? (
            <div className="py-20 text-center text-outline">
              <p className="text-sm font-medium">No intelligence bytes match your current filter.</p>
              <p className="text-xs mt-1">Try selecting &apos;All&apos; or clearing your search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bytes.map((byte) => {
                const isSaved = savedByteIds.has(byte.id);
                return (
                  <article
                    key={byte.id}
                    className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs hover:shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Card Meta Top: Source & Timestamps */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-mono border font-medium ${getSourceBadgeColor(
                              byte.source
                            )}`}
                          >
                            {byte.source}
                          </span>
                          {byte.author && (
                            <span className="text-[11px] text-outline font-medium">
                              by {byte.author}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-outline">
                          <span className="flex items-center gap-1" title={`Published on ${byte.publishedAt}`}>
                            <Calendar className="w-3 h-3" />
                            {byte.publishedAt}
                          </span>
                          <span className="text-outline/40">•</span>
                          <span className="flex items-center gap-1" title={`Retrieved at ${byte.retrievedAt}`}>
                            <Clock className="w-3 h-3" />
                            Verified
                          </span>
                        </div>
                      </div>

                      {/* Headline */}
                      <h2 className="text-sm sm:text-base font-semibold text-on-surface leading-snug tracking-tight">
                        {byte.title}
                      </h2>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {byte.summary}
                      </p>

                      {/* "Why It Matters" Callout Block */}
                      <div className="p-3 rounded-lg bg-surface-container border-l-2 border-primary text-xs text-on-surface leading-relaxed flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-primary mr-1">Why it matters:</span>
                          <span>{byte.whyItMatters}</span>
                        </div>
                      </div>

                      {/* Related Entities Pills */}
                      {byte.relatedEntities && byte.relatedEntities.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <Tag className="w-3 h-3 text-outline shrink-0" />
                          {byte.relatedEntities.map((entity, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono border border-outline-variant/20"
                            >
                              {entity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                      <a
                        href={byte.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Read original</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      <button
                        onClick={() => onSaveByte && onSaveByte(byte)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                          isSaved
                            ? "bg-primary/10 text-primary border-primary/30 font-medium"
                            : "bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30"
                        }`}
                        type="button"
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-outline" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: TINYMONITORS MANAGEMENT */}
      {activeTab === "monitors" && (
        <div className="max-w-6xl mx-auto w-full px-space-md py-space-md sm:px-space-lg flex-1 space-y-6">
          {/* Notification Banner */}
          {monitorsNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{monitorsNotice}</span>
            </div>
          )}

          {/* Wallet Balance & Cost Awareness Banner */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  TinyMonitor Subscription Infrastructure
                </h3>
              </div>
              <p className="text-xs text-outline leading-relaxed max-w-2xl">
                TinyMonitor checks repeatedly query search indices or fetch URLs for diffs. Checks are billed against your TinyFish account balance. We enforce strict schedule intervals (daily cron, 24h recency) to preserve credits.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center p-2.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 font-mono text-xs">
              <span className="text-outline">Wallet:</span>
              <span className="text-emerald-400 font-bold">$17.00 Available</span>
            </div>
          </div>

          {/* Monitors List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
                Active Subscriptions ({monitors.length})
              </h3>
              <span className="text-xs text-outline">
                Webhook: <code className="font-mono text-[11px] text-primary">/api/webhooks/tinyfish-monitor</code>
              </span>
            </div>

            {isLoadingMonitors ? (
              <div className="py-12 flex justify-center items-center text-outline">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : monitors.length === 0 ? (
              <div className="p-8 text-center text-outline bg-surface-container rounded-xl">
                No active monitors configured. Click &quot;Add Subscription&quot; to monitor a topic or page.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monitors.map((mon) => {
                  const isRunning = runningMonitorId === mon.id;
                  const isTopic = mon.type === "search";

                  return (
                    <div
                      key={mon.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                              isTopic
                                ? "bg-sky-950/40 text-sky-300 border-sky-800/40"
                                : "bg-purple-950/40 text-purple-300 border-purple-800/40"
                            }`}
                          >
                            {isTopic ? "TOPIC MONITOR" : "PAGE MONITOR"}
                          </span>

                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                              mon.status === "active"
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                                : "bg-surface-container text-outline border border-outline-variant/30"
                            }`}
                          >
                            {mon.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-on-surface">
                          {mon.name}
                        </h4>

                        <div className="p-2 rounded bg-surface-container text-xs font-mono text-outline break-all">
                          {isTopic ? (
                            <span>Query: &ldquo;{mon.config.query}&rdquo;</span>
                          ) : (
                            <span>URL: {mon.config.url}</span>
                          )}
                        </div>

                        {mon.purpose && (
                          <p className="text-xs text-outline line-clamp-2">
                            {mon.purpose}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-outline font-mono pt-1">
                          <span>Schedule: {mon.schedule_cron}</span>
                          <span>•</span>
                          <span>
                            Last run:{" "}
                            {mon.last_run_at
                              ? new Date(mon.last_run_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                        <button
                          onClick={() => handleRunNow(mon.id)}
                          disabled={isRunning}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 transition-colors disabled:opacity-50"
                          title="Trigger check immediately"
                          type="button"
                        >
                          <Play className={`w-3 h-3 ${isRunning ? "animate-spin text-primary" : "text-emerald-400"}`} />
                          <span>{isRunning ? "Checking..." : "Check Now"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(mon)}
                            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                            title={mon.status === "active" ? "Pause subscription" : "Resume subscription"}
                            type="button"
                          >
                            {mon.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDeleteMonitor(mon.id)}
                            className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-colors"
                            title="Delete monitor"
                            type="button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD MONITOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-low rounded-2xl border border-outline-variant/40 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-on-surface">
                  Subscribe to TinyMonitor
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMonitor} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Monitor Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMonType("search")}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors ${
                      newMonType === "search"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-container border-outline-variant/30 text-outline"
                    }`}
                  >
                    <div className="font-semibold">Topic Monitor (Search)</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Track newly indexed URLs for keywords</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMonType("fetch")}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors ${
                      newMonType === "fetch"
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-container border-outline-variant/30 text-outline"
                    }`}
                  >
                    <div className="font-semibold">Page Monitor (Fetch)</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Monitor specific URL for content diffs</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Subscription Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Agent Funding or YC Founder Essays"
                  value={newMonName}
                  onChange={(e) => setNewMonName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-container text-on-surface rounded-lg border border-outline-variant/40 focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  {newMonType === "search" ? "Search Query" : "Public URL to Monitor"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newMonType === "search"
                      ? "e.g. AI startup seed funding rounds 2025"
                      : "https://www.ycombinator.com/blog"
                  }
                  value={newMonQueryOrUrl}
                  onChange={(e) => setNewMonQueryOrUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-container text-on-surface rounded-lg border border-outline-variant/40 focus:outline-hidden focus:border-primary"
                />
                <p className="text-[10px] text-outline mt-1">
                  {newMonType === "search"
                    ? "Narrow queries prevent irrelevant result noise and conserve credits."
                    : "Must be a public, unauthenticated webpage."}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Purpose / Condition (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what meaningful changes or events to surface..."
                  value={newMonPurpose}
                  onChange={(e) => setNewMonPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-surface-container text-on-surface rounded-lg border border-outline-variant/40 focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-[11px] text-outline flex items-center justify-between">
                <span>Default Schedule: Daily (0 8 * * *)</span>
                <span className="font-mono text-emerald-400">Billable per check</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMon}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmittingMon ? "Creating..." : "Create Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
