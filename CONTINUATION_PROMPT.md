# OmniDesk — Continuation & Handoff Prompt

> **Purpose:** If the previous Antigravity session, model token context, or credits finish/cut off, this document serves as the instant, zero-friction resumption manual. Any new agent session (Antigravity, Claude Code, OpenCode, or OmniRush) must read this file first and immediately continue execution without repeating finished work or asking redundant questions.

---

## 1. Project Identity & Architecture
* **Project Name:** OmniDesk — Deep Research & Founder Intelligence
* **Team:** Team Thambiis (Swim with TinyFish Hackathon, Scaler School of Technology)
* **Core Product Pillars:**
  1. **Pillar A: Deep Research (One-Time Investigations):**
     * Multi-query planning & decomposition.
     * TinyFish Search + TinyFish Fetch (zero Agent/Browser dependencies).
     * Forensic claim verification with verbatim quotes.
     * 9-section structured Deep Research Report + interactive Comparison Matrix + Evidence Score meters + Commercial Action Drafts.
  2. **Pillar B: Founder Bytes (Recurring Web Intelligence & TinyMonitor):**
     * High-signal curated feed (YC, Reuters, X/Twitter, TechCrunch, Stratechery).
     * Editorial card layout with "Why it matters" highlight blocks.
     * Server-side REST client for **TinyMonitor** (`https://agent.tinyfish.ai/v1/monitors`): Topic Monitors (`type: "search"`) and Page Monitors (`type: "fetch"`).
     * Webhook ingestion endpoint: `POST /api/webhooks/tinyfish-monitor`.
     * Pre-configured seed subscriptions + user subscription management UI (check now, pause, resume, create, delete) with wallet awareness ($17.00 balance display).
* **Navigation:** Left sidebar with 5 focused items:
  1. `+ New Research`
  2. `Deep Research` (Pillar A)
  3. `Founder Bytes` (Pillar B)
  4. `History`
  5. `Saved` (persisted to localStorage)
  *(Strictly no Inbox, Tasks, Approval Dock, or browser automation).*
* **Repository:** `https://github.com/Noobi-Programmer/omnidesk.git` (branch: `main`)
* **Local Working Directory:** `c:\Users\abini\Projects\projects\Swim with Tinyfish` and mirror `C:\Users\abini\Projects\Tinyfish`

---

## 2. Official Hackathon Judging Criteria (35% TinyFish)
1. **Use of TinyFish (35%):**
   * Deep Research: TinyFish Search + Fetch for multi-source investigation and clean Markdown extraction.
   * Founder Bytes: TinyFish Monitor API (TinyMonitor) for recurring web change monitoring + Search/Fetch enrichment.
   * Total 3 core TinyFish capabilities in production.
2. **Problem Relevance and Impact (25%):**
   * Eliminates hallucinated business research and ad-driven noise; delivers cited, fact-checked reports and high-signal founder intelligence.
3. **Technical Execution & Working Demo (25%):**
   * 100% strict TypeScript types, 34 automated tests passing across 4 suites, Next.js 15 production build passing with 0 errors.
4. **Presentation (15%):**
   * High-polish executive dashboard with comparison tables, evidence score meters, citation pills, and clean dark/light themes.

---

## 3. Current Implementation Status

| Feature / Component | Status | Details |
| --- | --- | --- |
| `src/lib/contracts/index.ts` | Complete | Types for Deep Research, Reports, Citations, Founder Bytes, TinyMonitors, and Source Registry. |
| `src/server/orchestrator/` | Complete | Multi-query decomposition, Search + Fetch execution, 9-section report synthesis. |
| `src/server/mock/engine.ts` | Complete | Deterministic offline engine producing full report with citations. |
| `src/server/services/tinyfish/monitors.ts` | Complete | REST client for TinyMonitor (list, create, update status, run now, delete) with fallback store. |
| `src/server/services/bytes/` | Complete | Curated intelligence feed, deduplication, search/category filtering, and allowed Source Registry. |
| `src/app/api/monitors/` | Complete | Endpoints for monitor CRUD and instant on-demand runs (`/runs`). |
| `src/app/api/webhooks/tinyfish-monitor/` | Complete | Validates monitor ID, deduplicates runs, fetches article content via Fetch, and adds new Founder Bytes. |
| `src/app/api/bytes/` | Complete | Endpoint for filtered founder intelligence with live web sync. |
| `src/components/Sidebar.tsx` | Complete | Focused 4-item navigation (`research`, `bytes`, `history`, `saved`) + New Research button. |
| `src/components/FounderBytesView.tsx` | Complete | Feed view with category pills, search, "Why it matters" blocks, and TinyMonitor subscription manager. |
| `src/components/DeepReportView.tsx` | Complete | Full 9-section deep report, citations, entity profiles, statistics table, and MD/JSON export. |
| `src/components/SavedView.tsx` | Complete | Saved reports and bookmarked bytes management with localStorage sync. |
| `src/components/HistoryView.tsx` | Complete | Past research query history, search, and reload. |
| `src/app/page.tsx` | Complete | Central workspace orchestrating tabs, research runner, drawer, and modals. |

---

## 4. Verification Commands

```bash
# 1. Typecheck
pnpm typecheck

# 2. Automated Test Suite (34 tests)
pnpm test

# 3. Production Build
pnpm build
```

---

## 5. Next Steps for Incoming Agent
1. If making any frontend polish changes, run `pnpm typecheck` and `pnpm test` immediately.
2. Ensure git commits follow conventional commits (`feat:`, `fix:`, `docs:`).
3. Push to `origin main` and synchronize local mirror `C:\Users\abini\Projects\Tinyfish`.
