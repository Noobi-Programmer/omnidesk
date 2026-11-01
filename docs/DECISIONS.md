# Decision Ledger

Status legend: **VERIFIED** (cited source), **DECISION** (our call, reasoned),
**ASSUMPTION** (unverified — to check before relying on it), **REJECTED** (considered, declined).

| # | Decision | Status | Rationale / Source |
| --- | --- | --- | --- |
| D-01 | Use official `@tiny-fish/sdk` (v0.11.0, npm 2026-10-28) for all TinyFish calls | VERIFIED | docs: "Always use the official SDKs"; registry.npmjs.org/@tiny-fish/sdk |
| D-02 | Cost ladder Search→Fetch→Agent→Browser; Agent only on escalation | VERIFIED pattern | docs.tinyfish.ai/for-coding-agents.md + cookbook use-tinyfish SKILL.md |
| D-03 | Search & Fetch are free-tier (search ≤12k req/day, 30 RPM; fetch 1k URLs/day, 150/min) | VERIFIED | docs.tinyfish.ai/search-api, /fetch-api, tinyfish.ai/pricing |
| D-04 | Agent = $0.016/step, 2 concurrent; Browser = $0.002/min, 5 sessions; new accounts get $8 wallet | VERIFIED | tinyfish.ai/pricing |
| D-05 | Use Agent `/run-sse` only (cancellable, progress, `STREAMING_URL`); never `/run` (uncancellable) | VERIFIED | docs.tinyfish.ai/key-concepts/endpoints |
| D-06 | Bound agent runs with `max_duration_seconds: 120` (not `max_steps`, which is beta-gated) | VERIFIED | endpoints docs mark `max_steps` beta |
| D-07 | TinyFish Research API NOT used in demo (5–20 min latency; $2/$3 per run after 2 free/day; 403 unless enabled) — future "Deep Report" only | VERIFIED + DECISION | docs.tinyfish.ai/research-api/reference |
| D-08 | Datasets API rejected for MVP (beta: 3 runs/rolling 24h) | VERIFIED + REJECTED | mcp-integration rates + datasets notes |
| D-09 | Supplier URLs come from real Search results, never LLM-generated (hallucination control) | VERIFIED pattern | cookbook lego-hunter ("No OpenAI for URL generation") |
| D-10 | One Agent run per site, parallel via `Promise.allSettled`; never multi-site goals | VERIFIED pattern | cookbook SKILL.md + openbox-deals |
| D-11 | Product LLM = Gemini API free tier behind a provider-agnostic `LLMProvider` | VERIFIED free tier exists + DECISION | ai.google.dev/gemini-api/docs/rate-limits (Free tier, RPM/TPM/RPD; page updated 2026-10-28). Exact per-model RPM/RPD: check AI Studio before M1. Groq free tier = fallback, current limits **TO VERIFY** |
| D-12 | Web-chat subscriptions (Claude/GPT/Gemini web) are dev assistants, never product inference | DECISION | user constraint + correctness |
| D-13 | No database in MVP; localStorage `HistoryStore`; Supabase schema reserved (DATABASE_SCHEMA.md) | DECISION | cookbook no-DB pattern; ₹0; time budget |
| D-14 | No auth in MVP (single demo user) | DECISION | scope discipline |
| D-15 | Approvals produce mailto/clipboard only; server cannot send anything; no payments anywhere | DECISION | trust model; hackathon scope |
| D-16 | Build order P0→P1 with P2/P3 as conditional stretches, preferring P3 (agent form-fill) over P2 (Gmail OAuth) when time-limited | DECISION | P3 is ~30–40 min vs P2's 60–90 min OAuth/review risk; swap reasoned in chat handoff |
| D-17 | SSE from `POST /api/research` (single route) rather than task+polling | DECISION | cookbook-proven (openbox-deals, competitor-analysis); no background infra on Vercel Hobby |
| D-18 | Repo `Noobi-Programmer/omnidesk` initialized on `main`; initial commit `688706c` with remote set | VERIFIED | local repo at `C:\Users\abini\Projects\Tinyfish`, remote `https://github.com/Noobi-Programmer/omnidesk.git` |
| D-19 | Gmail API read-only is the only feasible P2 inbox stretch; Meta (WhatsApp/IG) APIs need app review — verify limits before any P2 code | ASSUMPTION (to verify) | developer docs to check: developers.google.com/gmail/api, developers.facebook.com |
| D-20 | pnpm + Next.js (App Router) + TS strict + Tailwind; Vercel Hobby deploy | DECISION | free tier; matches cookbook reference projects |
| D-21 | TinyFish MCP/plugins for our *dev* agents (OpenCode etc.); product uses REST SDK only | VERIFIED + DECISION | docs.tinyfish.ai/mcp-integration |
| D-22 | Prompt-injection defence: fencing + extraction-only prompts + zod schemas + human gate | DECISION | layered defence in SECURITY_AND_APPROVALS.md |
| D-23 | SDK Fetch method is `client.fetch.getContents()`. `highlights` parameter is Beta (SDK schema: returns 403 unless enrolled). Primary extraction uses Markdown + LLM verbatim quote parsing; highlights used opportunistically | VERIFIED | `@tiny-fish/sdk` v0.11.0 `fetchHighlightsParamsSchema` |
| D-24 | Multi-provider LLM abstraction (`LLMProvider`): Google Gemini free tier primary, Groq fallback, `MockResearchEngine` for 100% offline/CI parity | DECISION | eliminates provider rate-limit lock-in, enables zero-cost parallel frontend testing |

---

## Cross-Model Research Evaluation & Synthesis

We systematically compared the architectural research from **Gemini Argon**, **Qwen**, **Z.ai**, and **Kimi**. Below is the rationale resolving every debate:

### 1. Areas of Agreement
- **Core Framework:** Next.js (App Router) with TypeScript (Strict Mode) and Tailwind CSS.
- **TinyFish Role:** Use TinyFish Search for URL discovery, Fetch for page content extraction, and Agent API for live browser automation fallback.
- **Real-Time UX:** Server-Sent Events (SSE) from a single endpoint (`POST /api/research`) streaming live pipeline progress.
- **Trust & Safety:** Zero-trust external actions. The AI proposes, drafts, and prepares; the human reviews, edits, and approves. No autonomous emailing, purchasing, or form submission.
- **Canonical Demo:** A realistic, high-stakes founder request: *"Find 5 reliable packaging suppliers in Bengaluru for a small D2C brand. Compare MOQ, pricing, delivery, credibility, contact. Recommend best 3 and draft enquiry email."*

### 2. Disagreements, Challenges & Resolutions

#### A. Persistence & Database (Supabase vs LocalStorage)
- **Qwen Proposal:** Implement Supabase Postgres with a `research_tasks` table and foreign keys to `auth.users`.
- **Z.ai Proposal:** Zero-database MVP using a typed `HistoryStore` over browser `localStorage` (capped at 20 entries). Document full Supabase schema for future release.
- **Technical Analysis:** In a hackathon demo setting, Supabase requires setting up a remote project, configuring environment variables across local and Vercel environments, managing auth sessions/cookies, and handling database migration scripts. Any connection timeout or RLS misconfiguration breaks the entire live demo. Conversely, `localStorage` provides instant zero-latency reads/writes, zero setup friction, ₹0 cost, and zero external failure modes.
- **Decision:** **Adopt Z.ai's LocalStorage `HistoryStore` for MVP.** The full production Supabase schema is finalized in `docs/DATABASE_SCHEMA.md` with complete SQL migrations and RLS policies ready for P1.

#### B. LLM Inference (Groq vs Gemini vs Mock)
- **Qwen Proposal:** Exclusively use Groq API (Llama 3.3 70B) for sub-second token generation and native JSON mode.
- **Z.ai Proposal:** Use Google Gemini API (free tier from Google AI Studio) as primary, with Groq as fallback, behind an abstract `LLMProvider`.
- **Technical Analysis:** Relying on a single LLM provider exposes the team to sudden rate limit exhaustion (429) during rapid iteration. Furthermore, frontend builders cannot wait for backend LLM tuning.
- **Decision:** **Adopt a provider-agnostic `LLMProvider` interface.** Google Gemini API free tier is the primary provider; Groq is supported as an instant failover; and `MockResearchEngine` emits identical deterministic SSE events with zero API keys or rate limits.

#### C. TinyFish Highlights vs Resilient Markdown Extraction
- **Qwen Proposal:** Base the entire product differentiator on TinyFish Fetch's `highlights` parameter, claiming "if it's not in the highlight, it doesn't exist."
- **SDK Verification:** Direct inspection of `@tiny-fish/sdk` v0.11.0 (`fetchHighlightsParamsSchema`) revealed: `/** Beta: API returns 403 unless enrolled. Markdown only. */`.
- **Technical Analysis:** Relying solely on `highlights` is a fatal risk: if the hackathon API key is not enrolled in the beta, every fetch request fails with HTTP 403 Forbidden.
- **Decision:** **Build resilient Markdown fetching with structured LLM citation extraction as the primary path.** The pipeline extracts verbatim quotes directly from the clean Markdown text. The `highlights` parameter is passed opportunistically if supported, but never blocks execution.

#### D. Product Scope & Vision (Narrow Tool vs Chief of Staff)
- **Gemini / Original Brief:** Broad vision of OmniDesk as an AI Chief of Staff (intelligence feeds, calendar, inbox, task delegation, workforce).
- **Qwen Proposal:** Narrow supplier sourcing tool only.
- **Z.ai Proposal:** Phased hierarchy (P0 = Research-to-Decision, P1 = Deep Research, P2 = Priority Inbox, P3 = Form-Fill, P4 = Agent Workforce).
- **Decision:** **Preserve the broad product vision of OmniDesk (The AI Chief of Staff) with a sharp, disciplined P0 implementation spine.** The demo proves the hardest problem (verifiable research, comparison, synthesis, and human-gated action); the roadmap clearly establishes the full vision.

---

Change protocol: any new architectural decision gets a row here (status + one-line rationale)
before code is written against it. Disagreements between agents resolve in this file, not in PRs.
