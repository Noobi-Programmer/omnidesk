export interface UserProfile {
  name: string;
  role: string;
  interests: string[];
  company?: string;
  competitors?: string[];
  goals?: string;
  isOnboarded: boolean;
  theme?: "dark" | "light";
}

export interface FounderBriefItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  category: string;
  relevanceExplanation: string;
  matchedInterests: string[];
  // Deep Brief Details
  deepBrief?: {
    whatHappened: string[];
    whyItMatters: string;
    implications: string[];
    keyTakeaways: string[];
    citations: Array<{ title: string; url: string }>;
  };
}

export interface SavedInsight {
  id: string;
  briefId?: string;
  title: string;
  takeaway: string;
  sourceTitle: string;
  sourceUrl?: string;
  savedAt: string;
  tags: string[];
}

export interface UserTask {
  id: string;
  title: string;
  notes?: string;
  dueHint?: string;
  status: "pending" | "completed";
  createdAt: string;
  originBriefId?: string;
  supplierId?: string;
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  actionProposal?: {
    type: "create_task" | "save_insight" | "run_research";
    payload: Record<string, unknown>;
    status: "proposed" | "approved" | "dismissed";
  };
}

const PROFILE_KEY = "omnidesk_user_profile_v1";
const INSIGHTS_KEY = "omnidesk_saved_insights_v1";
const TASKS_KEY = "omnidesk_tasks_v1";
const CHAT_KEY = "omnidesk_chat_history_v1";

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getStoredInsights(): SavedInsight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INSIGHTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredInsight(insight: Omit<SavedInsight, "id" | "savedAt">): SavedInsight[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getStoredInsights();
    const newItem: SavedInsight = {
      ...insight,
      id: `ins-${Math.random().toString(36).slice(2, 9)}`,
      savedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list.filter((i) => i.title !== insight.title)];
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteStoredInsight(id: string): SavedInsight[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getStoredInsights().filter((i) => i.id !== id);
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function getStoredTasks(): UserTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTask(task: Omit<UserTask, "id" | "createdAt" | "status">): UserTask[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getStoredTasks();
    const newItem: UserTask = {
      ...task,
      id: `task-${Math.random().toString(36).slice(2, 9)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...list];
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function toggleTaskStatus(id: string): UserTask[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getStoredTasks().map((t) =>
      t.id === id ? { ...t, status: t.status === "completed" ? ("pending" as const) : ("completed" as const) } : t
    );
    localStorage.setItem(TASKS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function deleteStoredTask(id: string): UserTask[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getStoredTasks().filter((t) => t.id !== id);
    localStorage.setItem(TASKS_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

export function getStoredChat(): AssistantMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredChat(messages: AssistantMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  } catch {}
}
