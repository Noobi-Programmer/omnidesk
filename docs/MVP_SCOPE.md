# MVP Scope

## P0 — Core research-to-decision workflow (the only thing we must ship)

**Canonical demo request (typed live at the demo):**

> "Find five reliable packaging suppliers in Bengaluru for a small D2C brand. Compare their
> product range, pricing, minimum order quantity, delivery, credibility and contact details.
> Recommend the best three and draft an enquiry email to the top choice."

### In scope (P0)

1. Natural-language request → LLM extracts objective, entity type, constraints, comparison
   criteria, and the extraction schema (ResearchPlan).
2. TinyFish **Search** (free): 2–4 targeted queries with `location=IN`, `purpose` signal.
3. Deduplicate (URL + domain+name) and rank candidate sources (code heuristics + LLM score).
4. TinyFish **Fetch** (free): up to 20 URLs in batches of ≤10, markdown format.
5. LLM extraction per source → `ExtractedFact`s with verbatim quote + confidence; every
   `not_found` is explicit.
6. Optional **Agent escalation** (max 2 runs/task, $0.016/step, `max_duration_seconds: 120`)
   when Fetch fails/empties on a supplier site — with `output_schema` structured extraction and
   live iframe preview via the SDK's `STREAMING_URL` event.
7. LLM synthesis: comparison items, top-3 recommendation with reasons, missing-info list,
   conflict list, uncertainty note.
8. Action drafts: enquiry email (to/subject/body) + follow-up task; both `awaiting_approval`.
9. Approval UI: approve → email opens as `mailto:` draft / copy-to-clipboard; task saved to
   history. Dismiss → logged. **Nothing is ever sent by the server.**
10. History: last N research tasks in localStorage.
11. SSE progress streaming end-to-end: stage, counts, per-source status, agent live URL.

### Out of scope (P0)

Auth/multi-user, any database, inbox integrations, payments, scheduling, monitors, datasets,
agent workforce, Browser API, deployment beyond one Vercel preview URL.

### P0 acceptance criteria (all must pass — see TEST_PLAN.md)

- [ ] ≥3 real suppliers shown, each with ≥1 clickable source URL that opens the real page.
- [ ] Comparison table renders every field; missing fields display **"Not found"**.
- [ ] Every populated cell can be traced to a source (hover/click shows quote + URL).
- [ ] Top-3 recommendation present with one-line reasons and confidence labels.
- [ ] Enquiry email draft + follow-up task present, editable, and gated behind Approve.
- [ ] Approve produces a mailto draft (no server-side send), and an audit entry.
- [ ] SSE progress visible in UI: planning → searching → fetching → extracting → synthesizing →
      drafting → done, with live per-source statuses.
- [ ] Full run completes in ≤120s (standard mode, no agent escalation) on Vercel.
- [ ] With `DEMO_MODE=1` the identical UI runs on mock data (same contracts, zero code drift).

## P1 — Deep Research (build after P0 works, ~45 min)

Standard mode upgrades to: LLM decomposes into 3–6 subquestions → up to 8 searches →
dedup across queries → fetch up to 20 URLs → cross-check important claims (≥2 sources) →
report with citations, publication dates where available, uncertainty section.
Quick mode = 1 search + top-3 fetches, ≤45s. (All free-tier Search/Fetch.)

**TinyFish Research API** (`deep`/`max`, $2/$3 per run after 2 free/day, 5–20+ min latency) is
designed-but-not-wired: a future "Deep Report" button that fires an async run and polls
`GET /v1/research-run/{id}`. Wrong demo-day tradeoff (latency + cost); right architecture slot.

## P2 — Unified Priority Inbox (design only, unless ≥90 spare minutes)

Full design in USER_WORKFLOWS.md + DATABASE_SCHEMA.md. Feasibility facts to verify before any
build: Gmail API OAuth scopes (`gmail.readonly` is sufficient for the read-only stretch; push
needs Pub/Sub), OAuth consent "Testing" mode test-user limits, Meta app review requirements for
Instagram messaging / WhatsApp Business Cloud API test numbers. **Stretch version:** Gmail
read-only → consolidate → summarize → priority rank → reply drafts (approval-gated). No
auto-send, ever, even if the user asks during the demo.

## P3 — Web agent action (stretch, cheaper than P2)

One scripted demo: TinyFish Agent navigates a supplier's enquiry form, fills it with approved
draft content, and **stops before submitting** (goal explicitly says so; MCP-documented pattern
"Fill out the vendor onboarding form … then stop before submitting"). Show the live browser
iframe. Only after P0 is bug-free.

## P4 — Agent workforce (deferred)

Architecture-only (SOFTWARE_ARCHITECTURE.md §Future). Not built.
