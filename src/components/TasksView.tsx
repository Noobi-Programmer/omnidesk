"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Trash2, Plus, Calendar, AlertCircle } from "lucide-react";
import type { UserTask } from "@/lib/client/workspaceState";

interface TasksViewProps {
  tasks: UserTask[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (title: string, notes?: string, dueHint?: string) => void;
}

export function TasksView({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}: TasksViewProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newNotes.trim() || undefined, "in 3 business days");
    setNewTitle("");
    setNewNotes("");
    setIsAdding(false);
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="bg-surface-container-low rounded border border-outline-variant/30 p-space-lg flex flex-col gap-space-md shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
            Tasks &amp; Follow-ups ({tasks.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1 bg-primary-container hover:bg-[#ff771a] text-white rounded font-label-sm text-xs flex items-center gap-1 transition font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New task</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-surface-container p-3 rounded border border-primary/30 flex flex-col gap-2 animate-in fade-in"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Task title (e.g. Call Envases sales desk for sample batch)..."
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-3 py-1.5 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
          />
          <input
            type="text"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes or contact reference (optional)..."
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded px-3 py-1.5 font-body-sm text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary transition"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-outline hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 bg-primary-container text-on-primary-container rounded text-xs font-medium"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="py-12 text-center text-outline font-body-sm flex flex-col items-center gap-2">
          <Clock className="w-8 h-8 opacity-40 mb-1" />
          <p className="font-medium text-on-surface-variant">No pending tasks</p>
          <p className="text-xs text-outline max-w-sm">
            Tasks created from research outcomes, enquiry drafts, or intelligence briefings will gather here with human status tracking.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingTasks.map((t) => (
            <div
              key={t.id}
              className="bg-surface-container rounded border border-outline-variant/30 p-3 flex items-start justify-between gap-3 group hover:border-outline-variant/60 transition"
            >
              <div className="flex items-start gap-2.5 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(t.id)}
                  className="w-4 h-4 rounded border border-outline-variant/60 hover:border-secondary mt-0.5 flex items-center justify-center transition shrink-0"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-body-sm text-xs text-on-surface font-medium">
                    {t.title}
                  </span>
                  {t.notes && (
                    <p className="text-[11px] text-on-surface-variant whitespace-pre-line leading-relaxed">
                      {t.notes}
                    </p>
                  )}
                  {t.dueHint && (
                    <span className="font-mono-sm text-[10px] text-tertiary mt-0.5">
                      Target: {t.dueHint}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-outline hover:text-error transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {completedTasks.length > 0 && (
            <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-1.5">
              <span className="font-mono-sm text-[11px] text-outline uppercase tracking-wider">
                Completed ({completedTasks.length})
              </span>
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-surface-container/60 rounded border border-outline-variant/20 p-2.5 flex items-center justify-between gap-2 text-outline"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id)}
                      className="w-4 h-4 rounded bg-secondary/20 border border-secondary text-secondary flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="line-through text-xs">{t.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1 hover:text-error"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
