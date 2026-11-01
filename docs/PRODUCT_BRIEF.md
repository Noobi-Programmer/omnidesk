# Product Brief

## One-liner

OmniDesk is an **AI Chief of Staff**: one natural-language request becomes planned live-web
research, a source-backed comparison, a ranked recommendation, and ready-to-send action drafts —
all gated behind human approval.

## Who it is for (demo persona)

Indian early-stage founders, D2C operators and freelancers who currently burn hours tab-hopping
between Google, supplier directories, inboxes and spreadsheets to make one procurement,
competitor or purchase decision. Hackathon demo persona: **a small D2C brand founder sourcing
packaging suppliers in Bengaluru.**

## The problem, precisely

Research-to-decision work is fragmented: discovery (search), evidence (open 10–20 tabs),
normalization (copy-paste into a sheet), comparison, judgement, and follow-through (drafting the
enquiry) live in five different tools. Existing AI chatbots return prose with links; existing
scrapers return data without judgement. Neither produces a *decided, drafted, approved* outcome.

## Differentiator (what we defend at judging)

> OmniDesk coordinates work **around the user's goal** — it does not merely return information.

Concretely, four things competitors-in-genre don't do together:

1. **Evidence-traceable comparison** — every cell in the comparison table resolves to a source
   URL and a verbatim quote.
2. **Honest unknowns** — missing prices/MOQs render as `Not found`, never estimates.
   Conflicting claims across sources are surfaced, not averaged.
3. **Decision + drafted action** — ranked recommendation with reasons, plus a ready enquiry
   email and follow-up task.
4. **Human approval gate** — nothing leaves the system without an explicit click; no payments,
   ever.

## Capability pillars (full product vision → P0 focus)

| Pillar | Vision | Hackathon status |
| --- | --- | --- |
| A. Deep web research | Multi-source, source-backed, three depths | **P0/P1 — build** |
| B. Unified priority inbox | Email + business messaging, ranked, reply drafts | P2 — design only (stretch: Gmail read-only) |
| C. Productivity & coordination | Drafts, calendar, tasks, follow-ups | P0 subset: enquiry email + follow-up task drafts |
| D. Web agent / browser operator | Execute approved website workflows | P3 — one stretch demo (form fill, stop before submit) |
| E. Agent workforce | Delegate objectives to specialist agents | P4 — architecture only |

## Non-goals (for this build)

- Not a general chatbot, news feed, or "browser wrapper" demo.
- Not a unified social inbox — we do not pretend Instagram/WhatsApp connectivity we don't have.
- Not local computer control. TinyFish Agent/Browser operate a **remote cloud browser**; we say
  exactly that, never "controls your PC".
- No payments, no autonomous sending, no background monitoring in the MVP.
- Not using web-chat subscriptions as product inference APIs.

## Trust promise (product-level)

Facts carry citations; interpretation is labelled; unknowns are labelled; conflicts are
labelled; actions require approval; every approved action is logged.
