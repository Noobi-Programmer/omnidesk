# CONTINUATION.md — OmniDesk V3 Engineering State & Handover

This file is maintained for seamless continuation across Antigravity agents and sessions. Any agent picking up this workspace can resume immediately without lost context.

---

## 1. Project Identity & Architecture

**OmniDesk — Deep Research & Founder Intelligence Workspace**
- **Repository (GitHub):** `https://github.com/Noobi-Programmer/omnidesk.git` (branch: `main`)
- **Primary Workspace:** `c:\Users\abini\Projects\projects\Swim with Tinyfish`
- **Synchronized Local Mirror:** `C:\Users\abini\Projects\Tinyfish`
- **Core Product Pillars:**
  1. **Pillar A: Deep Research**
     - Powered exclusively by TinyFish Search + Fetch (no Browser/Agent out-of-scope escalation).
     - Multi-intent adaptive planning (8 intents: `general`, `startup`, `competitor`, `supplier`, `market`, `technology`, `company`, `product`).
     - Genuine claim extraction with exact verbatim quote grounding. Missing values are honestly preserved as `null` with `status: "not_found"` (no fake "ISO / Industry standard" or assumed metrics).
     - Strict constraint boundaries (e.g. `MOQ < 50,000` strictly rejects `50,000`).
     - Up to 12,000 characters prompt support with real-time character counter and client validation.
     - Canonical SSE protocol (`progress`, `plan`, `source`, `warning`, `result`, `error`) with explicit terminal states (`completed`, `failed`, `cancelled`).
  2. **Pillar B: Founder Bytes & TinyMonitor**
     - Live intelligence ingestion via TinyFish Monitors and manual "Run Check Now".
     - Durable persistence layer backed by disk (`data/founder_bytes.json` and `data/monitors.json`).
     - Idempotent webhook delivery handling (`/api/webhooks/tinyfish-monitor`).
     - Accurate source attribution (resolves through registry, site name, and clean hostname; never defaults unknown domains to "TechCrunch").
     - Publication date truthfulness: unstated dates cleanly display as "Date unstated", never fabricated as today's date.
     - Honest empty state when no monitors have run yet, with a 1-click "Run Monitor Now" call to action.
     - Live monitor badge displays exact count of active subscriptions, or "No Monitors Configured" / "TinyMonitor Inactive" when 0 are active.

---

## 2. Verification Gate Status (All Passing)

- **TypeScript Typecheck:** `pnpm typecheck` (`tsc --noEmit`) → **0 errors**
- **Unit & Integration Test Suite:** `pnpm test` (`vitest run --fileParallelism=false`) → **55 passing tests across 5 test suites:**
  1. `tests/v3_correctness.test.ts` (21/21 tests passing) — covers all 21 V3 requirements.
  2. `tests/ui_and_hard_constraints.test.ts` (14/14 tests passing).
  3. `tests/founder_bytes_and_monitors.test.ts` (9/9 tests passing).
  4. `tests/correctness.test.ts` (8/8 tests passing).
  5. `tests/contracts.test.ts` (3/3 tests passing).
- **Production Build:** `pnpm build` (`next build`) → **Compiled in ~4s, all 4 static routes and 6 dynamic API routes generated cleanly**.
- **Complete Verification Command:** `pnpm gate` passes end-to-end.

---

## 3. Key Files & Responsibilities

| File Path | Description |
|---|---|
| `src/server/services/storage/index.ts` | Durable file-backed JSON storage for Founder Bytes, TinyMonitors, and processed webhook runs. |
| `src/server/services/bytes/ingest.ts` | Shared ingestion pipeline for monitor runs, webhooks, and live web discovery. Handles deduplication, accurate source naming, and date grounding. |
| `src/server/services/bytes/index.ts` | Founder Bytes feed service. Reads exclusively from durable storage. Curated sample stories moved to `tests/fixtures/sample_bytes.ts`. |
| `src/server/services/tinyfish/monitors.ts` | TinyMonitor CRUD, run execution, and fallback management. Local IDs (`mon-seed-*`) update local durable storage; live remote monitors sync with TinyFish API. |
| `src/server/services/tinyfish/search.ts` | Search integration. Context-aware filtering: permits editorial domains (Reuters, TechCrunch, YC, Bloomberg, Forbes) for general research, while rejecting courier services and directories for manufacturing qualification. |
| `src/server/orchestrator/engine.ts` | Multi-intent research execution engine. Emits canonical SSE events (`progress`, `plan`, `source`, `warning`, `result`, `error`). Unpacks envelopes cleanly. |
| `src/server/orchestrator/qualification.ts` | Strict supplier qualification and constraint compliance (`evaluateMoqCompliance`, `parsePromptConstraints`). Strict less-than evaluation. |
| `src/server/orchestrator/extraction.ts` | Grounded fact extraction with verbatim quotes. Zero hardcoded filler values. |
| `src/server/prompts/plan.ts` | `detectIntentFromPrompt` across 8 research intents and `generateAdaptivePlan`. |
| `src/app/page.tsx` | Main workspace page. SSE consumer supporting canonical events, 12k char prompts, cancellation, and terminal states. |
| `src/components/ResearchComposer.tsx` | Prompt composer with character counter (`X / 12,000`), over-budget validation warning, and 4 diverse research presets. |
| `src/components/ResearchProgress.tsx` | Research progress bar with explicit visual differentiation for `failed` (red), `cancelled` (amber), and `completed` (green). |
| `src/components/FounderBytesView.tsx` | Feed & Monitor management UI. Accurate TinyMonitor active badge count, honest empty feed state with "Run Monitor Now" CTA, and unstated publication date handling. |
| `tests/v3_correctness.test.ts` | 21-criterion acceptance test suite verifying all V3 production corrections. |
| `tests/fixtures/sample_bytes.ts` | Isolated sample stories for offline test fixtures. |

---

## 4. Environment Variables (`.env.local`)

- `TINYFISH_API_KEY`: Server-side API key for TinyFish Search, Fetch, and Monitors.
- `GEMINI_API_KEY`: Server-side API key for Google Gemini model inference (free tier via Google AI Studio).
- `DEMO_MODE`: Set to `1` for offline mock engine mode; `0` (or absent) for live TinyFish execution.

---

## 5. Quick Commands

```bash
# Run local dev server
pnpm dev

# Run TypeScript checks
pnpm typecheck

# Run full test suite
pnpm test

# Run Next.js production build
pnpm build

# Run full CI/CD verification gate
pnpm gate

# Sync with git remote
git pull origin main
git push origin main
```
