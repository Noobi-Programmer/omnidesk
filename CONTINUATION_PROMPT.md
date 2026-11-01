# OmniDesk — Continuation & Handoff Prompt

> **Purpose:** If the previous Antigravity session, model token context, or credits finish/cut off, this document serves as the instant, zero-friction resumption manual. Any new agent session (Antigravity, Claude Code, OpenCode, or OmniRush) must read this file first and immediately continue execution without repeating finished work or asking redundant questions.

---

## 1. Project Identity & Critical Context
* **Project Name:** OmniDesk — The AI Chief of Staff
* **Team:** Team Thambiis (Swim with TinyFish Hackathon, Scaler School of Technology)
* **Core Value:** Action-oriented research engine. One request -> Understand -> Research -> Analyze -> Decide -> Act (with human approval).
* **Repository:** `https://github.com/Noobi-Programmer/omnidesk.git` (branch: `main`)
* **Local Working Directory:** `c:\Users\abini\Projects\projects\Swim with Tinyfish` and mirror `C:\Users\abini\Projects\Tinyfish`
* **Budget & Constraints:** ₹0 budget (free tiers only). Server-side secrets only. No external actions without human approval.

---

## 2. Requirements from the User (What We Need)
1. **Google Gemini API Key (Free tier):**
   * Obtain from [Google AI Studio](https://aistudio.google.com/apikey).
   * Place in `.env.local`: `GEMINI_API_KEY=your_key_here`.
2. **TinyFish API Key:**
   * User has key: `sk-tinyfish-S3SkZxG1hYvwNwsI6oNS5nALc5mQyp2D` (already placed in `.env.local` server-side).
3. **Groq API Key (Optional Fallback):**
   * Obtain from [Groq Console](https://console.groq.com) if available (`GROQ_API_KEY=...`).
4. **Environment Check:**
   * Node.js v24+ and pnpm v12+ are installed globally on this Windows machine.

---

## 3. Architecture & Verified Technical Rules
1. **TinyFish SDK:** `@tiny-fish/sdk` v0.11.0.
   * `client.search.query({ query, location: 'IN', domain_type: 'web' })` -> Free (12k/day).
   * `client.fetch.getContents({ urls, format: 'markdown' })` -> Free (1k URLs/day, 10 URLs/batch).
   * `client.agent.stream({ url, goal, output_schema, agent_config })` -> Escalation only ($0.016/step, max 2 runs/task, `max_duration_seconds: 60`).
2. **LLM Provider:**
   * Provider-agnostic `LLMProvider` in `src/server/services/llm/`.
   * Primary: Gemini 2.5 Flash via REST (`src/server/services/llm/gemini.ts`).
   * Fallback: Groq Llama 3.3 70B (`src/server/services/llm/groq.ts`).
   * Offline / Testing: `MockResearchEngine` (`DEMO_MODE=1` or missing keys) emits identical SSE sequence with deterministic 3-supplier comparison.
3. **Streaming Protocol:**
   * Single Route: `POST /api/research` returns `text/event-stream`.
   * SSE Events: `progress`, `plan`, `source`, `agent_live`, `warning`, `result`, `error`.
   * Heartbeat: `: ping\n\n` every 5s.
4. **Security & Approval:**
   * Zero external side-effects. Emails generate `mailto:` or copy-to-clipboard.
   * Untrusted page content is strictly fenced in `<<<UNTRUSTED_DATA>>>` blocks.

---

## 4. Current Build Progress Status

| Module / Component | File Path | Status |
| :--- | :--- | :--- |
| **All Canonical Docs** | `docs/*`, `tasks/*`, `setup/*`, `README.md`, `AGENTS.md` | COMPLETE & COMMITTED (`caf6677`) |
| **Tooling & Runtime** | `node`, `pnpm` (12.16.1), `git` | VERIFIED READY |
| **Package Scaffolding** | `package.json`, `tsconfig.json`, `next.config.ts`, Tailwind | COMPLETE & VERIFIED |
| **Shared Contracts** | `src/lib/contracts/index.ts` | COMPLETE & VERIFIED |
| **TinyFish Services** | `src/server/services/tinyfish/{client,search,fetch,agent}.ts` | COMPLETE & VERIFIED |
| **LLM Provider & Prompts**| `src/server/services/llm/*.ts`, `src/server/prompts/*.ts` | COMPLETE & VERIFIED |
| **Mock & Real Engines** | `src/server/mock/engine.ts`, `src/server/orchestrator/engine.ts` | COMPLETE & VERIFIED |
| **API Route Handlers** | `src/app/api/research/route.ts`, `actions/`, `health/` | COMPLETE & VERIFIED |
| **Full CI Merge Gate** | `tsc --noEmit && vitest run && next build` | PASSED (0 errors, 3/3 tests) |
| **Frontend Dashboard** | `src/app/page.tsx`, `src/app/layout.tsx` | WORKING STARTER DASHBOARD |

---

## 5. Exact Next Action for Resuming Agent
1. To start the local server: `pnpm dev` (opens `http://localhost:3000`).
2. To run the full verification gate: `pnpm gate` (runs `typecheck`, `test`, and `build`).
3. To test the health check endpoint: `GET http://localhost:3000/api/health`.
4. Workstream B UI enhancements: Integrate Neel's finalized Stitch/v0 designs into `src/components/` and `src/app/page.tsx`.
5. Keep this document updated after each milestone commit!
