# User Workflows

## W1 — Supplier sourcing (P0 primary demo, end-to-end)

**Actor:** D2C founder. **Trigger:** the canonical prompt (MVP_SCOPE.md).

1. **Ask.** User types the request, mode = `standard`, optional business context
   ("small D2C brand, eco-friendly preferred").
2. **Watch.** Progress timeline: planning (shows the extracted objective + planned queries —
   transparency is a feature) → searching (query-by-query) → fetching (per-source status:
   pending/ok/degraded/failed) → extracting → synthesizing → drafting. If an agent escalation
   happens, an **live browser iframe** appears showing the TinyFish agent working the site.
3. **Verify.** Comparison table: suppliers × criteria; each cell shows value, confidence badge,
   and citation (quote + source URL on click). Missing cells read **"Not found"**.
4. **Decide.** Ranked top-3 recommendation with reasons, risks, and an explicit
   "what we couldn't verify" list.
5. **Act.** Draft panel: enquiry email (editable) + follow-up task ("Follow up with {supplier}
   on {date} if no reply"). Both require **Approve**. Approve → mailto draft opens / copy;
   the action and its audit entry land in history. Dismiss → logged.

**Done when:** user has a defensible decision plus a ready-to-send draft, without opening a
single tab themselves.

## W2 — Research depths (P1)

- **Quick** (~45s): 1 search, 3 fetches, lean synthesis. "Who are the top packaging suppliers
  near Bengaluru?"
- **Standard** (~90–120s): plan → 2–4 searches → ≤20 fetches → extraction → synthesis → drafts.
- **Deep** (P1, ~3–5 min): 3–6 subquestions, ≤8 searches, cross-checking key claims across
  ≥2 sources, publication dates preserved, conflicts section, uncertainty statement.
- **Deep Report (future toggle):** TinyFish Research API async run — fire, poll, notify;
  report renders in a reading pane with citations.

## W3 — Priority inbox (P2 design; stretch build = Gmail read-only)

**Designed flow:** connect provider (OAuth) → sync messages → consolidate into unified schema →
summarize threads → rank by urgency/deadline/sender context/user rules → flag decision-needed →
draft replies (approval-gated) → auto-actions only for explicitly enabled low-risk rules.

**Risk tiers (product policy):**
| Tier | Examples | Behaviour |
| --- | --- | --- |
| Low | promo, newsletters | summarize; archive only if user enabled a rule |
| Medium | routine customer question, appointment request | prepare reply/action, request approval |
| High | investor, legal, serious complaint, ambiguous | alert + summarize + ask user how to proceed |

**Honesty constraints:** no unified social inbox exists out of the box; each provider needs its
own OAuth/app-review path. Stretch build is Gmail `gmail.readonly` only; reply drafts open in
the user's mail client. WhatsApp Business Cloud API / Instagram messaging require Meta app
review for production (test numbers/accounts work in development) — **TO VERIFY** before P2:
https://developers.facebook.com/docs/whatsapp/cloud-api and the Instagram Platform docs.
Gmail push notifications require Google Cloud Pub/Sub — polling `users.history.list` is the
free simplification. **TO VERIFY** current quota/test-user limits before coding.

## W4 — Web agent action (P3 stretch)

User approves "fill the enquiry form on {supplier} website" → TinyFish Agent run with goal
ending in **"…then stop before submitting"** → live iframe shows the filled form → user clicks
Submit themselves on the live view (or in their own tab). The agent never submits.

## W5 — Agent workforce (P4 vision, not built)

"Research 20 potential investors for my startup, filter by sector fit, rank them, and draft
personalized outreach." Orchestrator decomposes into subtasks; specialist stage-workers
(research, extract, verify, compare, draft) execute with checkpoints; user inspects progress,
cancels, approves consequential steps; final consolidated deliverable with full lineage.
The P0 pipeline stages are deliberately shaped so this is a scheduling wrapper, not a rewrite.
