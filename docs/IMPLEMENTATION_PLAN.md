# Implementation Plan

All times IST, keyed to a 09:00 build start. Submission window 15:00–15:30; pitch video done by
16:30. If your actual start differs, shift every cutoff by the same delta — the **durations and
order matter, not the clock labels**.

## Milestones

### M0 — Scaffold & contracts (09:00–10:00) · Workstream C leads
- Repo + Next.js (App Router, TS strict, Tailwind, pnpm) + Vercel project created; deploy of
  hello-page live. `src/lib/contracts` written from `docs/API_CONTRACTS.md`.
- A: `ResearchEngine`/`TinyFishService`/`LLMProvider` interfaces + mock engine skeleton.
- B: dashboard shell (prompt box, progress column, results area, history rail) on mock events.
- **Done when:** deployed URL shows the shell; `pnpm typecheck` green; contracts merged to main.
- **Risks:** scaffold churn → mitigate by locking versions (Next.js 15/16, sdk 0.11.x).
- **Cutoff:** 10:15, else drop Tailwind polish, ship unstyled shell.

### M1 — P0 end-to-end, real data (10:00–12:00) · the make-or-break block
- A: real engine — plan → search → rank/dedupe → fetch → extract → synthesize → draft, SSE all
  the way; zod everywhere; budgets enforced.
- B: full results UI (comparison table with citations, recommendation, missing-info, drafts,
  approval flow, history) consuming the real SSE stream.
- C: env wiring (keys in Vercel), integration tests on contracts, deploy per merge.
- **Done when:** canonical prompt returns ≥3 real suppliers with clickable sources in ≤120s on
  the deployed URL (all P0 acceptance criteria except agent escalation).
- **Risks:** LLM latency/429s (retry + smaller prompts); flaky supplier sites (degrade, never
  abort); Gemini free-tier limits → keep ≤10 LLM calls/task.
- **Cutoff:** 12:30. Not there? Drop agent escalation permanently for today and keep fixing.

### M2 — Escalation & polish (12:00–13:00)
- A: agent escalation path (max 2 runs, `output_schema`, `max_duration_seconds: 120`,
  `agent_live` iframe event).
- B: live iframe panel, confidence badges, warnings surfacing, empty/partial states.
- **Done when:** one forced-escalation run (a JS-heavy site) shows the live agent and returns
  structured facts. Feature freeze at **13:00**.

### M3 — QA & demo hardening (13:00–13:45) · C leads
- Full TEST_PLAN.md pass on the deployed URL; two timed dry-run demos; fix **P0-blocking bugs
  only**; freeze deps (`pnpm-lock.yaml` untouched after this point).
- **Done when:** two consecutive clean demo runs + checklist signed.

### M4 — Conditional stretch (13:45–14:45) — pick AT MOST ONE, only if M3 green
- **Option 1 (recommended): P3 agent form-fill** — scripted single-site demo, stops before
  submit. ~30–40 min. Discard if not demoable by 14:30.
- **Option 2: P2 Gmail read-only** — OAuth consent (Testing mode), `gmail.readonly`, summarize +
  rank + reply drafts. ~60–90 min. Discard if OAuth isn't approved/working by 14:15.
- **Default: none.** Buffer beats features. Never let a stretch break the P0 demo path.

### Submit & video (14:45–16:30)
- 14:45–15:15 final regression + README/demo links; 15:15–15:30 **submit** (repo + deployed
  URL + video placeholder if required).
- 15:30–16:15 record the 60–90s video (script in DEMO_AND_PITCH.md) against the deployed URL;
  16:15–16:30 upload video, final submission update. Done.

## Discard conditions (agreed in advance)

| Trigger | Action |
| --- | --- |
| P0 not E2E on deployed URL by 12:30 | Drop agent escalation; ship Search+Fetch pipeline |
| P0 not E2E by 13:30 | Ship demo with 1 real search + mock-filled pipeline, labelled honestly in the video |
| Any red P0 bug at 13:00 | All stretch work discarded |
| Wallet < $5 at any point | Agent escalation disabled via env |
| Gemini 429 storm mid-demo | Quick mode fallback (1 search, 3 fetches) |

## Tool routing for this build

| Tool | Used for | Rules |
| --- | --- | --- |
| **OmniRush** | Master board: M0–M4 dispatch, dependencies, consolidating agent outputs | One task = one workstream = one file set; never two agents on one file set |
| **Antigravity** | Isolated feature implementation (per workstream branch) | Works only inside its workstream's owned paths (AGENTS.md matrix) |
| **OpenCode** | Repo ops: typecheck, tests, git, merges, deploys; TinyFish MCP for live API probing | Only tool that pushes to `main`; runs `pnpm typecheck && pnpm test` before any merge |
| **Freebuff** | Free-tier verification for Vercel/Gemini/Supabase before anything is depended on | A dependency is only adopted after Freebuff confirms the free tier fits |
| **Claude / ChatGPT / Gemini web** | PR reviews, security red-team, prompt critique, isolated debugging | Read-only on the repo; suggestions come back as review comments, not direct commits |
| **Kimi (this package)** | Architectural source of truth | `docs/DECISIONS.md` is the living ledger; disagreements resolved there |

## Definition of shipped

Deployed URL runs the canonical prompt live with ≥3 real, source-linked suppliers; video
uploaded; repo public-or-private per rules with this planning package at root.
