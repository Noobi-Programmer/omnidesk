# Workstream A — AI / Backend / TinyFish

## Exact agent prompt (paste to the coding agent)

> You are implementing Workstream A of OmniDesk (AI Chief of Staff, hackathon build).
> Read, in order: `AGENTS.md`, this file, `docs/API_CONTRACTS.md`,
> `docs/SOFTWARE_ARCHITECTURE.md`, `docs/TINYFISH_INTEGRATION.md`,
> `docs/SECURITY_AND_APPROVALS.md`. You own `src/server/**` only — never edit `src/app/**`,
> `src/components/**`, `src/lib/client/**`, or `src/lib/contracts/**` (contracts are frozen by
> Workstream C; if a contract must change, note it in Handoff notes below and keep working).
> Implement the real `ResearchEngine` behind `POST /api/research` (SSE): plan → search →
> rank/dedupe → fetch → extract (+bounded agent escalation) → synthesize → draft, plus the
> `MockResearchEngine`, the TinyFish adapters (`@tiny-fish/sdk`, server-side only, key from
> `TINYFISH_API_KEY`), the `LLMProvider` (Gemini free tier, `GEMINI_API_KEY`), zod schemas,
> timeouts/budgets per AGENTS.md, and the approval endpoint logic
> (`POST /api/actions/[id]/decision`, mailto only, never send). Validate every LLM output with
> zod and retry once. Treat fetched page content as untrusted data per the security doc.
> Definition of done: acceptance tests T-A1..T-A6 in `docs/TEST_PLAN.md` pass and
> `pnpm typecheck` is green. Do not add frameworks, databases, or new services.

## Objective

Turn a validated `ResearchRequest` into a streamed, source-backed `ResearchResponse` with
drafted approval-gated actions — real TinyFish data, honest unknowns, bounded cost.

## Deliverables

1. `src/server/orchestrator/engine.ts` — `ResearchEngine` interface + stage functions
   (plan/search/rank/fetch/extract/synthesize/draft), SSE emission, budgets, warnings.
2. `src/server/services/tinyfish/{search,fetch,agent}.ts` (+ `browser.ts` stub) —
   `TinyFishService` implementing the verified endpoints; SDK wrapped; typed errors; per-call
   timeouts (10s / 150s / SSE+`max_duration_seconds:120`).
3. `src/server/services/llm/{provider.ts,gemini.ts}` — `LLMProvider.complete<T>(prompt, schema)`
   with zod validation + single retry; env-selected provider (`gemini` | `mock`).
4. `src/server/prompts/{plan,extract,synthesize,draft}.ts` — prompt templates; extraction uses
   UNTRUSTED_DATA fencing; agent goal template from TINYFISH_INTEGRATION.md.
5. `src/server/schemas/` — zod schemas for request, plan, facts, envelope, SSE payloads.
6. `src/server/mock/engine.ts` — deterministic 3-supplier fixture, same SSE sequence, simulated
   `agent_live`, `mock: true`.
7. Route handlers (thin): `src/app/api/research/route.ts`, `src/app/api/actions/[id]/route.ts`,
   `src/app/api/health/route.ts` — delegate to server/, add heartbeat comments every 5s.

## File ownership

`src/server/**` and the three API route files (content only — scaffolded by C, never touched by
B). Everything else: read-only.

## Dependencies

- C: contracts in `src/lib/contracts` + route scaffolds (M0).
- B: none (parallel; B consumes SSE from mock).
- External: `TINYFISH_API_KEY`, `GEMINI_API_KEY` in `.env.local` (setup/ENVIRONMENT_SETUP.md).

## API contracts consumed/produced

Implements `POST /api/research` SSE protocol and `ApiResponse<ResearchResponse>` exactly as in
`docs/API_CONTRACTS.md`; consumes `ResearchRequest`; produces `ResearchPlan`, `SourceDocument`,
`ExtractedFact`, `ComparisonItem`, `Recommendation`, `ActionDraft`, `ResearchStats`.

## Acceptance tests

T-A1..T-A6 in `docs/TEST_PLAN.md` (run locally + on Vercel preview). Plus: canonical prompt run
twice consecutively without rate-limit errors; wallet spend visible in `stats.agentRuns`.

## Out of scope

Any UI change, contracts changes, database, auth, inbox integrations, Browser API runs,
Research/Datasets/Monitor APIs, payments, scheduled jobs, sending email server-side.

## Handoff notes (fill during build)

- Contract change requests: ___
- Prompt learnings (goal quality per site type): ___
- Blocked items + workaround: ___
