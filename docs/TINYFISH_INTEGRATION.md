# TinyFish Integration (verified 2026-11-01)

All facts below are from official documentation (docs.tinyfish.ai) and the official cookbook
(github.com/tinyfish-io/tinyfish-cookbook), checked on 2026-11-01. Anything not verifiable is
marked **ASSUMPTION** or **TO VERIFY**. Never invent endpoints, fields, or quotas beyond this file.

## API surfaces — verified facts

### Authentication (all REST APIs)
- Header: `X-API-Key: <key>` (case-sensitive). Keys created at https://agent.tinyfish.ai/api-keys.
- Convention: `TINYFISH_API_KEY` env var; both official SDKs read it automatically.
- Error codes: `MISSING_API_KEY` (401), `INVALID_API_KEY` (401), `INSUFFICIENT_CREDITS` (402),
  `FORBIDDEN` (403).
  Source: https://docs.tinyfish.ai/authentication

### Search API — our discovery tool (free)
- `GET https://api.search.tinyfish.ai?query=...` with params: `query`, `location`, `language`,
  `recency_minutes` (1–5,256,000), `after_date`/`before_date` (YYYY-MM-DD), `domain_type`
  (`web`|`news`|`research_paper`), `purpose` (≤2000 chars intent signal). Do not combine
  `recency_minutes` with date filters.
- Response: `{ query, results: [{ position, site_name, title, snippet, url }], total_results, page }`.
- Free tier: docs say up to **12,000 requests/day** free; pricing page says **30 req/min,
  500 req/hour**, $0.00 per request. Beyond that needs a positive wallet balance.
  Sources: https://docs.tinyfish.ai/search-api , https://www.tinyfish.ai/pricing

### Fetch API — our reading tool (free)
- `POST https://api.fetch.tinyfish.ai` (REST) or `client.fetch.getContents(...)` (SDK v0.11.0).
- Request params: `{ urls: [≤10], format: "markdown"|"html"|"json", ttl?, include_selectors?/exclude_selectors? (≤20), purpose?, per_url_timeout_ms?, highlights? }`.
- Response: `{ results: [{ url, final_url, title, description, language, format, text }], errors: [] }` — **per-URL failures appear in `errors[]` and do not fail the request**.
- Renders JS-heavy pages when needed; markdown is ideal for LLM consumption. PDF text extraction works; binary files error.
- Free: **1,000 URLs/day, 150 URLs/min**, $0.00 per URL.
- **Highlights Parameter (Beta caveat):** Supported via `highlights: { query: string, max_snippets?: number }` in `FetchHighlightsParams`. However, official SDK schema notes: `Beta: API returns 403 unless enrolled. Markdown only.` Therefore, **never make highlights a hard requirement**. Use standard `format: 'markdown'` with LLM verbatim citation extraction as the resilient primary pipeline, and pass `highlights` only when enrolled or as an opportunistic optimization with fallback.
- Timeout guidance: 110s per-URL backend cap, 120s CDN ceiling per batch → set client timeout **150s**. `ttl: 0` forces a live fetch.
  Sources: https://docs.tinyfish.ai/fetch-api , https://docs.tinyfish.ai/for-coding-agents.md , `@tiny-fish/sdk` v0.11.0 `dist/fetch/types.d.ts`

### Agent API — our escalation tool ($0.016/step)
- Endpoints (all `POST https://agent.tinyfish.ai/v1/automation/...`): `/run` (sync, **cannot be
  cancelled**), `/run-async` (start + poll `GET /v1/runs/{id}`, cancellable),
  `/run-sse` (live events, cancellable). We use **`/run-sse` only**.
- Request: `{ url, goal, output_schema?, agent_config: { max_steps?, max_duration_seconds?,
  mode? }, capture_config?, webhook_url? }`. `max_steps` (1–500, default 150) is **beta**;
  `max_duration_seconds` is not — use it as our reliable bound.
- SSE events: `STARTED` (run_id), `STREAMING_URL` (iframe live view, valid 24h), `PROGRESS`
  (purpose), `HEARTBEAT`, `COMPLETE` (status + result). Cancel: `POST /v1/runs/{id}/cancel`.
- **`COMPLETED` status ≠ goal success** — result content may be captcha/blocked/empty; always
  validate content. Latency typically 15–60s; suggested timeout 120s.
- Cost: **$0.016 per step**; **2 concurrent runs** (pricing page). Legacy plans: 1 credit/step.
  Sources: https://docs.tinyfish.ai/agent-api , https://docs.tinyfish.ai/key-concepts/endpoints ,
  https://www.tinyfish.ai/pricing

### Structured output (`output_schema`)
- JSON-schema-like subset; **top level must be an object**; no `oneOf`/`const`/
  `additionalProperties`; nullable via `nullable: true` (never type arrays); ≤64KB serialized;
  depth ≤10; supports `properties`, `required`, `propertyOrdering`, `enum` (string only),
  `format` (`date`, `date-time`, `duration`, `time`), `anyOf` (not top-level).
- **The schema wins over the prompt** — to get a list, the schema must declare an array field.
  Source: https://docs.tinyfish.ai/key-concepts/structured-output

### Browser API — designed, stubbed, not built ($0.002/min)
- `POST https://api.browser.tinyfish.ai` → `{ session_id, cdp_url, base_url }`; connect
  Playwright/Puppeteer via `connectOverCDP(cdp_url)`. Session creation 10–30s (timeout ≥60s).
  Isolated sessions (no cookie persistence — Browser Context Profiles add login state).
  Inactivity timeout: 15 min on free plans. **5 concurrent sessions, $0.002 per minute.**
  A remote cloud browser — never described as control of the user's computer.
  Source: https://docs.tinyfish.ai/browser-api

### Research API — designed, not wired ($2–$3/run after free)
- `POST /v1/automation/run-research` (always SSE) or `/run-research-async`; params: `query`
  (1–10,000 chars), `mode: "deep"` (default, 5–20 min) | `"max"` (5–45 min), `stream`,
  `output_language`, `domain_type`, date filters, `domain_filter`, `prior_run_id`, `session_id`.
- Events: `created`, `plan_updated`, `sources_searched`, `source_fetched`, `partial_summary`,
  `synthesis_started`, `synthesis_delta`, `final_result` (report + citations), `run_stats`,
  `done`, … Poll `GET /v1/research-run/{id}`; cancel `POST /v1/research-run/{id}/cancel`.
- Limits: **first 2 completed runs per UTC day free**, then **$2 (deep) / $3 (max)**; **5
  concurrent runs**; 45-minute budget; must be enabled on the account (403 otherwise).
  Wrong demo-day tradeoff (minutes of latency, real cost) → future "Deep Report" feature only.
  Source: https://docs.tinyfish.ai/research-api/reference

### Adjacent APIs (roadmap awareness, not used)
- **Monitor** (`$0.005`/completed run): scheduled page/topic watches with webhooks — future
  "watch competitor pricing" pillar. **Datasets** (beta: free runs, **3 runs / rolling 24h**,
  `target_rows` 1–250): table-of-entities generation — considered for supplier lists, rejected
  for MVP due to beta limits. Sources: https://docs.tinyfish.ai/mcp-integration (rates table),
  https://docs.tinyfish.ai/llms.txt (index).

### SDK (verified on npm)
- **`@tiny-fish/sdk` v0.11.0**, published 2026-10-28, "TinyFish TypeScript SDK — State-of-the-art
  web agents in an API". Python equivalent: `tinyfish`. Official guidance: *"Always use the
  official SDKs — they handle authentication, SSE streaming, retries, and typed responses."*
  Sources: https://registry.npmjs.org/@tiny-fish/sdk , https://docs.tinyfish.ai/for-coding-agents.md

### MCP & plugins (development workflow, not the product)
- Hosted MCP: `https://agent.tinyfish.ai/mcp` (OAuth 2.1). Verified clients: Claude Code, Codex,
  **OpenCode** (`opencode mcp add tinyfish --url https://agent.tinyfish.ai/mcp`), Cursor,
  Windsurf, Grok, Command Code; ChatGPT via the `/mcp/chatgpt` connector. Ordinary web chats
  use the official TinyFish plugins (curated skills, OAuth, no keys). **Our product does not use
  MCP** — it uses the SDK server-side. MCP is for our dev agents.
  Source: https://docs.tinyfish.ai/mcp-integration

## Wallet math for demo day

New accounts start with **$8 wallet funds** (verified: pricing page). Search+Fetch are free.
Agent at $0.016/step ⇒ $8 ≈ **500 steps**. Worst case per research task: 2 agent runs × ~25
steps = ~$0.80. A no-escalation demo run costs **$0.00**. Keep ≥$5 in reserve at all times;
if the wallet drops below that, disable agent escalation (`NEXT_PUBLIC_ENABLE_AGENT=0` equivalent
server check) and ship Search+Fetch only.

## Adapter design (src/server/services/tinyfish/)

```ts
export interface TinyFishService {
  search(input: SearchInput): Promise<SearchOutcome>;          // client.search.query(...) via @tiny-fish/sdk
  fetchPages(input: FetchInput): Promise<FetchOutcome>;        // client.fetch.getContents(...) via @tiny-fish/sdk (batches ≤10)
  runAgent(input: AgentInput): AsyncIterable<AgentEvent>;      // client.agent.stream(...) via @tiny-fish/sdk
}
```

- Wrap `new TinyFish()` (SDK reads `TINYFISH_API_KEY`). SDK types never leak past this module —
  map to contracts types. Method names in `@tiny-fish/sdk` v0.11.0: `search.query()`, `fetch.getContents()`, `agent.stream()`. Timeouts/limits per AGENTS.md.
- **Agent goal template (per supplier site):**
  `"You are on {supplierName}'s website. Find and extract: product range, indicative pricing,
  minimum order quantity, delivery terms/serviceability, credibility signals (certifications,
  years, clients), and contact details. If a field is not stated on the site, return null for
  it — never guess. Return ONLY the structured output."` + `output_schema` with nullable fields.
- **Parallelism rule (cookbook-verified):** one Agent run per site, launched in parallel via
  `Promise.allSettled`; **never** combine multiple sites into one goal. Max 2 runs/task.

## Cookbook patterns we reuse (with sources)

| Pattern | Source project | How OmniDesk uses it |
| --- | --- | --- |
| Parallel per-site agents, `Promise.allSettled`, partial failure tolerated | openbox-deals, lego-hunter, research-sentry, competitor-analysis | Stage 6 escalation + Stage 3 search |
| SSE forwarding of SDK events + 5s heartbeats | openbox-deals (`/api/search/live`), competitor-analysis (`/api/scrape-pricing`) | Our `/api/research` route |
| Live browser iframe from `STREAMING_URL` event | openbox-deals, lego-hunter, competitor-analysis | `agent_live` event → iframe in UI (demo wow) |
| **Search-first URL discovery** (no LLM-generated URLs) | lego-hunter (explicitly "No OpenAI for URL generation") | Supplier URLs come only from real Search results |
| `COMPLETED ≠ success` content validation | lego-hunter, official gotchas list | Post-run validation of agent results |
| Typed `TinyFishError` with codes, no silent nulls | research-sentry `lib/tinyfish.ts` | Our adapter error mapping |
| Aggregator filtering + domain dedupe + ranking | lego-hunter, research-sentry `aggregator.ts` | Stage 4 rank/dedupe |
| No DB, in-memory + Vercel | openbox-deals, lego-hunter | MVP storage decision |
| Stealth profile for protected sites | openbox-deals, research-sentry | Only if a supplier site blocks Fetch/Agent |

Sources: https://github.com/tinyfish-io/tinyfish-cookbook (project READMEs read 2026-11-01:
`competitor-analysis`, `openbox-deals`, `lego-hunter`, `research-sentry`).

## Known gotchas (from official docs)

1. `COMPLETED` runs can still contain "captcha"/"blocked" results — validate content.
2. TypeScript top-level `await` needs `"type": "module"` — or wrap in `async main()`.
3. Fetch: 110s per-URL backend timeout; 120s CDN ceiling; client timeout 150s.
4. Search: don't combine `recency_minutes` with `after_date`/`before_date`.
5. `output_schema`: top level must be an object; lists go in an array field; schema wins over
   the goal wording.
6. `/run` (sync) cannot be cancelled — we only use `/run-sse`.
