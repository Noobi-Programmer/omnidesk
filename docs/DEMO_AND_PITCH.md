# Demo and Pitch

## The one message

"AI chatbots give you information. OmniDesk gives you a **decision** — researched from the live
web, cited, compared, and turned into a ready-to-send draft that you approve."

## 60–90 second video script (record against the deployed URL, one take + captions)

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
