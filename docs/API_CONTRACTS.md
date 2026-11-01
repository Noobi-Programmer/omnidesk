# API Contracts

Single source of truth for every type. Workstream C materializes these verbatim in
`src/lib/contracts/index.ts` in M0; A and B import from there. The mock and the real engine
produce identical shapes.

## Response envelope (every non-SSE endpoint)

```ts
type ApiStatus = 'ok' | 'partial' | 'error';

interface ApiResponse<T> {
  success: boolean;            // true iff status !== 'error'
  status: ApiStatus;           // 'partial' = completed with warnings (degraded sources)
  data: T | null;
  sources: SourceRef[];        // non-empty when data carries factual claims
  warnings: Warning[];         // { code: string; message: string; sourceId?: string }
  error: ApiError | null;      // { code: ErrorCode; message: string; retryable: boolean }
}
```

## Core domain types

```ts
type ResearchMode = 'quick' | 'standard' | 'deep';

interface ResearchRequest {
  prompt: string;                       // 1..2000 chars, zod-validated
  mode: ResearchMode;                   // default 'standard'
  context?: {
    businessContext?: string;           // e.g. "small D2C brand"
    locale?: string;                    // default 'en-IN'
    constraints?: string[];             // e.g. ["eco-friendly materials preferred"]
  };
}

interface PlannedQuery { id: string; query: string; purpose: string; }

interface ResearchPlan {
  objective: string;
  entityType: 'supplier' | 'competitor' | 'product' | 'service' | 'general';
  queries: PlannedQuery[];              // 1..8 by mode
  extractionFields: ExtractionField[];  // schema for ExtractedFacts
  comparisonCriteria: string[];
  actionHints: { type: 'email' | 'task'; instruction: string }[];
  budgets: { maxSearches: number; maxFetchUrls: number; maxAgentRuns: number };
}

interface ExtractionField { key: string; label: string; kind: 'string' | 'number' | 'boolean' | 'enum'; enumValues?: string[]; }

interface SearchResult {
  id: string; queryId: string; position: number;
  title: string; url: string; domain: string; snippet: string;
}

interface SourceDocument {
  id: string; url: string; finalUrl?: string; domain: string; title: string;
  retrievedVia: 'search' | 'user';
  fetchedVia: 'fetch' | 'agent' | 'not_fetched';
  contentExcerpt?: string;           // first ~500 chars, debug/trace
  fetchedAt?: string;                // ISO 8601
  status: 'pending' | 'ok' | 'degraded' | 'failed';
  agentLiveUrl?: string;             // STREAMING_URL for iframe, agent runs only
}

interface ExtractedFact {
  id: string; sourceId: string; field: string;
  value: string | number | boolean | null;   // null = not_found
  status: 'found' | 'not_found';
  quote?: string;                    // verbatim supporting quote
  confidence: 'high' | 'medium' | 'low';
}

interface ComparisonItem {
  id: string; name: string; website?: string; sourceIds: string[];
  facts: Record<string, string>;     // fieldKey -> "value" | "Not found" | "Conflicting"
  evidenceScore: number;             // 0..100: sources × fields found × confidence
  redFlags?: string[];
}

interface Recommendation {
  rank: number; itemId: string; rationale: string;
  risks: string[]; confidence: 'high' | 'medium' | 'low';
  supportedBy: string[];              // factIds
}

interface MissingInfo { itemId?: string; field: string; whyItMatters: string; }

interface Conflict { field: string; itemId: string; claims: { factId: string; sourceId: string; value: string }[]; }

type ActionStatus = 'awaiting_approval' | 'approved' | 'dismissed';

interface ActionDraft {
  id: string; type: 'email' | 'task';
  title: string;
  payload:
    | { kind: 'email'; to: string | null; subject: string; body: string; mailto?: string }
    | { kind: 'task'; dueHint: string; description: string };
  riskLevel: 'low' | 'medium';
  status: ActionStatus;
  requiresApproval: true;             // always true in MVP
  itemId?: string;                    // link to ComparisonItem
}

interface ResearchStats {
  durationMs: number; searches: number; urlsFetched: number;
  agentRuns: number; llmCalls: number; sourcesOk: number; sourcesFailed: number;
}

interface ResearchResponse {
  taskId: string;                     // uuid
  createdAt: string;                  // ISO 8601
  request: ResearchRequest;
  plan: ResearchPlan;
  searchResults: SearchResult[];
  sources: SourceDocument[];
  facts: ExtractedFact[];
  comparison: ComparisonItem[];
  recommendations: Recommendation[];
  missingInfo: MissingInfo[];
  conflicts: Conflict[];
  actionDrafts: ActionDraft[];
  stats: ResearchStats;
  mock: boolean;                      // true when produced by MockResearchEngine
}
```

## SSE protocol — `POST /api/research`

Request body: `ApiResponse`-less raw `ResearchRequest` (validated). Response:
`text/event-stream`. Event names + JSON payloads:

| Event | Payload | When |
| --- | --- | --- |
| `progress` | `{ stage, progress (0..100), message, detail?: object }` | every stage transition / notable step |
| `plan` | `ResearchPlan` | after planning |
| `source` | `SourceDocument` (status update) | each fetch/agent status change |
| `agent_live` | `{ sourceId, url, agentLiveUrl }` | on Agent `STREAMING_URL` |
| `warning` | `Warning` | degraded source, agent budget spent, etc. |
| `result` | `ApiResponse<ResearchResponse>` | final (status may be `partial`) |
| `error` | `ApiResponse<null>` | fatal |

Stages: `planning → searching → ranking → fetching → extracting → synthesizing → drafting → done`.
Heartbeat: SSE comment `: ping` every 5s (cookbook pattern). Client reconnect is not needed in
MVP (single-shot run); the final `result` event is the durable payload, persisted client-side.

## Endpoints

| Method + Path | Purpose | Request → Response |
| --- | --- | --- |
| `POST /api/research` | Run pipeline, stream progress | `ResearchRequest` → SSE above |
| `POST /api/actions/{id}/decision` | Approve/dismiss an ActionDraft | `{ decision: 'approve' \| 'dismiss', editedPayload? }` → `ApiResponse<{ id, status, auditId }>`; approve returns `mailto` for emails; **never sends** |
| `GET /api/history` | (client-side helper contract) history summaries from `HistoryStore` | — (localStorage; server route only in future Supabase mode) |
| `GET /api/health` | Env readiness | → `ApiResponse<{ tinyfish: boolean; llm: boolean; mock: boolean; agentEnabled: boolean }>` |

`GET /api/research/{taskId}` and `GET /api/history` server routes are **future** (Supabase mode)
and intentionally not in the MVP surface.

## Sample response — supplier research (trimmed to 2 suppliers)

```json
{
  "success": true,
  "status": "partial",
  "data": {
    "taskId": "r-7f3c9e2a",
    "createdAt": "2026-11-01T09:41:12.000Z",
    "request": { "prompt": "Find five reliable packaging suppliers in Bengaluru...", "mode": "standard" },
    "plan": {
      "objective": "Identify and compare packaging suppliers in Bengaluru for a small D2C brand",
      "entityType": "supplier",
      "queries": [
        { "id": "q1", "query": "packaging suppliers manufacturers Bengaluru", "purpose": "discover supplier websites" },
        { "id": "q2", "query": "Bengaluru packaging company MOQ pricing custom boxes", "purpose": "surface commercial terms" }
      ],
      "extractionFields": [
        { "key": "product_range", "label": "Product range", "kind": "string" },
        { "key": "pricing", "label": "Indicative pricing", "kind": "string" },
        { "key": "moq", "label": "Minimum order quantity", "kind": "string" },
        { "key": "delivery", "label": "Delivery terms", "kind": "string" },
        { "key": "credibility", "label": "Credibility signals", "kind": "string" },
        { "key": "contact", "label": "Contact details", "kind": "string" }
      ],
      "comparisonCriteria": ["range", "price", "moq", "delivery", "credibility", "contact"],
      "actionHints": [
        { "type": "email", "instruction": "Enquiry email to the top-ranked supplier asking for catalogue, MOQ and unit pricing" },
        { "type": "task", "instruction": "Follow up in 3 business days if no reply" }
      ],
      "budgets": { "maxSearches": 8, "maxFetchUrls": 20, "maxAgentRuns": 2 }
    },
    "searchResults": [
      { "id": "sr-01", "queryId": "q1", "position": 1, "title": "EcoPack Solutions Bengaluru", "url": "https://example-ecopack.in/", "domain": "example-ecopack.in", "snippet": "Custom eco-friendly packaging for D2C brands..." }
    ],
    "sources": [
      { "id": "s-01", "url": "https://example-ecopack.in/", "domain": "example-ecopack.in", "title": "EcoPack Solutions", "retrievedVia": "search", "fetchedVia": "fetch", "status": "ok", "fetchedAt": "2026-11-01T09:40:58.000Z" },
      { "id": "s-02", "url": "https://example-printpack.co.in/products", "domain": "example-printpack.co.in", "title": "PrintPack Industries — Products", "retrievedVia": "search", "fetchedVia": "agent", "status": "ok", "agentLiveUrl": "https://agent.tinyfish.ai/runs/.../stream" }
    ],
    "facts": [
      { "id": "f-001", "sourceId": "s-01", "field": "moq", "value": "500 units per SKU", "status": "found", "quote": "Minimum order of 500 units per design", "confidence": "high" },
      { "id": "f-002", "sourceId": "s-01", "field": "pricing", "value": null, "status": "not_found", "confidence": "low" },
      { "id": "f-003", "sourceId": "s-02", "field": "moq", "value": "250 units", "status": "found", "quote": "MOQ starts at 250 pieces", "confidence": "medium" }
    ],
    "comparison": [
      { "id": "c-01", "name": "EcoPack Solutions", "website": "https://example-ecopack.in/", "sourceIds": ["s-01"], "facts": { "product_range": "Kraft boxes, mailers, custom prints", "pricing": "Not found", "moq": "500 units per SKU", "delivery": "Pan-India, 5–7 days", "credibility": "FSSAI-compliant materials; 9 yrs", "contact": "sales@example-ecopack.in" }, "evidenceScore": 74 },
      { "id": "c-02", "name": "PrintPack Industries", "website": "https://example-printpack.co.in/", "sourceIds": ["s-02"], "facts": { "product_range": "Corrugated boxes, labels", "pricing": "₹18–₹40 per unit (boxes)", "moq": "250 units", "delivery": "Karnataka 48h; rest 7 days", "credibility": "ISO 9001; 12 yrs", "contact": "+91 80 4xxx xxxx" }, "evidenceScore": 82 }
    ],
    "recommendations": [
      { "rank": 1, "itemId": "c-02", "rationale": "Lowest MOQ and the only supplier with published indicative pricing; ISO-certified with 12 years operating history.", "risks": ["Pricing from a single page; confirm in writing"], "confidence": "medium", "supportedBy": ["f-003"] },
      { "rank": 2, "itemId": "c-01", "rationale": "Strong eco-positioning fit for the brand context; MOQ is higher and pricing unpublished.", "risks": ["Pricing requires direct enquiry"], "confidence": "medium", "supportedBy": ["f-001"] }
    ],
    "missingInfo": [
      { "itemId": "c-01", "field": "pricing", "whyItMatters": "Cannot rank on cost without a quote" }
    ],
    "conflicts": [],
    "actionDrafts": [
      { "id": "a-01", "type": "email", "title": "Enquiry to PrintPack Industries", "payload": { "kind": "email", "to": null, "subject": "Enquiry: custom packaging for a small D2C brand", "body": "Hello PrintPack team,\n\nWe are a small D2C brand looking for a packaging partner..." }, "riskLevel": "medium", "status": "awaiting_approval", "requiresApproval": true, "itemId": "c-02" },
      { "id": "a-02", "type": "task", "title": "Follow up with PrintPack Industries", "payload": { "kind": "task", "dueHint": "in 3 business days", "description": "If no reply to the enquiry, call +91 80 4xxx xxxx" }, "riskLevel": "low", "status": "awaiting_approval", "requiresApproval": true, "itemId": "c-02" }
    ],
    "stats": { "durationMs": 92000, "searches": 2, "urlsFetched": 9, "agentRuns": 1, "llmCalls": 7, "sourcesOk": 5, "sourcesFailed": 1 },
    "mock": false
  },
  "sources": [],
  "warnings": [
    { "code": "SOURCE_FAILED", "message": "example-oldsupplier.in timed out during fetch", "sourceId": "s-05" },
    { "code": "AGENT_BUDGET", "message": "Agent escalation skipped for 1 site (budget: 2 runs)" }
  ],
  "error": null
}
```

## Mock parity rule

`MockResearchEngine` must emit the same SSE sequence and a fixture `ResearchResponse` with
`mock: true`, one `not_found`, one `SOURCE_FAILED` warning, and a simulated `agent_live` event.
Any frontend code branching on `mock` other than a UI badge is a contract violation.
