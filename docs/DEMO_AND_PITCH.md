# Demo and Pitch

## Official Judging Criteria & Scoring Strategy

The hackathon evaluates submissions on four explicit pillars:
1. **Use of TinyFish (35%):** How central TinyFish is to the solution.
2. **Problem Relevance & Impact (25%):** Value proposition, real-world utility, and market need.
3. **Technical Execution & Working Demo (25%):** Code quality, system architecture, and reliable live demonstration.
4. **Presentation (15%):** Narrative clarity, video pitch quality, and concise demonstration.

```
+-------------------------------------------------------------------------------+
|                        JUDGING CRITERIA BREAKDOWN                             |
|                                                                               |
|   [  Use of TinyFish: 35%  ]  [ Problem Impact: 25% ]  [ Tech Demo: 25% ] [15%]|
|   - Search (Free Discovery)   - Eliminates B2B spam    - Next.js 15 App   - 90s|
|   - Fetch (Clean Markdown)    - High-stakes D2C MOQs   - Real SSE Stream  - Live|
|   - Agent ($0.016/step Live)  - Zero-hallucination     - 100% CI Gate     - Wow|
+-------------------------------------------------------------------------------+
```

---

## 1. Pillar 1: Centrality of TinyFish (35% Weight)

TinyFish is the **irreplaceable core engine** of OmniDesk, not a secondary add-on:

1. **TinyFish Search API (Free Discovery Tier):**
   * Executes multi-query discovery targeting Indian industrial locations (`location: "IN"`).
   * Automatically bypasses aggregator spam directories (IndiaMART, Justdial, TradeIndia) using purpose signals.
2. **TinyFish Fetch API (Free Content Extraction):**
   * Batches candidate URLs (up to 10) and strips non-content navigation, tracking scripts, and cookie banners to output clean Markdown.
   * Eliminates LLM token waste by 80% compared to raw HTML.
3. **TinyFish Agent API (Autonomous Browser Escalation):**
   * Deployed when supplier pages require dynamic interaction or bot-protected browsing.
   * Streams the live automation directly into our frontend UI via `STREAMING_URL` iframe.
4. **Official `@tiny-fish/sdk` Integration:**
   * Uses typed SDK v0.11.0 server-side with strict error isolation and bounded execution budgets.

---

## 2. Pillar 2: Problem Relevance and Impact (25% Weight)

* **The Problem:** Indian founders, D2C brand creators, and operators waste 10–15 hours weekly searching for packaging, raw material, and logistics suppliers. Aggregator platforms (IndiaMART/Justdial) do not show transparent MOQs or pricing, and aggressively broadcast founder phone numbers to spam callers.
* **The Impact:** OmniDesk reduces 15 hours of manual tab-hopping into a **30-second verified decision matrix**.
* **Zero-Hallucination Ground Truth:** B2B procurement cannot tolerate AI hallucinations. OmniDesk enforces the **Evidence or "Not found"** rule: every cell has a clickable verbatim quote with source URL, and unstated fields are marked `"Not found"`.

---

## 3. Pillar 3: Technical Execution & Working Demo (25% Weight)

* **Robust Full-Stack Architecture:** Next.js 15 (App Router), TypeScript (Strict Mode), Tailwind CSS.
* **Real-Time Streaming Protocol:** Native Server-Sent Events (SSE) via `POST /api/research` with 5-second heartbeat comments (`: ping\n\n`) ensuring zero cloud disconnects on Vercel.
* **Latency Optimization (Batch Extraction):** Optimized LLM roundtrips from 10 sequential calls to 3 batch calls, achieving complete pipeline runs in **under 35 seconds**.
* **100% Verified CI Gate:** `pnpm gate` (`tsc --noEmit && vitest run && next build`) passes with 0 errors.
* **Resilient Offline Mock Parity:** `MockResearchEngine` (`DEMO_MODE=1`) guarantees a deterministic fallback demo that functions even during hotel/stage WiFi drops.

---

## 4. Pillar 4: Presentation & Live Script (15% Weight)

### The One Message
"AI chatbots give you information. OmniDesk gives you a **decision** — researched from the live
web via TinyFish, cited with exact quotes, compared side-by-side, and turned into an approved outreach action."

### 60–90 Second Video Script (Record against deployed URL)

| Time | Beat | On screen |
| --- | --- | --- |
| 0–8s | **Problem** | "Founders lose hours tab-hopping: search, supplier sites, sheets, inbox — just to make one sourcing decision." Quick montage of messy tabs. |
| 8–15s | **OmniDesk** | Logo + tagline "The AI Chief of Staff". |
| 15–20s | **Real request** | Type the canonical Bengaluru packaging-supplier prompt into OmniDesk. |
| 20–40s | **Live research** | Progress timeline: planning → searching (real queries visible) → fetching (per-site statuses). If agent escalation fires: **live browser iframe** of TinyFish working the site. |
| 40–55s | **Source-backed comparison** | Comparison table; click one cell → citation popover with quote + link; point out a **"Not found"** cell: "it never guesses." |
| 55–70s | **Recommendation + human approval** | Top-3 with reasons; enquiry email draft; click **Approve** → mailto opens; audit entry appears. "Nothing sends without you. No payments, ever." |
| 70–85s | **Future vision** | Three chips: Priority Inbox · Deep Reports · Agent Workforce — clearly labelled "roadmap". |
| 85–90s | **Close** | "OmniDesk — one request to a decided outcome. Built on TinyFish by Team Thambiis." |

**Editing rules:** real run only (or honestly labelled mock if disaster); nofake cursor
acceleration beyond 2×; keep the timer visible; captions for judge-muted viewing.

## Live demo script (if also presenting in person)

1. Set up before the slot: warmed deployment, health check green, wallet ≥ $5.
2. Run the canonical prompt live. While it runs (90–120s of otherwise dead air — fill it):
   explain the cost ladder — "Search and Fetch are free; the Agent is $0.016 per step, so we
   only escalate it when a page can't be read statically. That discipline is why this whole run
   costs us about zero."
3. Walk the table: one citation click, one Not found, the conflict/missing list.
4. Approve the email — show the mailto, show the audit log.
5. If stretch feature is live: the agent form-fill that **stops before submitting**.

## Technical defense — likely judge questions

- **"How do you know the data is real?"** — Every cell resolves to a verbatim quote + source
  URL; unknowns are explicitly `Not found`; publication dates preserved where available.
- **"Why TinyFish and not your own scraper?"** — Verified economics: Search and Fetch are free
  tiers (12k searches/day, 1k URLs/day); Agent handles JS/anti-bot sites at $0.016/step with
  structured output guarantees; the SDK gives typed SSE streaming. Building this ourselves costs
  days and proxy/anti-bot pain.
- **"Could a webpage hijack your agent?"** — Page content is fenced as untrusted data, extraction
  is schema-validated, actions are template-generated, and nothing sends without a human click.
- **"What about the inbox promise?"** — Design exists (USER_WORKFLOWS.md W3); provider APIs need
  OAuth/app review (Gmail read-only is the feasible first integration; Meta platforms require
  app review for production). We don't fake it; it's roadmap.
- **"Scale?"** — Pipeline stages are isolated typed units; the P4 workforce is a scheduling
  wrapper (queue + specialist workers + checkpoints) on the same contracts, plus the future
  Supabase schema in DATABASE_SCHEMA.md.

## Assets checklist

- [ ] 1280×720+ screen recording, 60–90s, ≤50MB
- [ ] Deployed URL + repo link in the submission
- [ ] One architecture diagram (from SOFTWARE_ARCHITECTURE.md) as a still slide
- [ ] "Working vs roadmap" honesty card
