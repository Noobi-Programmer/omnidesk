# Workstream C — Integration / QA / Deployment

## Exact agent prompt (paste to the coding agent)

> You are implementing Workstream C of OmniDesk (AI Chief of Staff, hackathon build).
> Read, in order: `AGENTS.md`, this file, `docs/API_CONTRACTS.md`, `docs/IMPLEMENTATION_PLAN.md`,
> `docs/TEST_PLAN.md`, `setup/GITHUB_SETUP.md`, `setup/ENVIRONMENT_SETUP.md`. You own the
> repository skeleton, `src/lib/contracts/**`, `tests/**`, `scripts/**`, `.github/**`,
> `.env.example`, `vercel.json`, and `README.md` (structure only); never edit `src/server/**`,
> `src/app/**`, `src/components/**`, or `src/lib/client/**`. Tasks: (1) scaffold the Next.js
> (App Router, TypeScript strict, Tailwind, pnpm) project exactly per docs/SOFTWARE_ARCHITECTURE.md's
> folder structure, with empty-but-typed placeholders for A's and B's owned files; (2) write
> `src/lib/contracts/index.ts` verbatim from `docs/API_CONTRACTS.md` plus zod schemas for the
> request and envelope; (3) wire vitest with the A-section tests from `docs/TEST_PLAN.md`
> (contracts, mock engine shape, rank/dedupe, budgets, injection fixtures — skip engine internals
> until A lands); (4) set up GitHub repo + branches `ws-a-backend`/`ws-b-frontend`/`ws-c-integration`
> per setup/GITHUB_SETUP.md and Vercel project with env vars named in `.env.example`; (5) own
> merge gating: `pnpm typecheck && pnpm test && pnpm build` must pass before merging any
> workstream branch to main; (6) run the E2E demo script and demo-day checklist from
> `docs/TEST_PLAN.md` on the deployed URL and report results. Definition of done: deployed
> skeleton URL live, contracts merged, CI green, and the E2E report delivered before 13:45 IST.

## Objective

Make three parallel workstreams possible and provably correct: one repo, one contract, one
deploy pipeline, one gatekeeper.

## Deliverables

1. Scaffolded repo (structure per SOFTWARE_ARCHITECTURE.md; pnpm; TS strict; vitest; ESLint
   light) + `README.md` quickstart section.
2. `src/lib/contracts/index.ts` — every type from API_CONTRACTS.md + zod schemas; frozen after
   M0 (changes need A+C review).
3. `tests/` — the Section A suite from TEST_PLAN.md + a merge-gate script
   (`scripts/gate.sh`: typecheck → test → build).
4. `.env.example` (names only), `.gitignore`, `vercel.json` (region + function timeout
   settings for the SSE route).
5. GitHub repo `Noobi-Programmer/omnidesk` (private) + branches + protection on `main`
   (require the gate script).
6. Vercel project + env wiring + deployed URL; per-merge preview discipline.
7. E2E + demo-day checklist report (the D/E sections of TEST_PLAN.md), executed twice before
   the deadline.

## File ownership

`src/lib/contracts/**`, `tests/**`, `scripts/**`, `.github/**`, `.env.example`, `vercel.json`,
`README.md` (structure/quickstart), scaffold placeholders in A/B areas (handed over untouched).

## Dependencies

- A and B start only after the M0 scaffold + contracts land (≤10:15 IST).
- Keys: `TINYFISH_API_KEY`, `GEMINI_API_KEY` (from the team, set in Vercel + `.env.local`).

## API contracts

You author them (from docs) and enforce them: CI fails on type drift between
`src/lib/contracts` and the sample JSON fixtures in `docs/API_CONTRACTS.md`.

## Acceptance tests

- `pnpm gate` (typecheck+test+build) green on `main` at every merge from 10:15 onward.
- Contracts test parses the sample JSON in docs/API_CONTRACTS.md without error.
- Deployed URL serves `/api/health` returning the env-readiness envelope.
- Two consecutive clean E2E runs on the deployed URL by 13:45 IST; checklist signed.

## Out of scope

Business logic, prompts, UI components, contract redesign after freeze, provider integrations,
performance tuning beyond the 120s target.

## Handoff notes (fill during build)

- Contract deviations found during integration: ___
- Flaky tests / disabled with reason: ___
- Deploy incidents + fixes: ___
