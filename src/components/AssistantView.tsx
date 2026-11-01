"use client";

import React, { useState } from "react";
import {
  Send,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Calendar,
  AlertTriangle,
  Compass,
} from "lucide-react";
import type { AssistantMessage, UserProfile } from "@/lib/client/workspaceState";

interface AssistantViewProps {
  messages: AssistantMessage[];
  onSendMessage: (text: string) => void;
  onExecuteActionProposal: (
    msgId: string,
    action: { type: "create_task" | "save_insight" | "run_research"; payload: Record<string, unknown> }
  ) => void;
  profile: UserProfile | null;
  onRunResearch: (prompt: string) => void;
}

export function AssistantView({
  messages,
  onSendMessage,
  onExecuteActionProposal,
  profile,
  onRunResearch,
}: AssistantViewProps) {
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const starterPrompts = [
    "What are the top 3 regulatory risks for beverage packaging in the EU this quarter?",
    "Prepare a brief on sustainable kraft box manufacturers near Bengaluru.",
    "Draft a follow-up task to audit our supplier certifications.",
  ];

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 flex flex-col h-[75vh] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-space-lg py-3 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline-sm text-sm text-on-surface font-semibold leading-none">
              OmniDesk Personal Assistant
            </h3>
            <span className="text-[11px] font-mono-sm text-outline mt-0.5 block">
              Grounded in {profile?.name || "your"} profile ({profile?.role || "Operator"})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono-sm text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Human-gated actions</span>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="my-auto text-center flex flex-col items-center gap-3 max-w-md mx-auto py-8">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-headline-sm text-sm text-on-surface font-medium">
              Hello {profile?.name || "there"}, how can I assist your research today?
            </h4>
            <p className="text-xs text-outline leading-relaxed">
              I can help you analyze intelligence signals, draft RFQs, compare options, or schedule follow-up actions with human authorization.
            </p>
            <div className="flex flex-col gap-1.5 w-full pt-2">
              <span className="text-[10px] font-mono-sm text-outline uppercase tracking-wider text-left">
                Suggested prompts:
              </span>
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(p)}
                  className="text-left font-body-sm text-[12px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface p-2.5 rounded border border-outline-variant/30 transition leading-snug"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    isUser
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container text-primary border border-outline-variant/40"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-lg text-xs leading-relaxed flex flex-col gap-2 font-body-sm ${
                    isUser
                      ? "bg-primary-container/20 text-on-surface border border-primary-container/40"
                      : "bg-surface-container text-on-surface border border-outline-variant/30"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Action Proposal Card (Human Approval Gate) */}
                  {msg.actionProposal && msg.actionProposal.status === "proposed" && (
                    <div className="mt-2 p-2.5 bg-surface-container-low rounded border border-tertiary/30 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 font-mono-sm text-[11px] text-tertiary">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="font-medium">Action Authorization Required</span>
                      </div>
                      <p className="text-[11px] text-outline font-mono-sm">
                        {msg.actionProposal.type === "create_task"
                          ? `Proposal: Create Task "${msg.actionProposal.payload.title}"`
                          : msg.actionProposal.type === "save_insight"
                          ? `Proposal: Save Insight "${msg.actionProposal.payload.title}"`
                          : `Proposal: Trigger Web Research for "${msg.actionProposal.payload.prompt}"`}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onExecuteActionProposal(msg.id, msg.actionProposal!)}
                          className="px-2.5 py-1 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 rounded font-mono-sm text-[11px] font-medium transition"
                        >
                          Approve Action
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Dismiss
                            msg.actionProposal!.status = "dismissed";
                          }}
                          className="px-2 py-1 text-outline hover:text-on-surface text-[11px] font-mono-sm transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.actionProposal && msg.actionProposal.status === "approved" && (
                    <div className="flex items-center gap-1 text-[11px] font-mono-sm text-secondary bg-secondary/10 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Action authorized and completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-surface-container border-t border-outline-variant/30 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PA to investigate, draft actions, or synthesize..."
          className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded px-3 py-2 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-primary-container hover:bg-[#ff771a] disabled:opacity-40 text-white rounded transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
