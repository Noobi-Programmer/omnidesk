# OmniDesk — Deep Research & Founder Intelligence

OmniDesk is an intelligent research workspace and recurring intelligence system designed specifically for founders, operators, and decision-makers:
**Live Web Discovery → Clean Markdown Extraction → Grounded Claim Verification → Executive Synthesis.**

Built by **Team Thambiis** for **Swim with TinyFish** at Scaler School of Technology.
Live web intelligence is powered by **TinyFish** (Search, Fetch, and TinyMonitor APIs) via official server-side SDK and REST integrations.

---

## The Two Product Pillars

### Pillar A: Deep Research (One-Time Deep Investigations)
An intelligent research workspace that investigates complex questions across multiple websites and produces evidence-backed, cited reports.
- **Decomposition**: Formulates targeted subqueries from natural language prompts.
- **Live Discovery**: Leverages **TinyFish Search** across primary web sources.
- **Clean Extraction**: Retrieves clean page content via **TinyFish Fetch** (no HTML boilerplate).
- **Forensic Claim Verification**: Grounded in verbatim quotes; preserves missing facts as `"Not found"`.
- **Comprehensive Executive Report**: Structured into 9 canonical sections (Executive Summary, Methodology, Key Findings, Detailed Analysis with inline `[1]` citations, Identified Entities, Quantitative Evidence, Missing Disclosures, and Strategic Implications).
- **Interactive Visualizations**: Comparative matrix, feature grid, and evidence score confidence meters.
- **Commercial Action Drafts**: Generates supplier/partner outreach emails with `mailto:` protocols and follow-up tasks with zero automated side-effects.

### Pillar B: Founder Bytes (Recurring Web Intelligence & TinyMonitor)
A curated intelligence digest and recurring monitoring infrastructure for high-signal business developments.
- **High-Signal Sources**: Curated feed spanning Y Combinator, Reuters, X / Twitter founder commentary, and top tech publications.
- **Editorial Card Layout**: Headline, source badge, author, published date, retrieval timestamp, summary, **"Why it matters"** highlight block, and related entities.
- **TinyMonitor Infrastructure**:
  - **Topic Monitors (`type: "search"`)**: Repeatedly queries search indices with recency windows (24h) and detects new URLs.
  - **Page Monitors (`type: "fetch"`)**: Monitors specific public URLs (e.g. YC blog) for meaningful content changes.
  - **Server-Side REST Management**: Create, list, pause, resume, trigger immediate check (`/runs`), and delete subscriptions.
  - **Secure Webhook Ingestion (`POST /api/webhooks/tinyfish-monitor`)**: Deduplicates incoming runs, validates publishers against the allowed Source Registry, enriches candidates via TinyFish Fetch, and automatically adds new bytes to the feed.
  - **Wallet & Cost Awareness**: Real-time balance display and budget discipline (daily schedules, narrow queries) to prevent runaway billing.

---

## Technical Architecture & Routes

```
OmniDesk Architecture:
├─ Pillar A (Deep Research): TinyFish Search → TinyFish Fetch → Grounding → Deep Report & Matrix
└─ Pillar B (Founder Bytes): TinyMonitor → Webhook Ingestion → Source Registry → Live Feed
```

### Application Routes
- `/`: Interactive workspace with tab navigation (`Deep Research`, `Founder Bytes`, `History`, `Saved`).
- `POST /api/research`: Streaming SSE endpoint for deep research investigations.
- `GET /api/bytes`: Filtered founder intelligence feed with live sync support.
- `GET /api/monitors`: List active TinyMonitor subscriptions.
- `POST /api/monitors`: Create a new topic or page monitor.
- `PATCH /api/monitors/[id]`: Pause or resume monitor subscriptions.
- `POST /api/monitors/[id]/runs`: Trigger an immediate check on demand.
- `DELETE /api/monitors/[id]`: Delete a monitor subscription.
- `POST /api/webhooks/tinyfish-monitor`: Ingest scheduled monitor webhook events.
- `POST /api/actions/[id]/decision`: Human approval decision gate for action drafts.
- `GET /api/health`: Health and telemetry endpoint.

---

## Quality & Verification

- **TypeScript Strict Mode**: Zero `any` in exported signatures; strict contract definitions in `src/lib/contracts/`.
- **Test Suite**: 34 unit, contract, and correctness tests passing across 4 test suites:
  ```bash
  pnpm test
  # ✓ tests/contracts.test.ts (3 tests)
  # ✓ tests/correctness.test.ts (8 tests)
  # ✓ tests/founder_bytes_and_monitors.test.ts (9 tests)
  # ✓ tests/ui_and_hard_constraints.test.ts (14 tests)
  ```
- **Typecheck & Production Build**:
  ```bash
  pnpm typecheck   # tsc --noEmit (0 errors)
  pnpm build       # next build (production build passes)
  ```

---

## Team & Hackathon Submission

- **Team**: Team Thambiis (Swim with TinyFish, Scaler School of Technology)
- **Repository**: `https://github.com/Noobi-Programmer/omnidesk.git` (branch `main`)
