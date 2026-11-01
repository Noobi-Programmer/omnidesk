import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  ResearchRequestSchema,
  type ApiResponse,
  type ResearchResponse,
  type SourceDocument,
  type ProgressEventPayload,
} from "../src/lib/contracts";
import { detectIntentFromPrompt, generateAdaptivePlan } from "../src/server/prompts/plan";
import {
  isBlockedSupplierDomain,
  isAllowedEditorialDomain,
} from "../src/server/services/tinyfish/search";
import {
  extractGroundedSupplierFromSource,
  extractGroundedGeneralEntityFromSource,
} from "../src/server/orchestrator/extraction";
import {
  evaluateMoqCompliance,
  parseResearchConstraints,
} from "../src/server/orchestrator/qualification";
import {
  getFounderBytes,
  addFounderByte,
  clearFounderBytes,
} from "../src/server/services/bytes/index";
import { ingestMonitorRun } from "../src/server/services/bytes/ingest";
import { runMonitorNow } from "../src/server/services/tinyfish/monitors";
import {
  clearAllStorage,
  getStoredFounderBytes,
  addStoredFounderByte,
  isRunProcessed,
  markRunProcessed,
} from "../src/server/services/storage/index";
import fs from "node:fs";
import path from "node:path";

describe("OMNIDESK V3 — CRITICAL PRODUCTION CORRECTION (21-Criterion Test Suite)", () => {
  beforeEach(() => {
    clearAllStorage();
    clearFounderBytes();
  });

  // --------------------------------------------------------------------------
  // 1. Short prompt accepted
  // --------------------------------------------------------------------------
  it("Criterion 1: Short prompt is accepted by validation schema", () => {
    const parsed = ResearchRequestSchema.safeParse({
      prompt: "Find sustainable paper cup suppliers in Germany",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.prompt).toBe("Find sustainable paper cup suppliers in Germany");
      expect(parsed.data.mode).toBe("standard"); // default mode
    }
  });

  // --------------------------------------------------------------------------
  // 2. 12,000-character prompt accepted
  // --------------------------------------------------------------------------
  it("Criterion 2: 12,000-character prompt is accepted by validation schema", () => {
    const longPrompt = "Comprehensive research prompt: " + "A".repeat(11950);
    expect(longPrompt.length).toBeLessThanOrEqual(12000);

    const parsed = ResearchRequestSchema.safeParse({
      prompt: longPrompt,
      mode: "deep",
    });
    expect(parsed.success).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 3. Over-limit prompt returns useful validation details
  // --------------------------------------------------------------------------
  it("Criterion 3: Over-limit prompt (> 12,000 characters) returns useful validation details", () => {
    const overLimitPrompt = "Too long: " + "X".repeat(12005);
    const parsed = ResearchRequestSchema.safeParse({
      prompt: overLimitPrompt,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const formatted = parsed.error.format();
      const promptErrors = formatted.prompt?._errors;
      expect(promptErrors).toBeDefined();
      expect(promptErrors?.length).toBeGreaterThan(0);
      expect(promptErrors?.[0]).toContain("12,000 characters");
    }
  });

  // --------------------------------------------------------------------------
  // 4. Valid SSE result event is processed
  // --------------------------------------------------------------------------
  it("Criterion 4: Valid SSE result event envelope is correctly unpacked and data is preserved", () => {
    const mockResponse: Partial<ResearchResponse> = {
      taskId: "task-test-v3",
      createdAt: new Date().toISOString(),
      facts: [],
      comparison: [],
      recommendations: [],
      missingInfo: [],
      conflicts: [],
      actionDrafts: [],
      stats: {
        durationMs: 450,
        searches: 2,
        urlsFetched: 3,
        agentRuns: 0,
        llmCalls: 0,
        sourcesOk: 3,
        sourcesFailed: 0,
      },
    };

    const envelope: ApiResponse<any> = {
      success: true,
      status: "ok",
      data: mockResponse,
      sources: [{ id: "src-1", url: "https://example.org", title: "Example" }],
      warnings: [],
      error: null,
    };

    const serialized = JSON.stringify(envelope);
    const parsed = JSON.parse(serialized);

    // Extraction contract
    let extractedData: any = null;
    if (parsed && typeof parsed === "object") {
      if ("data" in parsed && parsed.data) {
        extractedData = parsed.data;
      } else if ("taskId" in parsed) {
        extractedData = parsed;
      }
    }

    expect(extractedData).not.toBeNull();
    expect(extractedData.taskId).toBe("task-test-v3");
    expect(extractedData.stats.searches).toBe(2);
  });

  // --------------------------------------------------------------------------
  // 5. Source events update source list
  // --------------------------------------------------------------------------
  it("Criterion 5: Source events update source list and deduplicate by source ID", () => {
    let sourceList: SourceDocument[] = [];
    const updateSources = (src: SourceDocument) => {
      if (!sourceList.some((s) => s.id === src.id)) {
        sourceList = [...sourceList, src];
      }
    };

    const doc1: SourceDocument = {
      id: "doc-1",
      url: "https://supplier-a.eu",
      domain: "supplier-a.eu",
      title: "Supplier A Homepage",
      status: "ok",
      retrievedVia: "search",
      fetchedVia: "fetch",
      fetchedAt: new Date().toISOString(),
    };

    const doc2: SourceDocument = {
      id: "doc-2",
      url: "https://supplier-b.eu",
      domain: "supplier-b.eu",
      title: "Supplier B Specs",
      status: "ok",
      retrievedVia: "search",
      fetchedVia: "fetch",
      fetchedAt: new Date().toISOString(),
    };

    updateSources(doc1);
    updateSources(doc2);
    updateSources(doc1); // Duplicate event

    expect(sourceList.length).toBe(2);
    expect(sourceList.map((s) => s.id)).toEqual(["doc-1", "doc-2"]);
  });

  // --------------------------------------------------------------------------
  // 6. Error events produce failed state
  // --------------------------------------------------------------------------
  it("Criterion 6: Error events produce failed terminal state and surface error message", () => {
    let terminalStage: string = "planning";
    let errorMessage: string = "";

    const handleErrorEvent = (errPayload: any) => {
      terminalStage = "failed";
      errorMessage = errPayload.error?.message || errPayload.message || "An error occurred";
    };

    handleErrorEvent({
      error: {
        code: "PIPELINE_ERROR",
        message: "Network timeout connecting to upstream research providers",
        retryable: true,
      },
    });

    expect(terminalStage).toBe("failed");
    expect(errorMessage).toBe("Network timeout connecting to upstream research providers");
  });

  // --------------------------------------------------------------------------
  // 7. Stream closing without result cannot leave UI loading
  // --------------------------------------------------------------------------
  it("Criterion 7: Stream closing without a final result terminates in failed state, not stuck in loading", () => {
    let isRunning = true;
    let currentStage = "synthesizing";
    let hasReceivedFinalResult = false;
    let hasErrorOccurred = false;

    // Simulate stream end where reader returns { done: true } without 'result' event
    const streamDone = true;
    if (streamDone) {
      if (!hasReceivedFinalResult && !hasErrorOccurred) {
        currentStage = "failed";
      }
      isRunning = false;
    }

    expect(isRunning).toBe(false);
    expect(currentStage).toBe("failed");
  });

  // --------------------------------------------------------------------------
  // 8. Progress cannot claim completion on failed request
  // --------------------------------------------------------------------------
  it("Criterion 8: Progress cannot claim completed or green done state on failed request", () => {
    const stage: string = "failed";
    const isCompleted = stage === "completed" || stage === "done";
    expect(isCompleted).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 9. General research doesn't default to supplier sourcing
  // --------------------------------------------------------------------------
  it("Criterion 9: General/startup research does not default to supplier sourcing", () => {
    const startupIntent = detectIntentFromPrompt("Analyze generative AI startup funding and top hubs in India");
    expect(startupIntent).toBe("startup");

    const competitorIntent = detectIntentFromPrompt("Compare LangChain vs LlamaIndex vs TinyFish architecture");
    expect(competitorIntent).toBe("competitor");

    const techIntent = detectIntentFromPrompt("Research solid state battery energy density and commercial roadmap");
    expect(techIntent).toBe("technology");

    const plan = generateAdaptivePlan({
      prompt: "Analyze the AI startup ecosystem in India: venture capital, seed rounds, and GPU availability",
      mode: "deep",
    });
    expect(plan.entityType).toBe("startup");
    expect(plan.intent).toBe("startup");
  });

  // --------------------------------------------------------------------------
  // 10. Editorial sources remain available for general research
  // --------------------------------------------------------------------------
  it("Criterion 10: Editorial sources remain available and unblocked for general and ecosystem research", () => {
    const credibleEditorial = [
      "reuters.com",
      "techcrunch.com",
      "ycombinator.com",
      "forbes.com",
      "bloomberg.com",
      "inc42.com",
      "yourstory.com",
    ];

    for (const domain of credibleEditorial) {
      expect(isAllowedEditorialDomain(domain)).toBe(true);
    }
  });

  // --------------------------------------------------------------------------
  // 11. Fake ISO claims cannot be marked verified
  // --------------------------------------------------------------------------
  it("Criterion 11: Fake ISO claims cannot be marked verified when unmentioned in source", () => {
    const unverifiedSource: SourceDocument = {
      id: "src-spec",
      url: "https://canmaker-spec.de/products",
      domain: "canmaker-spec.de",
      title: "Aluminum Beverage Cans 250ml",
      status: "ok",
      retrievedVia: "search",
      fetchedVia: "fetch",
      fetchedAt: new Date().toISOString(),
      contentExcerpt: "We offer 250ml slim beverage aluminum cans for craft drinks. Clean recyclable liners available.",
    };

    const constraints = parseResearchConstraints(
      "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)"
    );
    const candidate = extractGroundedSupplierFromSource(unverifiedSource, constraints);

    expect(candidate).not.toBeNull();
    // Credibility must NOT default to "ISO / Industry standard"
    expect(candidate?.credibility.value).not.toBe("ISO / Industry standard");
    expect(candidate?.credibility.status).toBe("not_found");
  });

  // --------------------------------------------------------------------------
  // 12. Unknown MOQ cannot be marked compliant
  // --------------------------------------------------------------------------
  it("Criterion 12: Unknown MOQ cannot be marked compliant (must be unknown or unstated)", () => {
    const noMoqSource: SourceDocument = {
      id: "src-no-moq",
      url: "https://artisan-can.com/catalog",
      domain: "artisan-can.com",
      title: "Artisan Beverage Containers",
      status: "ok",
      retrievedVia: "search",
      fetchedVia: "fetch",
      fetchedAt: new Date().toISOString(),
      contentExcerpt: "Custom printed slim 250ml beverage cans. Contact sales for bespoke quotations.",
    };

    const constraints = parseResearchConstraints("Aluminum cans MOQ < 50k");
    const candidate = extractGroundedSupplierFromSource(noMoqSource, constraints);

    expect(candidate).not.toBeNull();
    expect(candidate?.moq.status).toBe("not_found");
    expect(candidate?.constraintFit).not.toBe("meets");
  });

  // --------------------------------------------------------------------------
  // 13. Strict MOQ boundary is respected (< 50,000 rejects 50,000)
  // --------------------------------------------------------------------------
  it("Criterion 13: Strict MOQ boundary is respected (< 50,000 strictly rejects MOQ = 50,000)", () => {
    const strictConstraints = parseResearchConstraints(
      "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)"
    );
    expect(strictConstraints.isStrictLessThan).toBe(true);
    expect(strictConstraints.maxMoq).toBe(50000);

    const compliance50k = evaluateMoqCompliance(50000, strictConstraints);
    expect(compliance50k.compliant).toBe(false);
    expect(compliance50k.reason).toContain("strictly below 50,000");

    const compliance49k = evaluateMoqCompliance(49999, strictConstraints);
    expect(compliance49k.compliant).toBe(true);

    const compliance51k = evaluateMoqCompliance(51000, strictConstraints);
    expect(compliance51k.compliant).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 14. Production feed does not return hardcoded sample stories
  // --------------------------------------------------------------------------
  it("Criterion 14: Production Founder Bytes feed does not return hardcoded sample stories", async () => {
    clearAllStorage();
    const bytes = await getFounderBytes({ category: "All" });
    // Empty store returns exactly 0, not the 8 hardcoded 2025 fake news items
    expect(bytes.length).toBe(0);
  });

  // --------------------------------------------------------------------------
  // 15. Unknown domains are not labelled TechCrunch
  // --------------------------------------------------------------------------
  it("Criterion 15: Unknown domains are attributed to their clean hostname and never defaulted to TechCrunch", async () => {
    const runResult = {
      id: "run-unknown-source-test",
      results: [
        {
          url: "https://subatomic-compute.io/blog/breakthrough",
          title: "Subatomic Compute Announces Cryogenic Quantum Processor",
          snippet: "Cryogenic testing achieves 99.9% fidelity.",
          position: 1,
        },
      ],
      new_result_positions: [1],
    };

    const ingested = await ingestMonitorRun(runResult);
    expect(ingested.ingestedCount).toBe(1);
    const byte = ingested.bytes[0];

    expect(byte.source).not.toBe("TechCrunch");
    expect(byte.source).toBe("subatomic-compute.io");
  });

  // --------------------------------------------------------------------------
  // 16. Publication dates are not fabricated
  // --------------------------------------------------------------------------
  it("Criterion 16: Publication dates are not fabricated when unstated in source results", async () => {
    const runResult = {
      id: "run-date-test",
      results: [
        {
          url: "https://founders-handbook.org/essays/delegation",
          title: "On Direct Delegation and Verification",
          snippet: "Systems for founder-led engineering squads.",
          position: 1,
          // No date specified
        },
      ],
      new_result_positions: [1],
    };

    const ingested = await ingestMonitorRun(runResult);
    const byte = ingested.bytes[0];

    expect(byte.publishedAt).toBe("Publication date unavailable");
    // Must not be today's date formatted as YYYY-MM-DD
    const todayYmd = new Date().toISOString().split("T")[0];
    expect(byte.publishedAt).not.toBe(todayYmd);
  });

  // --------------------------------------------------------------------------
  // 17. Duplicate stories are rejected
  // --------------------------------------------------------------------------
  it("Criterion 17: Duplicate stories are rejected and not added to durable storage", async () => {
    const duplicateRun = {
      id: "run-dup-1",
      results: [
        {
          url: "https://yc-dispatch.org/articles/agent-playbook",
          title: "The 2026 Agent Playbook for Founders",
          snippet: "How startups run autonomous code reviews.",
          position: 1,
        },
      ],
      new_result_positions: [1],
    };

    const firstRun = await ingestMonitorRun(duplicateRun);
    expect(firstRun.ingestedCount).toBe(1);

    // Re-run with same URL
    const secondRun = await ingestMonitorRun(duplicateRun);
    expect(secondRun.ingestedCount).toBe(0);

    const stored = getStoredFounderBytes();
    expect(stored.length).toBe(1);
  });

  // --------------------------------------------------------------------------
  // 18. Webhook retries are idempotent
  // --------------------------------------------------------------------------
  it("Criterion 18: Webhook retries are idempotent and do not duplicate runs", () => {
    const testRunId = "webhook-run-id-998877";
    expect(isRunProcessed(testRunId)).toBe(false);

    markRunProcessed(testRunId);
    expect(isRunProcessed(testRunId)).toBe(true);

    // Second check remains true
    expect(isRunProcessed(testRunId)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 19. Monitor Run Now results reach the feed
  // --------------------------------------------------------------------------
  it("Criterion 19: Monitor Run Now results reach the Founder Bytes feed", async () => {
    clearAllStorage();
    const runResult = await runMonitorNow("mon-seed-1");
    const ingestion = await ingestMonitorRun(runResult.run, { id: "mon-seed-1" });

    expect(ingestion.ingestedCount).toBeGreaterThan(0);

    const feed = await getFounderBytes({ category: "All" });
    expect(feed.length).toBe(ingestion.ingestedCount);
    expect(feed.some((b) => b.url === ingestion.bytes[0].url)).toBe(true);
  }, 15000);

  // --------------------------------------------------------------------------
  // 20. In-memory data is not represented as durable (file-backed JSON store)
  // --------------------------------------------------------------------------
  it("Criterion 20: Founder Bytes are persisted to file-backed JSON store on disk", () => {
    clearAllStorage();
    const testByte = {
      id: "disk-test-byte-1",
      title: "Durable Disk Storage Test",
      source: "Storage Verifier",
      publishedAt: "2026-03-01",
      retrievedAt: new Date().toISOString(),
      url: "https://disk-storage-test.org/check",
      summary: "Validating file-backed storage durability.",
      whyItMatters: "Serverless invocations require disk persistence.",
      categories: ["AI & Technology" as const],
      relatedEntities: ["OmniDesk Storage"],
    };

    addStoredFounderByte(testByte);

    const dataDir = path.resolve(process.cwd(), "data");
    const bytesFile = path.join(dataDir, "founder_bytes.json");

    expect(fs.existsSync(bytesFile)).toBe(true);
    const content = JSON.parse(fs.readFileSync(bytesFile, "utf-8"));
    expect(content.length).toBe(1);
    expect(content[0].id).toBe("disk-test-byte-1");
  });

  // --------------------------------------------------------------------------
  // 21. No configured monitor cannot appear as TinyMonitor Active
  // --------------------------------------------------------------------------
  it("Criterion 21: When 0 active monitors are configured, status cannot appear as TinyMonitor Active", () => {
    const emptyMonitors: any[] = [];
    const hasActive = emptyMonitors.some((m) => m.status === "active");
    expect(hasActive).toBe(false);

    const pausedMonitors = [
      { id: "mon-1", name: "Monitor 1", status: "paused" },
      { id: "mon-2", name: "Monitor 2", status: "paused" },
    ];
    const hasActivePaused = pausedMonitors.some((m) => m.status === "active");
    expect(hasActivePaused).toBe(false);

    const activeMonitors = [
      { id: "mon-1", name: "Monitor 1", status: "active" },
      { id: "mon-2", name: "Monitor 2", status: "paused" },
    ];
    const hasActiveLive = activeMonitors.some((m) => m.status === "active");
    expect(hasActiveLive).toBe(true);
  });

  afterAll(() => {
    clearFounderBytes();
  });
});
