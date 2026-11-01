# Test Plan

## A. Unit / contract tests (Workstream C, vitest)

1. `contracts.spec.ts`: every type in `src/lib/contracts` accepts the sample JSON from
   `docs/API_CONTRACTS.md` (type-level + runtime zod parse).
2. `mock-engine.spec.ts`: mock emits the full SSE sequence
   (`plan → progress* → source* → agent_live → result`) and terminates with `result` within 15s.
3. `rank-dedupe.spec.ts`: given fixture search results — duplicate URLs collapse; same domain +
   normalized name collapses; aggregator domains are filtered.
4. `extract-validation.spec.ts`: LLM output missing required fields → rejected and retried once;
   a `not_found` fact serializes with `status: "not_found"`, `value: null`.
5. `budgets.spec.ts`: 9th search / 21st URL / 3rd agent run are refused with typed warnings.
6. `injection-fixtures.spec.ts`: a page containing "ignore previous instructions…" yields facts
   only — no draft content changes, no extra actions.

## B. Backend acceptance tests (Workstream A)

- T-A1: canonical prompt, `standard` mode, no agent → SSE completes ≤120s locally, ≥3 sources ok.
- T-A2: forced agent escalation (fixture site) → `agent_live` event present; result contains
  facts from the agent run; budget decremented.
- T-A3: all sources fail → `status: "partial"`, empty comparison, honest warnings, no crash.
- T-A4: invalid request (empty prompt, 3000-char prompt, bad mode) → 400 envelope with `ApiError`.
- T-A5: missing `GEMINI_API_KEY` → `/api/health` reports it; research returns typed error.
- T-A6: `DEMO_MODE=1` → identical contract shapes, `mock: true`.

## C. Frontend acceptance tests (Workstream B)

- T-B1: progress timeline renders every stage with live counts; no frozen UI >10s without an
  event (heartbeat or progress).
- T-B2: comparison cells — value + confidence badge; click → citation popover (quote + URL link
  opens real page in new tab).
- T-B3: `Not found` cells render the badge and are counted in "what we couldn't verify".
- T-B4: email draft editable; Approve → mailto/clipboard flow + audit entry appears in history;
  Dismiss → status change logged.
- T-B5: history rail lists past runs; reopening a run shows the full stored response.
- T-B6: mock mode vs real mode — zero component-code differences (only env).

## D. End-to-end demo script (Integration/QA, run on the deployed URL)

1. `GET /api/health` → all green (or intentionally mock-flagged).
2. Type canonical prompt → watch timeline to completion (≤120s).
3. Open 2 citations in new tabs → they are the real supplier pages.
4. Verify one `Not found` cell and the missing-info list.
5. Edit the enquiry email → Approve → mailto opens → audit entry visible.
6. Refresh page → history shows the run; reopen it.
7. (If stretch) agent form-fill demo with live iframe.

## E. Demo-day checklist

- [ ] Wallet balance ≥ $5; agent escalation on (or knowingly off).
- [ ] Gemini quota fresh (free-tier RPD resets at midnight Pacific — verify reset time).
- [ ] Vercel deployment warmed (run once before the room sees it).
- [ ] Network fallback: local dev server with cached demo-mode as plan B.
- [ ] Video uploaded; repo link works in a logged-out browser.
- [ ] One-line honesty card: working = P0 (+stretch); roadmap = inbox, deep report, workforce.
