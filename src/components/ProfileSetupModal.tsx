"use client";

import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, UserCheck, X } from "lucide-react";
import type { UserProfile } from "@/lib/client/workspaceState";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  onClose?: () => void;
  initialProfile?: UserProfile | null;
}

const ROLES = [
  "Founder / CEO",
  "Product Manager",
  "Software Engineer",
  "Researcher / Analyst",
  "Business Owner",
  "Student",
  "Freelancer",
  "Other",
];

const AVAILABLE_TOPICS = [
  "AI & Machine Learning",
  "Startups & Venture",
  "Packaging & Manufacturing",
  "Software & Tech",
  "Market Trends",
  "Competitor Intel",
  "Finance & Sourcing",
  "Product Launches",
];

export function ProfileSetupModal({
  isOpen,
  onComplete,
  onClose,
  initialProfile,
}: ProfileSetupModalProps) {
  const [name, setName] = useState(initialProfile?.name || "Neel");
  const [role, setRole] = useState(initialProfile?.role || "Founder / CEO");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialProfile?.interests && initialProfile.interests.length > 0
      ? initialProfile.interests
      : ["AI & Machine Learning", "Packaging & Manufacturing", "Startups & Venture"]
  );
  const [company, setCompany] = useState(initialProfile?.company || "");
  const [competitors, setCompetitors] = useState(
    initialProfile?.competitors?.join(", ") || ""
  );
  const [goals, setGoals] = useState(initialProfile?.goals || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = () => {
    const comps = competitors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const profile: UserProfile = {
      name: name.trim() || "Operator",
      role,
      interests: selectedTopics.length > 0 ? selectedTopics : ["AI & Machine Learning"],
      company: company.trim() || undefined,
      competitors: comps.length > 0 ? comps : undefined,
      goals: goals.trim() || undefined,
      isOnboarded: true,
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-surface-container rounded-lg border border-outline-variant/60 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-space-lg py-space-md border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-headline-sm text-base text-on-surface font-medium leading-none">
                Workspace Personalization
              </h2>
              <p className="text-[11px] font-mono-sm text-outline mt-1">
                Customize your FounderBrief feed and assistant research context
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono-sm text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 hidden sm:inline">
              30 seconds
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded transition"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-space-lg overflow-y-auto flex flex-col gap-space-md">
          {/* Question 1: Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>1. What should we call you?</span>
              <span className="text-[10px] text-outline uppercase font-mono-sm">Required</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neel"
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-3 py-1.5 font-body-sm text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
            />
          </div>

          {/* Question 2: Role */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>2. What best describes your primary focus?</span>
              <span className="text-[10px] text-outline uppercase font-mono-sm">Required</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ROLES.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-2.5 py-1.5 rounded text-left font-body-sm text-[12px] border transition flex items-center justify-between ${
                      isSelected
                        ? "bg-primary-container/20 border-primary-container text-on-surface font-medium"
                        : "bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="truncate">{r}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Interests */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-on-surface flex items-center justify-between">
              <span>3. What topics matter to your business?</span>
              <span className="text-[10px] text-outline uppercase font-mono-sm">Select 1 or more</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1 rounded font-mono-sm text-[11px] border transition flex items-center gap-1 ${
                      isSelected
                        ? "bg-secondary/15 border-secondary/40 text-secondary font-medium"
                        : "bg-surface-container-low border-outline-variant/30 text-outline hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <Check className="w-3 h-3 text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Expansion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-mono-sm text-primary hover:underline flex items-center gap-1"
            >
              <span>{showAdvanced ? "Hide optional tracking parameters" : "+ Add company & competitor tracking (Optional)"}</span>
            </button>
          </div>

          {/* Advanced / Optional Fields */}
          {showAdvanced && (
            <div className="flex flex-col gap-space-sm pt-2 border-t border-outline-variant/20 animate-in fade-in">
              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] text-outline">
                  Company / Project name (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Global, ColdCraft RTD"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] text-outline">
                  Competitors or companies to track (Comma separated)
                </label>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="e.g. Ardagh, Envases, Ball"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-sm text-[11px] text-outline">
                  Key goal or constraint (Optional)
                </label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Source 250ml slim aluminum cans under 50k MOQ"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-2.5 py-1 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-space-lg py-space-sm bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSave}
            className="text-xs text-outline hover:text-on-surface transition font-medium"
          >
            Skip optional fields
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-space-md py-1.5 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-md text-xs flex items-center gap-1.5 transition shadow-sm font-semibold cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Build My Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
