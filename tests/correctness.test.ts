import { describe, it, expect, vi } from "vitest";
import { isBlockedDomain, isEditorialUrl } from "../src/server/services/tinyfish/search";
import { qualifySupplierCandidate, cleanSupplierName } from "../src/server/orchestrator/qualification";
import { MockResearchEngine } from "../src/server/mock/engine";
import { RealResearchEngine } from "../src/server/orchestrator/engine";
import * as searchService from "../src/server/services/tinyfish/search";
import * as fetchService from "../src/server/services/tinyfish/fetch";
import { synthesizeRecommendationsAndActions } from "../src/server/orchestrator/synthesis";
import type {
  SourceDocument,
  ComparisonItem,
  ResearchPlan,
  SseEventName,
} from "../src/lib/contracts";

describe("OmniDesk P0: Research Correctness & Grounding Suite", () => {
  // Requirement 1: Courier services and logistics aggregators rejected
  it("Requirement 1: Rejects courier companies and parcel logistics from supplier recommendations", () => {
    // Domain block check
    expect(isBlockedDomain("porter.in")).toBe(true);
    expect(isBlockedDomain("www.bluedart.com")).toBe(true);
    expect(isBlockedDomain("delhivery.com")).toBe(true);
    expect(isBlockedDomain("dtdc.in")).toBe(true);
    expect(isBlockedDomain("shiprocket.in")).toBe(true);

    // Entity qualification check
    const courierSource: SourceDocument = {
      id: "s-courier",
      url: "https://porter.in/city-bengaluru",
      domain: "porter.in",
      title: "Porter — Truck Hire & Logistics in Bengaluru",
      contentExcerpt: "Hire mini trucks and courier delivery services across Bengaluru.",
      retrievedVia: "search",
      fetchedVia: "fetch",
      status: "ok",
    };

    const qual = qualifySupplierCandidate(courierSource, "packaging", "Bengaluru");
    expect(qual.isQualified).toBe(false);
    expect(qual.reason).toContain("aggregator directory or courier service");
  });

  // Requirement 2: Blog posts and editorial listicles cannot become supplier recommendations or email recipients
  it("Requirement 2: Disqualifies editorial articles, listicles, and blogs from supplier ranking", () => {
    expect(isEditorialUrl("https://industryinsider.in/blog/top-10-packaging-companies-bengaluru")).toBe(true);
    expect(isEditorialUrl("https://packagingtoday.com/articles/best-packaging-options")).toBe(true);
    expect(isEditorialUrl("https://example.com/category/packaging-news")).toBe(true);
    expect(isEditorialUrl("https://example.com/tag/corrugated-boxes")).toBe(true);

    const articleSource: SourceDocument = {
      id: "s-article",
      url: "https://packagingnews.in/top-10-box-makers",
      domain: "packagingnews.in",
      title: "Top 10 Corrugated Box Makers in Bengaluru (2024 Guide)",
      contentExcerpt: "Here is an editorial list of the best packaging companies in Bengaluru...",
      retrievedVia: "search",
      fetchedVia: "fetch",
      status: "ok",
    };

    const qual = qualifySupplierCandidate(articleSource, "packaging", "Bengaluru");
    expect(qual.isQualified).toBe(false);
    expect(qual.flags).toContain("EDITORIAL_ARTICLE");
    expect(qual.reason).toContain("Editorial article or blog listicle");
  });

  // Requirement 3: Missing prices and MOQs stay null / 'Not found' — zero generic placeholders
  it("Requirement 3: Never injects generic filler phrases and keeps missing fields null/Not found", async () => {
    const engine = new MockResearchEngine();
    const result = await engine.execute(
      {
        prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
        mode: "standard",
      },
      () => {}
    );

    // EcoPack Solutions has no published pricing
    const ecoPackFact = result.facts.find(
      (f) => f.sourceId === "s-2" && f.field === "pricing"
    );
    expect(ecoPackFact).toBeDefined();
    expect(ecoPackFact?.status).toBe("not_found");
    expect(ecoPackFact?.value).toBeNull();

    // Verify that NO fact in the system contains generic placeholder filler phrases
    const forbiddenPhrases = [
      "standard manufacturer catalogue",
      "contact for moq",
      "standard lead times apply",
      "verified registered company",
    ];

    for (const fact of result.facts) {
      if (typeof fact.value === "string") {
        const lower = fact.value.toLowerCase();
        for (const phrase of forbiddenPhrases) {
          expect(lower).not.toContain(phrase);
        }
      }
    }
  });

  // Requirement 4: Distant suppliers without Bengaluru presence are flagged
  it("Requirement 4: Flags suppliers with no verified Bengaluru presence or service coverage", () => {
    const delhiSupplierSource: SourceDocument = {
      id: "s-delhi",
      url: "https://delhiboxes.in",
      domain: "delhiboxes.in",
      title: "Delhi Box Manufacturing Unit — Okhla Phase 1",
      contentExcerpt: "Leading corrugated box manufacturer in Okhla Industrial Area, New Delhi.",
      retrievedVia: "search",
      fetchedVia: "fetch",
      status: "ok",
    };

    const qual = qualifySupplierCandidate(delhiSupplierSource, "packaging", "Bengaluru");
    expect(qual.flags).toContain("LOCATION_UNVERIFIED");
  });

  // Requirement 5: Duplicate company names and domains are cleaned and deduplicated
  it("Requirement 5: Cleans noisy SEO title tags and derives clean supplier business names", () => {
    const title1 = "PrintPack Industries — Custom Corrugated Packaging Bengaluru | Phase 2 Peenya";
    expect(cleanSupplierName(title1)).toBe("PrintPack Industries");

    const title2 = "Welcome to Bangalore Box Co. Pvt Ltd — Home Page";
    expect(cleanSupplierName(title2)).toBe("Bangalore Box Co. Pvt Ltd");
  });

  // Requirement 6: Verified fields contain supporting evidence (quotes + sourceUrl)
  it("Requirement 6: Verified facts contain exact verbatim quote citations and source links", async () => {
    const engine = new MockResearchEngine();
    const result = await engine.execute(
      {
        prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
        mode: "standard",
      },
      () => {}
    );

    const verifiedFacts = result.facts.filter((f) => f.status === "found");
    expect(verifiedFacts.length).toBeGreaterThan(0);

    for (const fact of verifiedFacts) {
      expect(fact.sourceUrl).toBeDefined();
      expect(fact.sourceUrl?.startsWith("http")).toBe(true);
      expect(fact.quote).toBeDefined();
      expect(fact.quote?.length).toBeGreaterThan(5);
    }

    // Verify comparison items have factDetails with quotes
    const printPack = result.comparison.find((c) => c.name.includes("PrintPack"));
    expect(printPack).toBeDefined();
    expect(printPack?.factDetails?.moq?.quote).toContain("250 units");
    expect(printPack?.factDetails?.pricing?.quote).toContain("Rs 18 to Rs 42");
  });

  // Requirement 7: Insufficient qualified results (< 3) are reported honestly without filler
  it("Requirement 7: Correctly tracks qualifiedCount and honest sufficiency without fabricating filler", async () => {
    const engine = new MockResearchEngine();
    const result = await engine.execute(
      {
        prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
        mode: "standard",
      },
      () => {}
    );

    expect(result.qualifiedCount).toBe(3);
    expect(result.isSufficient).toBe(true);
    expect(result.comparison.every((c) => c.isQualifiedSupplier)).toBe(true);
  });

  // Requirement 8: Missing or invalid email disables direct action and provides copyable draft
  it("Requirement 8: Validates recipient email and disables direct send when email is absent", async () => {
    const engine = new MockResearchEngine();
    const result = await engine.execute(
      {
        prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
        mode: "standard",
      },
      () => {}
    );

    const emailDraft = result.actionDrafts.find((a) => a.payload.kind === "email");
    expect(emailDraft).toBeDefined();
    if (emailDraft && emailDraft.payload.kind === "email") {
      expect(emailDraft.payload.to).toBe("sales@printpack.co.in");
      expect(emailDraft.payload.canSendDirectly).toBe(true);
      expect(emailDraft.payload.mailto).toContain("mailto:sales@printpack.co.in");
      expect(emailDraft.payload.body).toContain("PrintPack Industries Sales Team");
      // Never address an article title
      expect(emailDraft.payload.body).not.toContain("Top 10");
    }
  });

  // ==========================================================================
  // P0 HOTFIX REGRESSION SCENARIOS (8 Requirements)
  // ==========================================================================

  // Scenario 1: Missing TinyFish key → clear error, no report
  it("Scenario 1: Missing TinyFish key produces clear error and no report", async () => {
    const prevKey = process.env.TINYFISH_API_KEY;
    try {
      delete process.env.TINYFISH_API_KEY;
      const engine = new RealResearchEngine();
      const events: Array<{ event: SseEventName; data: unknown }> = [];

      await expect(
        engine.execute(
          { prompt: "Research AI semiconductor packaging in Taiwan", mode: "standard" },
          (event, data) => events.push({ event, data })
        )
      ).rejects.toThrow(/TINYFISH_API_KEY is not configured/i);

      const errorEvent = events.find((e) => e.event === "error");
      expect(errorEvent).toBeDefined();
      expect((errorEvent?.data as any)?.error?.code).toBe("MISSING_TINYFISH_KEY");

      const failedProgress = events.find(
        (e) => e.event === "progress" && (e.data as any)?.stage === "failed"
      );
      expect(failedProgress).toBeDefined();
      expect(events.some((e) => e.event === "result")).toBe(false);
    } finally {
      process.env.TINYFISH_API_KEY = prevKey;
    }
  });

  // Scenario 2: TinyFish Search throws for every query → failed run
  it("Scenario 2: TinyFish Search throwing for all queries results in failed run", async () => {
    const prevKey = process.env.TINYFISH_API_KEY;
    process.env.TINYFISH_API_KEY = "sk-tinyfish-test-key";
    const spy = vi.spyOn(searchService, "executeSearch").mockRejectedValue(
      new Error("TinyFish Gateway 503 Service Unavailable")
    );

    try {
      const engine = new RealResearchEngine();
      const events: Array<{ event: SseEventName; data: unknown }> = [];

      await expect(
        engine.execute(
          { prompt: "Compare cold brew beverage suppliers in Germany", mode: "standard" },
          (event, data) => events.push({ event, data })
        )
      ).rejects.toThrow(/TinyFish Search failed for all queries/i);

      const errorEvent = events.find((e) => e.event === "error");
      expect(errorEvent).toBeDefined();
      expect((errorEvent?.data as any)?.error?.code).toBe("SEARCH_FAILED");
      expect(events.some((e) => e.event === "result")).toBe(false);
    } finally {
      spy.mockRestore();
      process.env.TINYFISH_API_KEY = prevKey;
    }
  });

  // Scenario 3: TinyFish Search returns zero results → failed run
  it("Scenario 3: TinyFish Search returning zero results results in failed run", async () => {
    const prevKey = process.env.TINYFISH_API_KEY;
    process.env.TINYFISH_API_KEY = "sk-tinyfish-test-key";
    const spy = vi.spyOn(searchService, "executeSearch").mockResolvedValue([]);

    try {
      const engine = new RealResearchEngine();
      const events: Array<{ event: SseEventName; data: unknown }> = [];

      await expect(
        engine.execute(
          { prompt: "Unfindable queryxyz123456789 obscure topic", mode: "standard" },
          (event, data) => events.push({ event, data })
        )
      ).rejects.toThrow(/zero results/i);

      const errorEvent = events.find((e) => e.event === "error");
      expect(errorEvent).toBeDefined();
      expect((errorEvent?.data as any)?.error?.code).toBe("ZERO_SEARCH_RESULTS");
      expect(events.some((e) => e.event === "result")).toBe(false);
    } finally {
      spy.mockRestore();
      process.env.TINYFISH_API_KEY = prevKey;
    }
  });

  // Scenario 4: Search succeeds but Fetch returns no usable content → failed run
  it("Scenario 4: TinyFish Fetch returning zero usable pages stops pipeline with error", async () => {
    const prevKey = process.env.TINYFISH_API_KEY;
    process.env.TINYFISH_API_KEY = "sk-tinyfish-test-key";

    const spySearch = vi.spyOn(searchService, "executeSearch").mockResolvedValue([
      {
        id: "sr-1",
        url: "https://example.com/blocked-page",
        title: "Bot Blocked Page",
        snippet: "Access Denied",
        domain: "example.com",
        queryId: "q1",
        position: 1,
      },
    ]);

    const spyFetch = vi.spyOn(fetchService, "fetchPageContents").mockResolvedValue({
      sources: [
        {
          id: "s-1",
          url: "https://example.com/blocked-page",
          title: "Bot Blocked Page",
          domain: "example.com",
          status: "failed",
          retrievedVia: "search",
          fetchedVia: "fetch",
          fetchedAt: new Date().toISOString(),
        },
      ],
      warnings: [{ code: "FETCH_FAILED", message: "Failed to scrape page" }],
    });

    try {
      const engine = new RealResearchEngine();
      const events: Array<{ event: SseEventName; data: unknown }> = [];

      await expect(
        engine.execute(
          { prompt: "Investigate Indian defense tech startups", mode: "standard" },
          (event, data) => events.push({ event, data })
        )
      ).rejects.toThrow(/zero readable pages/i);

      const errorEvent = events.find((e) => e.event === "error");
      expect(errorEvent).toBeDefined();
      expect((errorEvent?.data as any)?.error?.code).toBe("FETCH_FAILED");
      expect(events.some((e) => e.event === "result")).toBe(false);
    } finally {
      spySearch.mockRestore();
      spyFetch.mockRestore();
      process.env.TINYFISH_API_KEY = prevKey;
    }
  });

  // Scenario 5: Startup research → no supplier RFQ recommendations
  it("Scenario 5: Startup research generates intelligence findings without supplier RFQs or sample requests", () => {
    const startupPlan: ResearchPlan = {
      objective: "Deep multi-source research into: Indian AI startup ecosystem",
      entityType: "general",
      intent: "startup",
      queries: [{ id: "q1", query: "Indian AI startups funding", purpose: "Identify startups" }],
      extractionFields: [
        { key: "key_findings", label: "Core Takeaway", kind: "string" },
        { key: "quantitative_data", label: "Statistics & Metrics", kind: "string" },
        { key: "timeline_or_milestone", label: "Key Timeline & Date", kind: "string" },
      ],
      comparisonCriteria: ["key_findings", "quantitative_data", "timeline_or_milestone"],
      actionHints: [{ type: "task", instruction: "Review findings" }],
      budgets: { maxSearches: 3, maxFetchUrls: 6, maxAgentRuns: 0 },
      hardConstraints: [],
    };

    const mockCandidates: ComparisonItem[] = [
      {
        id: "cand-1",
        name: "Sarvam AI",
        website: "https://sarvam.ai",
        sourceIds: ["s-1"],
        facts: {
          key_findings: "Developing sovereign LLMs and full-stack voice foundational models for Indian languages.",
          quantitative_data: "$41M Series A raised from Lightspeed and Peak XV",
          timeline_or_milestone: "Founded in 2023",
        },
        evidenceScore: 100,
        constraintFit: "meets",
        statusBadge: "verified",
        entityType: "other",
      },
    ];

    const mockSources: SourceDocument[] = [
      {
        id: "s-1",
        url: "https://sarvam.ai",
        title: "Sarvam AI - Indic GenAI",
        domain: "sarvam.ai",
        content: "Sarvam AI raised $41M Series A in 2023 for Indic LLMs.",
        status: "ok",
        retrievedVia: "search",
        fetchedVia: "fetch",
        fetchedAt: new Date().toISOString(),
      },
    ];

    const synthesis = synthesizeRecommendationsAndActions(
      mockCandidates,
      startupPlan,
      { prompt: "Research the AI startup ecosystem in India", mode: "standard" },
      mockSources
    );

    // 1. NO email RFQs asking for commercial supply
    const emailDrafts = synthesis.actionDrafts.filter((a) => a.type === "email");
    expect(emailDrafts.length).toBe(0);

    // 2. NO mentions of production samples, MOQ, or supplier quotations in actions
    const allActionText = JSON.stringify(synthesis.actionDrafts).toLowerCase();
    expect(allActionText).not.toContain("production samples");
    expect(allActionText).not.toContain("minimum order quantity");
    expect(allActionText).not.toContain("batch pricing");
    expect(allActionText).not.toContain("commercial supply & technical qualification");

    // 3. Action drafts are research and strategy tasks
    expect(synthesis.actionDrafts.length).toBeGreaterThan(0);
    expect(synthesis.actionDrafts[0].type).toBe("task");

    // 4. Report sections do NOT contain supplier sourcing text
    const allReportSections = synthesis.report.sections.map((s) => s.content).join(" ");
    expect(allReportSections).not.toContain("MOQ & Batch Thresholds");
    expect(allReportSections).not.toContain("request physical production samples");
  });

  // Scenario 6: Supplier research → existing RFQ workflow still works
  it("Scenario 6: Supplier research retains full RFQ drafting and MOQ qualification workflow", () => {
    const supplierPlan: ResearchPlan = {
      objective: "Identify, qualify, and compare verified suppliers for: EU cold brew cans",
      entityType: "supplier",
      intent: "supplier",
      queries: [{ id: "q1", query: "cold brew can manufacturers EU", purpose: "Find manufacturers" }],
      extractionFields: [
        { key: "product_range", label: "Product Range", kind: "string" },
        { key: "moq", label: "Minimum Order Quantity", kind: "string" },
        { key: "pricing", label: "Pricing", kind: "string" },
        { key: "delivery", label: "Delivery", kind: "string" },
        { key: "credibility", label: "Certifications", kind: "string" },
        { key: "contact", label: "Direct Contact Desk", kind: "string" },
      ],
      comparisonCriteria: ["product_range", "moq", "pricing", "delivery", "credibility", "contact"],
      actionHints: [{ type: "task", instruction: "Review suppliers" }],
      budgets: { maxSearches: 3, maxFetchUrls: 6, maxAgentRuns: 0 },
      hardConstraints: ["MOQ < 50,000 units"],
    };

    const mockCandidates: ComparisonItem[] = [
      {
        id: "cand-supp-1",
        name: "Ardagh Metal Packaging",
        website: "https://ardaghgroup.com",
        sourceIds: ["s-1"],
        email: "sales@ardaghgroup.com",
        facts: {
          product_range: "250ml slim aluminum cans with BPA-NI liners",
          moq: "25,000 cans per run",
          pricing: "0.14 EUR per unit",
          delivery: "14 days dispatch",
          credibility: "ISO 9001, EC 1935/2004",
          contact: "sales@ardaghgroup.com",
        },
        evidenceScore: 95,
        constraintFit: "meets",
        statusBadge: "verified",
        entityType: "supplier",
        location: "Germany",
      },
    ];

    const mockSources: SourceDocument[] = [
      {
        id: "s-1",
        url: "https://ardaghgroup.com",
        title: "Ardagh Metal Packaging - European Facilities",
        domain: "ardaghgroup.com",
        content: "Ardagh supplies 250ml slim cans with 25k MOQ at 0.14 EUR.",
        status: "ok",
        retrievedVia: "search",
        fetchedVia: "fetch",
        fetchedAt: new Date().toISOString(),
      },
    ];

    const synthesis = synthesizeRecommendationsAndActions(
      mockCandidates,
      supplierPlan,
      { prompt: "Compare EU cold brew aluminum can suppliers (MOQ < 50k)", mode: "standard" },
      mockSources
    );

    // 1. Emits RFQ email draft requiring approval
    const emailDraft = synthesis.actionDrafts.find((a) => a.type === "email");
    expect(emailDraft).toBeDefined();
    expect(emailDraft?.requiresApproval).toBe(true);
    if (emailDraft && emailDraft.payload.kind === "email") {
      expect(emailDraft.payload.to).toBe("sales@ardaghgroup.com");
      expect(emailDraft.payload.subject).toContain("Inquiry: Commercial Supply");
    }

    // 2. Evaluates MOQ compliance
    expect(synthesis.recommendations[0].compliesWithHardConstraints).toBe(true);
    expect(synthesis.recommendations[0].confidence).toBe("high");

    // 3. Sections include MOQ & pricing comparative analysis
    const section2 = synthesis.report.sections.find((s) => s.id === "sec-2");
    expect(section2?.content).toContain("MOQ & Batch Thresholds");
  });

  // Scenario 7: Markdown rendering elements
  it("Scenario 7: Report contains clean Markdown formatting with headings, lists, and citations", () => {
    const plan: ResearchPlan = {
      objective: "Deep multi-source research into: Vector databases",
      entityType: "general",
      intent: "technology",
      queries: [{ id: "q1", query: "vector database benchmarks", purpose: "Evaluate databases" }],
      extractionFields: [],
      comparisonCriteria: [],
      actionHints: [],
      budgets: { maxSearches: 2, maxFetchUrls: 4, maxAgentRuns: 0 },
      hardConstraints: [],
    };

    const mockCandidates: ComparisonItem[] = [
      {
        id: "cand-tech-1",
        name: "Qdrant",
        website: "https://qdrant.tech",
        sourceIds: ["s-1"],
        facts: {
          key_findings: "High-performance Rust-based vector search engine with payload filtering.",
          quantitative_data: "Sub-millisecond p99 latency across 10M vectors",
          timeline_or_milestone: "2024",
        },
        evidenceScore: 85,
        constraintFit: "meets",
        statusBadge: "verified",
        entityType: "other",
      },
    ];

    const mockSources: SourceDocument[] = [
      {
        id: "s-1",
        url: "https://qdrant.tech",
        title: "Qdrant Vector Database",
        domain: "qdrant.tech",
        content: "Qdrant is a vector similarity search engine written in Rust.",
        status: "ok",
        retrievedVia: "search",
        fetchedVia: "fetch",
        fetchedAt: new Date().toISOString(),
      },
    ];

    const synthesis = synthesizeRecommendationsAndActions(mockCandidates, plan, undefined, mockSources);

    // Verify sections have markdown headings, bullets, and citations
    expect(synthesis.report.sections.length).toBeGreaterThanOrEqual(3);
    const sec2 = synthesis.report.sections[1];
    expect(sec2.content).toContain("### Qdrant");
    expect(sec2.content).toContain("- **Category / Entity Type:**");
    expect(sec2.content).toContain("- **Core Takeaway:**");
    expect(sec2.citationIds.length).toBeGreaterThan(0);
  });

  // Scenario 8: LLM unavailable → no false claim of AI synthesis
  it("Scenario 8: Deep mode stops with configuration error when LLM provider is mock or unconfigured", async () => {
    const prevKey = process.env.TINYFISH_API_KEY;
    const prevLlm = process.env.LLM_PROVIDER;
    const prevGemini = process.env.GEMINI_API_KEY;
    const prevGroq = process.env.GROQ_API_KEY;

    try {
      process.env.TINYFISH_API_KEY = "sk-tinyfish-test-key";
      process.env.LLM_PROVIDER = "mock";
      delete process.env.GEMINI_API_KEY;
      delete process.env.GROQ_API_KEY;

      const engine = new RealResearchEngine();
      const events: Array<{ event: SseEventName; data: unknown }> = [];

      await expect(
        engine.execute(
          { prompt: "Research the AI startup ecosystem in India", mode: "deep" },
          (event, data) => events.push({ event, data })
        )
      ).rejects.toThrow(/AI synthesis unavailable/i);

      const errorEvent = events.find((e) => e.event === "error");
      expect(errorEvent).toBeDefined();
      expect((errorEvent?.data as any)?.error?.code).toBe("LLM_CONFIG_ERROR");

      const failedProgress = events.find(
        (e) => e.event === "progress" && (e.data as any)?.stage === "failed"
      );
      expect(failedProgress).toBeDefined();
      expect(events.some((e) => e.event === "result")).toBe(false);
    } finally {
      process.env.TINYFISH_API_KEY = prevKey;
      process.env.LLM_PROVIDER = prevLlm;
      process.env.GEMINI_API_KEY = prevGemini;
      process.env.GROQ_API_KEY = prevGroq;
    }
  });
});
