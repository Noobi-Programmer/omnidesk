import type {
  ResearchRequest,
  ResearchResponse,
  ResearchPlan,
  SearchResult,
  SourceDocument,
  ExtractedFact,
  ComparisonItem,
  Recommendation,
  MissingInfo,
  ActionDraft,
  SseEventName,
  ApiResponse,
  Warning,
} from "@/lib/contracts";
import { executeSearch } from "../services/tinyfish/search";
import { fetchPageContents } from "../services/tinyfish/fetch";
import { runAgentExtraction } from "../services/tinyfish/agent";
import { getLLMProvider } from "../services/llm";
import { createPlanPrompt } from "../prompts/plan";
import { MockResearchEngine } from "../mock/engine";
import {
  qualifyCandidate,
  parsePromptConstraints,
} from "./qualification";
import {
  extractGroundedSupplierFromSource,
  convertCandidateToComparisonItem,
  type GroundedSupplierCandidate,
} from "./extraction";
import { synthesizeRecommendationsAndActions } from "./synthesis";

export interface ResearchEngine {
  execute(
    request: ResearchRequest,
    onEvent: (event: SseEventName, data: unknown) => void
  ): Promise<ResearchResponse>;
}

export class RealResearchEngine implements ResearchEngine {
  async execute(
    request: ResearchRequest,
    onEvent: (event: SseEventName, data: unknown) => void
  ): Promise<ResearchResponse> {
    const startTime = Date.now();
    const taskId = `QRY-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const warnings: Warning[] = [];

    const mode = request.mode || "standard";
    const constraints = parsePromptConstraints(request.prompt);

    // ----------------------------------------------------
    // STAGE 1: PLANNING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "planning",
      progress: 10,
      message: "Decomposing research objective and parsing hard constraints...",
    });

    const maxSearches = mode === "quick" ? 2 : mode === "deep" ? 5 : 3;
    const maxFetchUrls = mode === "quick" ? 4 : mode === "deep" ? 12 : 6;
    const maxAgentRuns = mode === "deep" ? 2 : mode === "standard" ? 1 : 0;

    // Build targeted search queries
    const plannedQueries: Array<{ id: string; query: string; purpose: string }> = [];

    const geoTerms = constraints.geography || (request.prompt.toLowerCase().includes("eu") ? "Europe" : "India");
    const categoryTerms = constraints.category || "supplier manufacturer";

    plannedQueries.push({
      id: "q1",
      query: `${request.prompt.replace(/[()<>,]/g, " ")} manufacturer`,
      purpose: "Discover primary manufacturer websites",
    });

    if (constraints.targetFormat) {
      plannedQueries.push({
        id: "q2",
        query: `${constraints.targetFormat} ${categoryTerms} plant ${geoTerms}`,
        purpose: "Identify production lines and facility specifications",
      });
    } else {
      plannedQueries.push({
        id: "q2",
        query: `${categoryTerms} commercial MOQ pricing contact ${geoTerms}`,
        purpose: "Extract commercial terms and minimum order quantities",
      });
    }

    if (mode === "deep" || plannedQueries.length < maxSearches) {
      plannedQueries.push({
        id: "q3",
        query: `${categoryTerms} certifications spec sheet PDF ${geoTerms}`,
        purpose: "Technical specifications and regulatory compliance verification",
      });
    }

    const plan: ResearchPlan = {
      objective: `Identify, qualify, and compare ${categoryTerms} matching user specifications in ${geoTerms}`,
      entityType: "supplier",
      queries: plannedQueries.slice(0, maxSearches),
      extractionFields: [
        { key: "product_range", label: "Product Range", kind: "string" },
        { key: "moq", label: "Minimum Order Quantity", kind: "string" },
        { key: "pricing", label: "Pricing", kind: "string" },
        { key: "delivery", label: "Delivery", kind: "string" },
        { key: "credibility", label: "Certifications & Credibility", kind: "string" },
        { key: "contact", label: "Direct Contact Desk", kind: "string" },
      ],
      comparisonCriteria: ["product_range", "moq", "pricing", "delivery", "credibility", "contact"],
      actionHints: [{ type: "email", instruction: "Prepare supplier enquiry draft" }],
      budgets: {
        maxSearches,
        maxFetchUrls,
        maxAgentRuns,
      },
      category: constraints.category,
      geography: constraints.geography,
      hardConstraints: [
        ...(constraints.maxMoq ? [`MOQ < ${constraints.maxMoq.toLocaleString()} units`] : []),
        ...(constraints.targetFormat ? [`Format: ${constraints.targetFormat}`] : []),
        ...constraints.certifications,
      ],
    };

    onEvent("plan", plan);

    // ----------------------------------------------------
    // STAGE 2: SEARCHING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "searching",
      progress: 25,
      message: `Scanning live web via TinyFish Search (${plan.queries.length} targeted queries)...`,
    });

    const searchResults: SearchResult[] = [];
    const searchLocation = constraints.geography?.includes("EU") ? "DE" : "IN";

    for (const q of plan.queries) {
      try {
        const queryResults = await executeSearch({
          query: q.query,
          queryId: q.id,
          location: searchLocation,
          purpose: q.purpose,
        });
        searchResults.push(...queryResults);
      } catch (err) {
        warnings.push({
          code: "SEARCH_QUERY_FAILED",
          message: `Query "${q.query}" failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    // ----------------------------------------------------
    // STAGE 3: ENTITY QUALIFICATION & FILTERING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "ranking",
      progress: 40,
      message: `Analyzing ${searchResults.length} candidates. Filtering articles, directories, and irrelevant domains...`,
    });

    const candidateDomains = new Map<string, { result: SearchResult; isArticle: boolean }>();
    const referenceArticles: SearchResult[] = [];

    for (const res of searchResults) {
      if (candidateDomains.has(res.domain)) continue;

      const qualification = qualifyCandidate(res.title, res.url, res.domain);
      res.isArticle = qualification.isArticle;
      res.isDirectory = qualification.isDirectory;

      if (qualification.isArticle || qualification.isDirectory) {
        referenceArticles.push(res);
      } else {
        candidateDomains.set(res.domain, { result: res, isArticle: false });
      }
    }

    // Top qualified direct supplier domains to fetch
    const qualifiedSuppliers = Array.from(candidateDomains.values())
      .map((c) => c.result)
      .slice(0, maxFetchUrls);

    // Keep up to 2 reference articles for regulatory context
    const urlsToFetch = [
      ...qualifiedSuppliers.map((s) => s.url),
      ...referenceArticles.slice(0, 2).map((a) => a.url),
    ];

    // ----------------------------------------------------
    // STAGE 4: FETCHING WEBPAGES
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "fetching",
      progress: 55,
      message: `Retrieving live site content from ${urlsToFetch.length} sources via TinyFish Fetch...`,
    });

    const fetchOutcome = await fetchPageContents(urlsToFetch);
    const sources: SourceDocument[] = fetchOutcome.sources;
    warnings.push(...fetchOutcome.warnings);

    // Mark articles on sources
    for (const s of sources) {
      const isRef = referenceArticles.some((a) => a.domain === s.domain);
      s.isArticle = isRef;
      onEvent("source", s);
    }

    // ----------------------------------------------------
    // STAGE 5: AGENT ESCALATION (when justified)
    // ----------------------------------------------------
    let agentRunsCount = 0;
    if (maxAgentRuns > 0 && process.env.OMNIDESK_AGENT_ENABLED !== "0") {
      const degradedSupplierSource = sources.find(
        (s) => !s.isArticle && (s.status === "failed" || (s.contentExcerpt?.length || 0) < 150)
      );

      if (degradedSupplierSource) {
        onEvent("progress", {
          stage: "fetching",
          progress: 68,
          message: `Escalating to TinyFish browser agent for ${degradedSupplierSource.domain}...`,
        });

        try {
          agentRunsCount++;
          const agentResult = await runAgentExtraction(
            degradedSupplierSource.url,
            degradedSupplierSource.title,
            {
              onStreamingUrl: (liveUrl) => {
                onEvent("agent_live", {
                  sourceId: degradedSupplierSource.id,
                  url: degradedSupplierSource.url,
                  agentLiveUrl: liveUrl,
                });
              },
            }
          );

          if (agentResult.success && agentResult.data) {
            degradedSupplierSource.status = "ok";
            degradedSupplierSource.fetchedVia = "agent";
            degradedSupplierSource.contentExcerpt = JSON.stringify(agentResult.data);
          }
        } catch {
          warnings.push({
            code: "AGENT_ESCALATION_FAILED",
            message: `Browser agent run failed for ${degradedSupplierSource.domain}`,
          });
        }
      }
    }

    // ----------------------------------------------------
    // STAGE 6: FACT EXTRACTION & VERIFICATION
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "extracting",
      progress: 78,
      message: "Extracting verified product range, MOQ, pricing, and exact quotes...",
    });

    const extractedCandidates: GroundedSupplierCandidate[] = [];
    const supplierSources = sources.filter((s) => !s.isArticle && s.status === "ok");

    for (const src of supplierSources) {
      const candidate = extractGroundedSupplierFromSource(src, constraints);
      if (candidate) {
        extractedCandidates.push(candidate);
      }
    }

    // If fewer than 2 qualified entities found, explain honestly in warnings
    if (extractedCandidates.length < 2) {
      warnings.push({
        code: "LOW_ENTITY_DENSITY",
        message: "Fewer than 2 direct verified suppliers were discoverable from search results for this narrow criteria.",
      });
    }

    const facts: ExtractedFact[] = [];
    const comparison: ComparisonItem[] = [];

    extractedCandidates.forEach((cand, idx) => {
      const { item, facts: candidateFacts } = convertCandidateToComparisonItem(cand, idx);
      comparison.push(item);
      facts.push(...candidateFacts);
    });

    // ----------------------------------------------------
    // STAGE 7: SYNTHESIZING & RECOMMENDATIONS
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "synthesizing",
      progress: 88,
      message: "Benchmarking options against constraints and generating executive decision...",
    });

    const synthesis = synthesizeRecommendationsAndActions(comparison, plan);
    const recommendations: Recommendation[] = synthesis.recommendations;
    const missingInfo: MissingInfo[] = synthesis.missingInfo;

    // ----------------------------------------------------
    // STAGE 8: ACTION DRAFTING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "drafting",
      progress: 96,
      message: "Drafting verified supplier outreach and follow-up tasks...",
    });

    const actionDrafts: ActionDraft[] = synthesis.actionDrafts;

    const durationMs = Date.now() - startTime;

    const response: ResearchResponse = {
      taskId,
      createdAt: now,
      request,
      plan,
      searchResults,
      sources,
      facts,
      comparison,
      recommendations,
      missingInfo,
      conflicts: [],
      actionDrafts,
      stats: {
        durationMs,
        searches: plan.queries.length,
        urlsFetched: sources.length,
        agentRuns: agentRunsCount,
        llmCalls: 0,
        sourcesOk: sources.filter((s) => s.status === "ok").length,
        sourcesFailed: sources.filter((s) => s.status === "failed").length,
      },
      mock: false,
    };

    const envelope: ApiResponse<ResearchResponse> = {
      success: true,
      status: warnings.length > 0 ? "partial" : "ok",
      data: response,
      sources: sources.map((s) => ({ id: s.id, url: s.url, title: s.title })),
      warnings,
      error: null,
    };

    onEvent("progress", {
      stage: "done",
      progress: 100,
      message: "Research completed successfully.",
    });

    onEvent("result", envelope);
    return response;
  }
}

export function getResearchEngine(): ResearchEngine {
  if (process.env.DEMO_MODE === "1") {
    return new MockResearchEngine();
  }
  return new RealResearchEngine();
}
