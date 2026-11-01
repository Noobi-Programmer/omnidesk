# Workstream B — Frontend / Product

## Exact agent prompt (paste to the coding agent)

> You are implementing Workstream B of OmniDesk (AI Chief of Staff, hackathon build).
> Read, in order: `AGENTS.md`, this file, `docs/API_CONTRACTS.md`,
> `docs/USER_WORKFLOWS.md`, `docs/DEMO_AND_PITCH.md`. You own `src/app/**` (page/component
> files only — the three `api/` route files belong to A), `src/components/**`, and
> `src/lib/client/**`; never edit `src/server/**` or `src/lib/contracts/**` (frozen by C).
> Build the OmniDesk dashboard: prompt composer (canonical example preloaded as a chip),
> live progress timeline consuming the SSE stream from `POST /api/research`, results view with
> comparison table (value + confidence badge + click-to-open citation popover with verbatim
> quote and source URL), recommendations with reasons and risks, missing-info and conflict
> panels, action-draft review with edit + Approve/Dismiss (Approve triggers the mailto/clipboard
> flow returned by `POST /api/actions/[id]/decision` and shows the audit entry), a history rail
> backed by the localStorage `HistoryStore`, and full loading/error/empty/partial states.
> Types come from `src/lib/contracts`. Start against the mock SSE stream (DEMO_MODE=1); the real
> engine must be a drop-in with zero component changes. Implement the `agent_live` iframe panel.
> Definition of done: acceptance tests T-B1..T-B6 in `docs/TEST_PLAN.md` pass against mock, then
> against the real stream when A lands. Do not add UI frameworks beyond Tailwind.

## Objective

Make the invisible research pipeline visible, trustworthy and demo-ready: every claim
traceable, every unknown honest, every action human-gated.

## Deliverables

1. `src/app/page.tsx` — dashboard layout (prompt column, progress column, results area,
   history rail).
2. `src/components/` — `PromptComposer`, `ProgressTimeline` (stages + counts + per-source
   status), `AgentLivePanel` (iframe on `agent_live`), `ComparisonTable` (citation popover),
   `Recommendations`, `MissingInfoPanel`, `ConflictPanel`, `ActionDraftCard` (edit + approve/
   dismiss), `HistoryRail`, `WarningBanner`, `ErrorState`, `EmptyState`, `AuditFeed`.
3. `src/lib/client/` — `sseClient.ts` (fetch-based SSE reader for POST), `historyStore.ts`
   (`HistoryStore` over localStorage, 20-entry cap), `api.ts` (typed fetchers for
   actions/health), `useResearchRun.ts` hook.
4. History run detail view (reopening a stored `ResearchResponse`).

## File ownership

`src/app/**` (minus the three `api/` routes' contents), `src/components/**`, `src/lib/client/**`.

## Dependencies

- C: contracts + app scaffold (M0).
- A: real SSE stream (until then, mock engine events — same contract).
- None on TinyFish directly: all data via the API.

## API contracts consumed

`POST /api/research` SSE events (`progress`, `plan`, `source`, `agent_live`, `warning`,
`result`, `error`); `POST /api/actions/[id]/decision`; `GET /api/health`;
`ResearchResponse` render rules: `facts[key] === "Not found"` → badge; `status: "partial"` →
warning banner; `mock: true` → small "DEMO DATA" chip (honesty).

## Acceptance tests

T-B1..T-B6 in `docs/TEST_PLAN.md`. Plus manual: canonical prompt full-run visually clean at
1280px and ~400px zoom; no layout shift on late `source` events; citation links open real pages.

## Out of scope

Backend logic, contracts, auth, real OAuth, sending email, changing SSE payload shapes,
analytics, theming systems, i18n.

## Handoff notes (fill during build)

- Contract change requests: ___
- Events you wished existed: ___
- Demo-critical UX polish items: ___
