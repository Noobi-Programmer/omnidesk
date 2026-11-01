# OmniDesk — The AI Chief of Staff

OmniDesk turns one natural-language request into a finished, source-backed business decision:
**One request → Understand → Research → Analyze → Decide → Act (with human approval).**

Built by **Team Thambiis** (3 builders) for **Swim with TinyFish** at Scaler School of Technology.
Budget: **₹0** — free tiers only. Live web intelligence is powered by the **TinyFish** platform
(Search, Fetch, Agent, Browser APIs) via the official `@tiny-fish/sdk`.

## The 90-second pitch

A founder types:

> "Find five reliable packaging suppliers in Bengaluru for a small D2C brand. Compare their
> product range, pricing, minimum order quantity, delivery, credibility and contact details.
> Recommend the best three and draft an enquiry email to the top choice."

OmniDesk plans the research, searches the live web, fetches and reads supplier websites,
extracts structured facts with citations, builds a comparison table, flags every unknown as
**"Not found"** (never fabricates), ranks the best three with reasons, and drafts the enquiry
email — which is sent nowhere until a human clicks **Approve**.

## Status

- **Phase:** planning complete, implementation not started (by design — this package is the
  build contract).
- Repository `Noobi-Programmer/omnidesk` is initialized locally and connected to remote
  `https://github.com/Noobi-Programmer/omnidesk.git` on branch `main`. See `setup/GITHUB_SETUP.md`.

## Documentation map

| Document | Purpose |
| --- | --- |
| [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) | Positioning, pillars, differentiator, non-goals |
| [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) | P0 scope, canonical demo, acceptance criteria |
| [`docs/SOFTWARE_ARCHITECTURE.md`](docs/SOFTWARE_ARCHITECTURE.md) | System design, pipeline, boundaries |
| [`docs/TINYFISH_INTEGRATION.md`](docs/TINYFISH_INTEGRATION.md) | Verified TinyFish facts, adapter design, costs |
| [`docs/USER_WORKFLOWS.md`](docs/USER_WORKFLOWS.md) | Primary and future user journeys |
| [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) | TypeScript contracts, endpoints, SSE protocol |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | MVP storage + future Supabase schema |
| [`docs/SECURITY_AND_APPROVALS.md`](docs/SECURITY_AND_APPROVALS.md) | Trust model, injection defence, approval gates |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Milestones, cutoffs, discard conditions |
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Acceptance tests, E2E script, demo checklist |
| [`docs/DEMO_AND_PITCH.md`](docs/DEMO_AND_PITCH.md) | Live demo script + 60–90s video script |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Decision ledger (verified / assumption / decision) |
| [`tasks/BACKEND_AGENT.md`](tasks/BACKEND_AGENT.md) | Workstream A task contract |
| [`tasks/FRONTEND_AGENT.md`](tasks/FRONTEND_AGENT.md) | Workstream B task contract |
| [`tasks/INTEGRATION_QA_AGENT.md`](tasks/INTEGRATION_QA_AGENT.md) | Workstream C task contract |
| [`setup/GITHUB_SETUP.md`](setup/GITHUB_SETUP.md) | gh CLI commands to create and push the repo |
| [`setup/ENVIRONMENT_SETUP.md`](setup/ENVIRONMENT_SETUP.md) | Accounts, keys, free-tier checks |
| [`setup/LOCAL_DEVELOPMENT.md`](setup/LOCAL_DEVELOPMENT.md) | Run, test, debug commands |

Agent instructions: [`AGENTS.md`](AGENTS.md) (universal) → [`CLAUDE.md`](CLAUDE.md),
[`GEMINI.md`](GEMINI.md), [`OPENCODE.md`](OPENCODE.md) (tool-specific).

## Intended stack (decided, see DECISIONS.md)

Next.js (App Router) + TypeScript strict · `@tiny-fish/sdk` server-side only · Google Gemini API
free tier as the reasoning LLM (provider-agnostic interface) · Tailwind CSS · Vercel Hobby ·
pnpm · no database in the MVP (localStorage history; Supabase schema reserved for later).

## Principles

1. **One complete workflow beats five half-modules.** P0 only until it works end-to-end.
2. **Evidence or "Not found"** — never a fabricated price, MOQ, or rating.
3. **No external action without explicit human approval.** No payments, ever.
4. **Cost ladder:** Search (free) → Fetch (free) → Agent ($0.016/step) → Browser ($0.002/min).
   Escalate only when the cheaper tool cannot do the job.
5. **Three workstreams, zero file overlap.** See AGENTS.md ownership matrix.
