import fs from "node:fs";
import path from "node:path";
import type { FounderByte, TinyMonitor } from "@/lib/contracts";

const DATA_DIR = path.resolve(process.cwd(), "data");
const BYTES_FILE = path.join(DATA_DIR, "founder_bytes.json");
const MONITORS_FILE = path.join(DATA_DIR, "monitors.json");
const RUNS_FILE = path.join(DATA_DIR, "processed_runs.json");

// In-memory fallback caches for environments where disk writes are restricted
let memBytes: FounderByte[] = [];
let memMonitors: TinyMonitor[] = [];
let memProcessedRuns: Set<string> = new Set();
let isInitialized = false;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Disk write might fail in read-only sandboxes; memory fallback handles this
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch {
    // Ignore read errors
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    ensureDataDir();
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
    return true;
  } catch {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch {
      return false;
    }
  }
}

export function initStorage(): void {
  if (isInitialized) return;
  ensureDataDir();
  memBytes = readJsonFile<FounderByte[]>(BYTES_FILE, []);
  memMonitors = readJsonFile<TinyMonitor[]>(MONITORS_FILE, []);
  const runArray = readJsonFile<string[]>(RUNS_FILE, []);
  memProcessedRuns = new Set(runArray);
  isInitialized = true;
}

// ----------------------------------------------------
// FOUNDER BYTES DURABLE STORAGE
// ----------------------------------------------------

export function getStoredFounderBytes(): FounderByte[] {
  initStorage();
  const diskData = readJsonFile<FounderByte[] | null>(BYTES_FILE, null);
  if (diskData !== null) {
    memBytes = diskData;
  }
  return [...memBytes];
}

export function saveStoredFounderBytes(bytes: FounderByte[]): void {
  initStorage();
  memBytes = [...bytes];
  writeJsonFile(BYTES_FILE, memBytes);
}

export function addStoredFounderByte(byte: FounderByte): boolean {
  initStorage();
  const current = getStoredFounderBytes();
  const normalizedUrl = byte.url.trim().toLowerCase().replace(/\/+$/, "");

  // Reject duplicates by normalized URL or ID
  const isDuplicate = current.some(
    (b) =>
      b.id === byte.id ||
      b.url.trim().toLowerCase().replace(/\/+$/, "") === normalizedUrl
  );

  if (isDuplicate) {
    return false;
  }

  current.unshift(byte);
  saveStoredFounderBytes(current);
  return true;
}

// ----------------------------------------------------
// TINYMONITOR DURABLE STORAGE
// ----------------------------------------------------

export function getStoredMonitors(): TinyMonitor[] {
  initStorage();
  const diskData = readJsonFile<TinyMonitor[] | null>(MONITORS_FILE, null);
  if (diskData !== null) {
    memMonitors = diskData;
  }
  return [...memMonitors];
}

export function saveStoredMonitors(monitors: TinyMonitor[]): void {
  initStorage();
  memMonitors = [...monitors];
  writeJsonFile(MONITORS_FILE, memMonitors);
}

export function addStoredMonitor(monitor: TinyMonitor): void {
  initStorage();
  const current = getStoredMonitors();
  const existingIdx = current.findIndex((m) => m.id === monitor.id);
  if (existingIdx >= 0) {
    current[existingIdx] = monitor;
  } else {
    current.unshift(monitor);
  }
  saveStoredMonitors(current);
}

export function updateStoredMonitor(
  id: string,
  updates: Partial<TinyMonitor>
): TinyMonitor | null {
  initStorage();
  const current = getStoredMonitors();
  const idx = current.findIndex((m) => m.id === id);
  if (idx === -1) return null;

  const updated: TinyMonitor = {
    ...current[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  current[idx] = updated;
  saveStoredMonitors(current);
  return updated;
}

export function deleteStoredMonitor(id: string): boolean {
  initStorage();
  const current = getStoredMonitors();
  const filtered = current.filter((m) => m.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredMonitors(filtered);
  return true;
}

// ----------------------------------------------------
// IDEMPOTENT RUNS STORAGE
// ----------------------------------------------------

export function isRunProcessed(runId: string): boolean {
  initStorage();
  const diskRuns = readJsonFile<string[] | null>(RUNS_FILE, null);
  if (diskRuns !== null) {
    memProcessedRuns = new Set(diskRuns);
  }
  return memProcessedRuns.has(runId);
}

export function markRunProcessed(runId: string): void {
  initStorage();
  memProcessedRuns.add(runId);
  const arr = Array.from(memProcessedRuns).slice(-500); // Bound to last 500
  writeJsonFile(RUNS_FILE, arr);
}

// Helper for testing
export function clearAllStorage(): void {
  memBytes = [];
  memMonitors = [];
  memProcessedRuns.clear();
  try {
    if (fs.existsSync(BYTES_FILE)) fs.unlinkSync(BYTES_FILE);
    if (fs.existsSync(MONITORS_FILE)) fs.unlinkSync(MONITORS_FILE);
    if (fs.existsSync(RUNS_FILE)) fs.unlinkSync(RUNS_FILE);
  } catch {
    // ignore
  }
}
