import type { ResearchResponse, ResearchHistoryItem } from "@/lib/contracts";

const STORAGE_KEY = "omnidesk_research_history_v1";
const MAX_HISTORY_ITEMS = 20;

export function getStoredHistory(): ResearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return [];
}

export function saveToHistory(response: ResearchResponse): ResearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredHistory();
    const newItem: ResearchHistoryItem = {
      id: response.taskId,
      query: response.request.prompt,
      createdAt: response.createdAt || new Date().toISOString(),
      response,
    };

    // Filter out if duplicate taskId exists
    const filtered = current.filter((item) => item.id !== response.taskId);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteFromHistory(id: string): ResearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
