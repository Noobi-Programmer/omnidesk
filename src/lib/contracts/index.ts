import { z } from "zod";

// ==========================================
// 1. Envelopes and Common Types
// ==========================================

export type ApiStatus = "ok" | "partial" | "error";

export interface Warning {
  code: string;
  message: string;
  sourceId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
  details?: unknown;
}

export interface SourceRef {
  id: string;
  url: string;
  title: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status: ApiStatus;
  data: T | null;
  sources: SourceRef[];
  warnings: Warning[];
  error: ApiError | null;
}

// ==========================================
// 2. Research Domain Types
// ==========================================

export type ResearchMode = "quick" | "standard" | "deep";

export const ResearchModeSchema = z.enum(["quick", "standard", "deep"]);

export const ResearchRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  mode: ResearchModeSchema.default("standard"),
  context: z
    .object({
      businessContext: z.string().optional(),
      locale: z.string().default("en-IN"),
      constraints: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export interface PlannedQuery {
  id: string;
  query: string;
  purpose: string;
}

export interface ExtractionField {
  key: string;
  label: string;
  kind: "string" | "number" | "boolean" | "enum";
  enumValues?: string[];
}

export interface ResearchPlan {
  objective: string;
  entityType: "supplier" | "competitor" | "product" | "service" | "general";
  queries: PlannedQuery[];
  extractionFields: ExtractionField[];
  comparisonCriteria: string[];
  actionHints: { type: "email" | "task"; instruction: string }[];
  budgets: {
    maxSearches: number;
    maxFetchUrls: number;
    maxAgentRuns: number;
  };
  category?: string;
  geography?: string;
  hardConstraints?: string[];
  softPreferences?: string[];
}

export interface SearchResult {
  id: string;
  queryId: string;
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  isArticle?: boolean;
  isDirectory?: boolean;
}

export interface SourceDocument {
  id: string;
  url: string;
  finalUrl?: string;
  domain: string;
  title: string;
  retrievedVia: "search" | "user";
  fetchedVia: "fetch" | "agent" | "not_fetched";
  contentExcerpt?: string;
  fetchedAt?: string;
  status: "pending" | "ok" | "degraded" | "failed";
  agentLiveUrl?: string;
  isArticle?: boolean;
  isDirectory?: boolean;
}

export type EvidenceStatus = "verified" | "unverified" | "not_found" | "does_not_meet";

export interface EvidenceField<T = string> {
  value: T | null;
  status: EvidenceStatus;
  sourceUrl?: string;
  sourceTitle?: string;
  supportingQuote?: string;
  retrievedAt?: string;
  constraintFit?: "meets" | "partial" | "does_not_meet" | "unknown";
}

export interface ExtractedFact {
  id: string;
  sourceId: string;
  field: string;
  value: string | number | boolean | null; // null = not_found
  status: "found" | "not_found";
  quote?: string;
  confidence: "high" | "medium" | "low";
  evidenceStatus?: EvidenceStatus;
  sourceUrl?: string;
  sourceTitle?: string;
  retrievedAt?: string;
  constraintViolated?: boolean;
}

export interface FactDetail {
  value: string | null;
  status: "found" | "not_found";
  quote?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface ComparisonItem {
  id: string;
  name: string;
  website?: string;
  sourceIds: string[];
  facts: Record<string, string>; // fieldKey -> "value" | "Not found" | "Conflicting"
  factDetails?: Record<string, FactDetail>;
  evidenceScore: number; // 0..100
  evidenceSummary?: {
    verifiedCount: number;
    totalCount: number;
  };
  isQualifiedSupplier?: boolean;
  qualificationReason?: string;
  redFlags?: string[];
  entityType?: "manufacturer" | "supplier" | "distributor" | "other";
  location?: string;
  constraintFit?: "meets" | "partial" | "does_not_meet" | "unknown";
  statusBadge?: "verified" | "unverified" | "missing_info" | "does_not_meet";
  email?: string | null;
  specSheetUrl?: string | null;
  specSheetLabel?: string | null;
  evidenceFields?: Record<string, EvidenceField<string>>;
}

export interface Recommendation {
  rank: number;
  itemId: string;
  rationale: string;
  risks: string[];
  confidence: "high" | "medium" | "low";
  supportedBy: string[]; // factIds
  compliesWithHardConstraints?: boolean;
}

export interface MissingInfo {
  itemId?: string;
  field: string;
  whyItMatters: string;
}

export interface Conflict {
  field: string;
  itemId: string;
  claims: { factId: string; sourceId: string; value: string }[];
}

export type ActionStatus = "awaiting_approval" | "approved" | "dismissed";

export interface EmailActionPayload {
  kind: "email";
  to: string | null;
  subject: string;
  body: string;
  mailto?: string;
  canSendDirectly?: boolean;
  contactPageUrl?: string;
  specsSummary?: string;
}

export interface TaskActionPayload {
  kind: "task";
  dueHint: string;
  description: string;
}

export interface ActionDraft {
  id: string;
  type: "email" | "task";
  title: string;
  payload: EmailActionPayload | TaskActionPayload;
  riskLevel: "low" | "medium";
  status: ActionStatus;
  requiresApproval: true;
  itemId?: string;
}

export interface ResearchStats {
  durationMs: number;
  searches: number;
  urlsFetched: number;
  agentRuns: number;
  llmCalls: number;
  sourcesOk: number;
  sourcesFailed: number;
}

export interface ResearchResponse {
  taskId: string;
  createdAt: string;
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
  mock: boolean;
  qualifiedCount?: number;
  isSufficient?: boolean;
}

// ==========================================
// 3. SSE Protocol Types & Stages
// ==========================================

export type ResearchStage =
  | "planning"
  | "searching"
  | "ranking"
  | "fetching"
  | "extracting"
  | "synthesizing"
  | "drafting"
  | "done";

export interface ProgressEventPayload {
  stage: ResearchStage;
  progress: number; // 0..100
  message: string;
  detail?: Record<string, unknown>;
}

export interface AgentLiveEventPayload {
  sourceId: string;
  url: string;
  agentLiveUrl: string;
}

export type SseEventName =
  | "progress"
  | "plan"
  | "source"
  | "agent_live"
  | "warning"
  | "result"
  | "error";

// Action Decision Contract
export const ActionDecisionRequestSchema = z.object({
  decision: z.enum(["approve", "dismiss"]),
  editedPayload: z
    .object({
      to: z.string().nullable().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      dueHint: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export type ActionDecisionRequest = z.infer<typeof ActionDecisionRequestSchema>;

export interface ActionDecisionResponse {
  id: string;
  status: ActionStatus;
  auditId: string;
  mailto?: string;
}

export interface ResearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
  response: ResearchResponse;
}
