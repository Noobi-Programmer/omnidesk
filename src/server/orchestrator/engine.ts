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
  ResearchIntent,
  ResearchReport,
  ResearchCitation,
} from "@/lib/contracts";
import { executeSearch } from "../services/tinyfish/search";
import { fetchPageContents } from "../services/tinyfish/fetch";
import { MockResearchEngine } from "../mock/engine";
import {
  qualifyCandidate,
  parsePromptConstraints,
} from "./qualification";
import {
  extractGroundedSupplierFromSource,
  convertCandidateToComparisonItem,
  extractGroundedGeneralEntityFromSource,
  convertGeneralCandidateToComparisonItem,
  type GroundedSupplierCandidate,
  type GroundedGeneralCandidate,
} from "./extraction";
import { synthesizeRecommendationsAndActions } from "./synthesis";
import { detectIntentFromPrompt } from "../prompts/plan";
import { getLLMProvider, type LLMProvider } from "../services/llm";
import { z } from "zod";

const LLMDeepReportSchema = z.object({
  title: z.string().describe("Descriptive research report title"),
  executiveSummary: z.string().describe("Comprehensive executive summary synthesizing the investigation"),
  methodology: z.string().describe("Explanation of search queries and fetched sources analyzed"),
  keyFindings: z.array(z.string()).min(2).max(8).describe("Core factual bullet points discovered"),
  sections: z.array(
    z.object({
      heading: z.string(),
      content: z.string().describe("Detailed markdown section with inline citations like [cite-1]"),
      citationIds: z.array(z.string()).describe("List of citation IDs referenced in this section"),
    })
  ).min(2),
  relevantEntities: z.array(
    z.object({
      name: z.string(),
      type: z.string().describe("e.g. Startup, Enterprise, VC Fund, Research Lab, Framework"),
      description: z.string(),
      sourceUrl: z.string().optional(),
    })
  ).optional().default([]),
  statisticsAndEvidence: z.array(
    z.object({
      claim: z.string(),
      value: z.string(),
      sourceUrl: z.string(),
      sourceTitle: z.string().optional().default("Source"),
      quote: z.string().optional(),
    })
  ).optional().default([]),
  conflictsAndUncertainties: z.array(z.string()).optional().default([]),
  implicationsAndConclusions: z.array(z.string()).min(1).describe("Strategic conclusions and next steps"),
});

async function synthesizeDeepReportWithLLM(
  provider: LLMProvider,
  request: ResearchRequest,
  plan: ResearchPlan,
  usableSources: SourceDocument[],
  facts: ExtractedFact[]
): Promise<ResearchReport> {
  const now = new Date().toISOString();
  const citations: ResearchCitation[] = usableSources.map((s, idx) => ({
    id: `cite-${idx + 1}`,
    sourceUrl: s.url,
    sourceTitle: s.title || s.domain,
    domain: s.domain,
    snippet: s.contentExcerpt ? s.contentExcerpt.slice(0, 240) + "..." : "Retrieved via TinyFish Fetch.",
    retrievedAt: s.fetchedAt || now,
  }));

  const sourcesText = usableSources
    .map((s, idx) => {
      const cid = `cite-${idx + 1}`;
      // Bounded source budget: ~3,500 chars per fetched source
      const excerpt = (s.content || s.contentExcerpt || "").slice(0, 3500);
      return `[${cid}] Title: ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\nContent:\n${excerpt}\n---`;
    })
    .join("\n\n");

  const factsText = facts
    .filter((f) => f.status === "found" && f.quote)
    .slice(0, 15)
    .map((f) => `- ${f.field}: "${f.quote}" (${f.sourceTitle || f.sourceUrl})`)
    .join("\n");

  const systemInstruction = `You are OmniDesk's Deep Research Intelligence Engine.
Synthesize verified, multi-source research into an executive-grade intelligence report.

STRICT ACCURACY & GROUNDING RULES:
1. Rely EXCLUSIVELY on the provided source excerpts.
2. NEVER invent, hallucinate, or extrapolate companies, founders, funding amounts, dates, investors, or metrics.
3. Every factual claim MUST include an inline citation tag matching the numbered source list, e.g. [cite-1], [cite-2].
4. Restrict all citations strictly to the URLs provided in the source list.
5. If information is unavailable, missing, or contradictory across sources, explicitly document it in conflictsAndUncertainties.
6. Section content MUST be formatted in clean Markdown (headings, lists, bold text, tables where appropriate).
7. If the research is about startups, technology, competitors, or markets, do NOT include manufacturing MOQs, supplier pricing, or factory sample requests unless explicitly asked.`;

  const prompt = `Research Question: "${request.prompt}"
Intent: ${plan.intent}
Objective: ${plan.objective}

Successfully Fetched Primary Sources (${usableSources.length} sources):
${sourcesText}

Extracted Factual Claims:
${factsText || "None extracted via regex."}

Generate the structured deep research report conforming strictly to the requested schema.`;

  const llmResult = await provider.complete({
    prompt,
    systemInstruction,
    schema: LLMDeepReportSchema,
    temperature: 0.1,
  });

  const validCitationIdSet = new Set(citations.map((c) => c.id));
  const validUrlSet = new Set(citations.map((c) => c.sourceUrl));

  const sanitizedSections = llmResult.sections.map((sec, idx) => ({
    id: `sec-${idx + 1}`,
    heading: sec.heading,
    content: sec.content,
    citationIds: (sec.citationIds || []).filter((id) => validCitationIdSet.has(id)),
  }));

  const sanitizedEvidence = (llmResult.statisticsAndEvidence || [])
    .filter((ev) => validUrlSet.has(ev.sourceUrl))
    .map((ev) => ({
      claim: ev.claim,
      value: ev.value,
      sourceUrl: ev.sourceUrl,
      sourceTitle: ev.sourceTitle || "Source",
      quote: ev.quote,
    }));

  return {
    id: `rep-${Math.random().toString(36).substring(2, 9)}`,
    title: llmResult.title || `Deep Research Report: ${request.prompt.slice(0, 60)}`,
    objective: plan.objective,
    executiveSummary: llmResult.executiveSummary,
    methodology: llmResult.methodology,
    keyFindings: llmResult.keyFindings,
    sections: sanitizedSections,
    relevantEntities: llmResult.relevantEntities || [],
    statisticsAndEvidence: sanitizedEvidence,
    conflictsAndUncertainties: llmResult.conflictsAndUncertainties || [],
    implicationsAndConclusions: llmResult.implicationsAndConclusions,
    citations,
    createdAt: now,
  };
}

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

    // ----------------------------------------------------
    // PRE-FLIGHT VALIDATION: Credentials & Provider checks
    // ----------------------------------------------------
    if (!process.env.TINYFISH_API_KEY || !process.env.TINYFISH_API_KEY.trim()) {
      const errMsg = "TINYFISH_API_KEY is not configured. Please set your TinyFish API key to run research.";
      onEvent("progress", {
        stage: "failed",
        progress: 0,
        message: errMsg,
      });
      onEvent("error", {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: {
          code: "MISSING_TINYFISH_KEY",
          message: errMsg,
          retryable: false,
        },
      });
      throw new Error(errMsg);
    }

    const llmProvider = getLLMProvider();
    if (mode === "deep" && llmProvider.name === "mock") {
      const errMsg = "AI synthesis unavailable: GEMINI_API_KEY or GROQ_API_KEY is required for Deep Research mode. Please configure your LLM provider key.";
      onEvent("progress", {
        stage: "failed",
        progress: 15,
        message: errMsg,
      });
      onEvent("error", {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: {
          code: "LLM_CONFIG_ERROR",
          message: errMsg,
          retryable: false,
        },
      });
      throw new Error(errMsg);
    }

    const intent: ResearchIntent = detectIntentFromPrompt(request.prompt);
    const constraints = parsePromptConstraints(request.prompt);

    const maxSearches = mode === "quick" ? 2 : mode === "deep" ? 5 : 3;
    const maxFetchUrls = mode === "quick" ? 4 : mode === "deep" ? 12 : 6;

    // ----------------------------------------------------
    // STAGE 1: PLANNING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "planning",
      progress: 10,
      message: `Decomposing ${intent} research objective into ${maxSearches} targeted queries...`,
    });

    const cleanPrompt = request.prompt.replace(/[()<>,]/g, " ").trim();
    const plannedQueries: Array<{ id: string; query: string; purpose: string }> = [];

    if (intent === "supplier") {
      const geoTerms = constraints.geography || (request.prompt.toLowerCase().includes("eu") ? "Europe" : "India");
      const categoryTerms = constraints.category || "supplier manufacturer";

      plannedQueries.push({
        id: "q1",
        query: `${cleanPrompt} manufacturer`,
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

      plannedQueries.push({
        id: "q3",
        query: `${categoryTerms} certifications spec sheet PDF ${geoTerms}`,
        purpose: "Technical specifications and regulatory compliance verification",
      });

      if (maxSearches >= 4) {
        plannedQueries.push({
          id: "q4",
          query: `${cleanPrompt} packaging suppliers MOQ catalog`,
          purpose: "Expand candidate pool for commercial tier comparison",
        });
      }
      if (maxSearches >= 5) {
        plannedQueries.push({
          id: "q5",
          query: `${cleanPrompt} trade export factory contact`,
          purpose: "Direct factory contact and export capabilities",
        });
      }
    } else if (intent === "startup") {
      plannedQueries.push({
        id: "q1",
        query: `${cleanPrompt} startups funding founders`,
        purpose: "Identify leading startups and founding teams in this space",
      });
      plannedQueries.push({
        id: "q2",
        query: `${cleanPrompt} seed series a investments valuations 2025`,
        purpose: "Analyze recent funding rounds, valuations, and venture capital deals",
      });
      plannedQueries.push({
        id: "q3",
        query: `${cleanPrompt} customer traction revenue business model`,
        purpose: "Examine market traction, monetization, and growth benchmarks",
      });
      if (maxSearches >= 4) {
        plannedQueries.push({
          id: "q4",
          query: `${cleanPrompt} Y Combinator accelerator portfolio`,
          purpose: "Explore accelerator batch announcements and alumni",
        });
      }
      if (maxSearches >= 5) {
        plannedQueries.push({
          id: "q5",
          query: `${cleanPrompt} venture capital investors perspectives`,
          purpose: "Synthesize VC thesis, market dynamics, and competitive moats",
        });
      }
    } else if (intent === "competitor") {
      plannedQueries.push({
        id: "q1",
        query: `${cleanPrompt} top competitors alternatives`,
        purpose: "Map key players and competitive alternatives in market",
      });
      plannedQueries.push({
        id: "q2",
        query: `${cleanPrompt} feature comparison pricing tiers`,
        purpose: "Compare product features, tiers, and commercial terms",
      });
      plannedQueries.push({
        id: "q3",
        query: `${cleanPrompt} customer reviews pros cons limitations`,
        purpose: "Inspect customer sentiment, edge cases, and product limitations",
      });
      if (maxSearches >= 4) {
        plannedQueries.push({
          id: "q4",
          query: `${cleanPrompt} market share enterprise adoption`,
          purpose: "Evaluate enterprise penetration and market share",
        });
      }
      if (maxSearches >= 5) {
        plannedQueries.push({
          id: "q5",
          query: `${cleanPrompt} roadmap announcements 2025`,
          purpose: "Examine product updates and emerging strategic pivots",
        });
      }
    } else {
      // General / Technology / Market / Company research
      plannedQueries.push({
        id: "q1",
        query: `${cleanPrompt} overview key findings`,
        purpose: "Core overview and landscape investigation",
      });
      plannedQueries.push({
        id: "q2",
        query: `${cleanPrompt} data statistics research analysis`,
        purpose: "Quantitative evidence, statistics, and industry data",
      });
      plannedQueries.push({
        id: "q3",
        query: `${cleanPrompt} technical analysis benchmarks architecture`,
        purpose: "Deep technical architecture and performance evaluation",
      });
      if (maxSearches >= 4) {
        plannedQueries.push({
          id: "q4",
          query: `${cleanPrompt} challenges regulations risks`,
          purpose: "Identify regulatory risks, limitations, and uncertainties",
        });
      }
      if (maxSearches >= 5) {
        plannedQueries.push({
          id: "q5",
          query: `${cleanPrompt} developments future outlook 2025`,
          purpose: "Latest strategic developments and forward-looking implications",
        });
      }
    }

    const queriesToRun = plannedQueries.slice(0, maxSearches);

    const plan: ResearchPlan = {
      objective:
        intent === "supplier"
          ? `Identify, qualify, and compare verified suppliers for: "${request.prompt.slice(0, 80)}"`
          : `Deep multi-source research into: "${request.prompt.slice(0, 80)}"`,
      entityType: intent === "supplier" ? "supplier" : intent === "competitor" ? "competitor" : "general",
      intent,
      queries: queriesToRun,
      extractionFields:
        intent === "supplier"
          ? [
              { key: "product_range", label: "Product Range", kind: "string" },
              { key: "moq", label: "Minimum Order Quantity", kind: "string" },
              { key: "pricing", label: "Pricing", kind: "string" },
              { key: "delivery", label: "Delivery", kind: "string" },
              { key: "credibility", label: "Certifications", kind: "string" },
              { key: "contact", label: "Direct Contact Desk", kind: "string" },
            ]
          : [
              { key: "key_findings", label: "Core Takeaway", kind: "string" },
              { key: "quantitative_data", label: "Statistics & Metrics", kind: "string" },
              { key: "timeline_or_milestone", label: "Key Timeline & Date", kind: "string" },
            ],
      comparisonCriteria:
        intent === "supplier"
          ? ["product_range", "moq", "pricing", "delivery", "credibility", "contact"]
          : ["key_findings", "quantitative_data", "timeline_or_milestone"],
      actionHints: [{ type: "task", instruction: "Review grounded findings and synthesize decision" }],
      budgets: {
        maxSearches: queriesToRun.length,
        maxFetchUrls,
        maxAgentRuns: 0,
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
      message: `Scanning live web via TinyFish Search (${queriesToRun.length} targeted queries)...`,
    });

    const searchResults: SearchResult[] = [];
    const searchErrors: Array<{ query: string; error: string }> = [];
    const searchLocation = constraints.geography?.includes("EU") ? "DE" : "IN";

    for (const q of queriesToRun) {
      try {
        const queryResults = await executeSearch({
          query: q.query,
          queryId: q.id,
          location: searchLocation,
          purpose: q.purpose,
          intent,
        });
        searchResults.push(...queryResults);
      } catch (err) {
        const errStr = err instanceof Error ? err.message : String(err);
        searchErrors.push({ query: q.query, error: errStr });
        warnings.push({
          code: "SEARCH_QUERY_FAILED",
          message: `Query "${q.query}" failed: ${errStr}`,
        });
      }
    }

    if (searchErrors.length === queriesToRun.length && searchResults.length === 0) {
      const sampleErr = searchErrors[0]?.error || "TinyFish search failed";
      const errMsg = `TinyFish Search failed for all queries: ${sampleErr}`;
      onEvent("progress", {
        stage: "failed",
        progress: 25,
        message: errMsg,
      });
      onEvent("error", {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings,
        error: {
          code: "SEARCH_FAILED",
          message: errMsg,
          retryable: true,
        },
      });
      throw new Error(errMsg);
    }

    if (searchResults.length === 0) {
      const errMsg = `No relevant websites discovered. TinyFish Search returned zero results for query: "${request.prompt.slice(0, 60)}"`;
      onEvent("progress", {
        stage: "failed",
        progress: 30,
        message: errMsg,
      });
      onEvent("error", {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings,
        error: {
          code: "ZERO_SEARCH_RESULTS",
          message: errMsg,
          retryable: true,
        },
      });
      throw new Error(errMsg);
    }

    // ----------------------------------------------------
    // STAGE 3: ENTITY QUALIFICATION & FILTERING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "ranking",
      progress: 40,
      message: `Analyzing and ranking ${searchResults.length} candidate sources...`,
    });

    const candidateDomains = new Map<string, { result: SearchResult; isArticle: boolean }>();
    const referenceArticles: SearchResult[] = [];

    for (const res of searchResults) {
      if (candidateDomains.has(res.domain)) continue;

      if (intent === "supplier") {
        const qualification = qualifyCandidate(res.title, res.url, res.domain);
        res.isArticle = qualification.isArticle;
        res.isDirectory = qualification.isDirectory;

        if (qualification.isArticle || qualification.isDirectory) {
          referenceArticles.push(res);
        } else {
          candidateDomains.set(res.domain, { result: res, isArticle: false });
        }
      } else {
        // General / startup / competitor / tech research: KEEP high-quality editorial, news, and analysis
        candidateDomains.set(res.domain, { result: res, isArticle: res.isArticle || false });
      }
    }

    let urlsToFetch: string[] = [];

    if (intent === "supplier") {
      const qualifiedSuppliers = Array.from(candidateDomains.values())
        .map((c) => c.result)
        .slice(0, maxFetchUrls);

      urlsToFetch = [
        ...qualifiedSuppliers.map((s) => s.url),
        ...referenceArticles.slice(0, 2).map((a) => a.url),
      ];
    } else {
      urlsToFetch = Array.from(candidateDomains.values())
        .map((c) => c.result.url)
        .slice(0, maxFetchUrls);
    }

    // ----------------------------------------------------
    // STAGE 4: FETCHING WEBPAGES (TinyFish Fetch)
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "fetching",
      progress: 55,
      message: `Retrieving clean page text from ${urlsToFetch.length} sources via TinyFish Fetch...`,
    });

    const fetchOutcome = await fetchPageContents(urlsToFetch);
    const sources: SourceDocument[] = fetchOutcome.sources;
    warnings.push(...fetchOutcome.warnings);

    // Filter usable sources
    const usableSources = sources.filter(
      (s) => s.status === "ok" && s.content && s.content.trim().length > 30
    );

    if (usableSources.length === 0) {
      const errMsg = "Failed to retrieve usable content from discovered sources. TinyFish Fetch returned zero readable pages.";
      onEvent("progress", {
        stage: "failed",
        progress: 60,
        message: errMsg,
      });
      onEvent("error", {
        success: false,
        status: "error",
        data: null,
        sources,
        warnings,
        error: {
          code: "FETCH_FAILED",
          message: errMsg,
          retryable: true,
        },
      });
      throw new Error(errMsg);
    }

    // Emit each source document
    for (const s of sources) {
      if (intent === "supplier") {
        const isRef = referenceArticles.some((a) => a.domain === s.domain);
        s.isArticle = isRef;
      }
      onEvent("source", s);
    }

    // ----------------------------------------------------
    // STAGE 5: FACT EXTRACTION & GROUNDING
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "extracting",
      progress: 75,
      message: "Extracting verified claims, metrics, and exact verbatim quotations...",
    });

    const facts: ExtractedFact[] = [];
    const comparison: ComparisonItem[] = [];

    if (intent === "supplier") {
      const extractedCandidates: GroundedSupplierCandidate[] = [];
      const supplierSources = sources.filter((s) => !s.isArticle && s.status === "ok");

      for (const src of supplierSources) {
        const candidate = extractGroundedSupplierFromSource(src, constraints);
        if (candidate) {
          extractedCandidates.push(candidate);
        }
      }

      if (extractedCandidates.length < 2) {
        warnings.push({
          code: "LOW_ENTITY_DENSITY",
          message: "Fewer than 2 direct verified suppliers were discoverable from search results for this criteria.",
        });
      }

      extractedCandidates.forEach((cand, idx) => {
        const { item, facts: candidateFacts } = convertCandidateToComparisonItem(cand, idx);
        comparison.push(item);
        facts.push(...candidateFacts);
      });
    } else {
      // General / Startup / Competitor / Tech Research
      const generalCandidates: GroundedGeneralCandidate[] = [];
      const validSources = sources.filter((s) => s.status === "ok");

      for (const src of validSources) {
        const candidate = extractGroundedGeneralEntityFromSource(src, intent);
        if (candidate) {
          generalCandidates.push(candidate);
        }
      }

      generalCandidates.forEach((cand, idx) => {
        const { item, facts: candidateFacts } = convertGeneralCandidateToComparisonItem(cand, idx);
        comparison.push(item);
        facts.push(...candidateFacts);
      });
    }

    // ----------------------------------------------------
    // STAGE 6: SYNTHESIS & DEEP REPORT GENERATION
    // ----------------------------------------------------
    onEvent("progress", {
      stage: "synthesizing",
      progress: 88,
      message: "Cross-checking claims, benchmark metrics, and synthesizing deep report...",
    });

    const synthesis = synthesizeRecommendationsAndActions(
      comparison,
      plan,
      request,
      sources,
      facts
    );
    const recommendations: Recommendation[] = synthesis.recommendations;
    const missingInfo: MissingInfo[] = synthesis.missingInfo;
    const actionDrafts: ActionDraft[] = synthesis.actionDrafts;
    let finalReport: ResearchReport = synthesis.report;
    let successfulLlmCalls = 0;

    if (mode === "deep" && llmProvider.name !== "mock") {
      try {
        finalReport = await synthesizeDeepReportWithLLM(
          llmProvider,
          request,
          plan,
          usableSources,
          facts
        );
        successfulLlmCalls = 1;
      } catch (llmErr) {
        const errMsg = `AI research synthesis failed: ${llmErr instanceof Error ? llmErr.message : String(llmErr)}`;
        onEvent("progress", {
          stage: "failed",
          progress: 88,
          message: errMsg,
        });
        onEvent("error", {
          success: false,
          status: "error",
          data: null,
          sources,
          warnings,
          error: {
            code: "LLM_SYNTHESIS_ERROR",
            message: errMsg,
            retryable: true,
          },
        });
        throw new Error(errMsg);
      }
    }

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
        searches: queriesToRun.length,
        urlsFetched: sources.length,
        agentRuns: 0,
        llmCalls: successfulLlmCalls,
        sourcesOk: sources.filter((s) => s.status === "ok").length,
        sourcesFailed: sources.filter((s) => s.status === "failed").length,
      },
      mock: false,
      report: finalReport,
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
      stage: "completed",
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
