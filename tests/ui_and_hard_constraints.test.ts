import { describe, it, expect } from "vitest";
import { MockResearchEngine } from "../src/server/mock/engine";
import {
  qualifyCandidate,
  evaluateMoqCompliance,
  parsePromptConstraints,
} from "../src/server/orchestrator/qualification";
import {
  extractGroundedSupplierFromSource,
  convertCandidateToComparisonItem,
} from "../src/server/orchestrator/extraction";
import { synthesizeRecommendationsAndActions } from "../src/server/orchestrator/synthesis";
import type { SourceDocument, SseEventName } from "../src/lib/contracts";

describe("OmniDesk 14-Pillar Acceptance Criteria Test Suite", () => {
  const engine = new MockResearchEngine();

  // 1. The research button calls the backend and receives streamed responses
  it("Criterion 1: Executes research engine and emits SSE stream events", async () => {
    const events: Array<{ event: SseEventName; data: unknown }> = [];
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      (event, data) => events.push({ event, data })
    );

    expect(response).toBeDefined();
    expect(response.taskId).toMatch(/^QRY-\d+/);
    expect(events.map((e) => e.event)).toContain("progress");
    expect(events.map((e) => e.event)).toContain("result");
  });

  // 2. Progress is based on actual backend events (not fabricated percentages)
  it("Criterion 2: Progress is derived from sequential backend stages", async () => {
    const progressStages: string[] = [];
    await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      (event, data) => {
        if (event === "progress") {
          progressStages.push((data as { stage: string }).stage);
        }
      }
    );

    expect(progressStages).toContain("planning");
    expect(progressStages).toContain("searching");
    expect(progressStages).toContain("fetching");
    expect(progressStages).toContain("extracting");
    expect(progressStages).toContain("synthesizing");
    expect(progressStages).toContain("drafting");
    expect(progressStages).toContain("done");
  });

  // 3. Articles cannot be ranked as supplier entities
  it("Criterion 3: Disqualifies articles, journals, and legislation from supplier comparison table", () => {
    const eurLex = qualifyCandidate(
      "EUR-Lex Food Contact Aluminium Regulation (EC 1935/2004)",
      "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R1935",
      "eur-lex.europa.eu"
    );
    expect(eurLex.isArticle).toBe(true);
    expect(eurLex.isQualifiedSupplier).toBe(false);

    const packagingJournal = qualifyCandidate(
      "Fizzy coffee from a can — Packaging Journal",
      "https://packaging-journal.de/en/sparkling-cold-brew-coffee-from-the-can/",
      "packaging-journal.de"
    );
    expect(packagingJournal.isArticle).toBe(true);
    expect(packagingJournal.isQualifiedSupplier).toBe(false);
  });

  // 4. Irrelevant entities are filtered out
  it("Criterion 4: Excludes aggregator directories and couriers", () => {
    const indiamart = qualifyCandidate(
      "Indiamart Can Sellers",
      "https://www.indiamart.com/proddetail/can.html",
      "indiamart.com"
    );
    expect(indiamart.isQualifiedSupplier).toBe(false);
    expect(indiamart.isDirectory).toBe(true);
  });

  // 5. Hard MOQ constraints are enforced
  it("Criterion 5: Flags hard MOQ violations (e.g. Ball 100k > 50k) as does_not_meet", () => {
    const constraints = parsePromptConstraints(
      "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)"
    );
    expect(constraints.maxMoq).toBe(50000);

    // 25,000 units meets < 50,000
    const envasesMoq = evaluateMoqCompliance("25,000 units", constraints.maxMoq);
    expect(envasesMoq.fit).toBe("meets");

    // 100,000 units violates < 50,000
    const ballMoq = evaluateMoqCompliance("100,000 units", constraints.maxMoq);
    expect(ballMoq.fit).toBe("does_not_meet");
    expect(ballMoq.reason).toContain("exceeds target maximum of 50,000 units");
  });

  // 6. Missing information stays null / Not found
  it("Criterion 6: Missing information is honestly preserved as null/Not found", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    // Canpack Nordic pricing is Not found
    const canpack = response.comparison.find((c) => c.name.includes("Canpack"));
    expect(canpack).toBeDefined();
    expect(canpack?.facts.pricing).toBe("Not found");

    // Trivium MOQ is Not found
    const trivium = response.comparison.find((c) => c.name.includes("Trivium"));
    expect(trivium).toBeDefined();
    expect(trivium?.facts.moq).toBe("Not found");
  });

  // 7. Verified cells contain supporting source evidence quotes
  it("Criterion 7: Verified cells link to verbatim quotes and source documents", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    const envases = response.comparison.find((c) => c.name.includes("Envases"));
    expect(envases).toBeDefined();
    expect(envases?.evidenceFields?.moq?.supportingQuote).toContain("25,000 units");
    expect(envases?.evidenceFields?.moq?.sourceUrl).toContain("envases.de");
    expect(envases?.evidenceFields?.pricing?.supportingQuote).toContain("€0.118");
  });

  // 8. Supplier emails are never invented
  it("Criterion 8: Never invents supplier emails", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    const canpack = response.comparison.find((c) => c.name.includes("Canpack"));
    expect(canpack?.email).toBeNull();

    const trivium = response.comparison.find((c) => c.name.includes("Trivium"));
    expect(trivium?.email).toBeNull();
  });

  // 9. Invalid or missing emails disable Open in Email
  it("Criterion 9: Missing emails disable direct email action in synthesis", () => {
    const candidateWithoutEmail = [
      {
        id: "c-no-mail",
        name: "NoMail Supplier",
        website: "https://nomail.com",
        sourceIds: ["s-1"],
        facts: { moq: "20,000 units", pricing: "€0.15", delivery: "3 wks" },
        evidenceScore: 80,
        email: null,
      },
    ];

    const plan = {
      objective: "Supplier sourcing",
      entityType: "supplier" as const,
      queries: [],
      extractionFields: [],
      comparisonCriteria: [],
      actionHints: [],
      budgets: { maxSearches: 2, maxFetchUrls: 2, maxAgentRuns: 0 },
    };

    const syn = synthesizeRecommendationsAndActions(candidateWithoutEmail, plan);
    const emailAction = syn.actionDrafts.find((a) => a.payload.kind === "email");
    expect(emailAction).toBeDefined();
    if (emailAction && emailAction.payload.kind === "email") {
      expect(emailAction.payload.to).toBeNull();
      expect(emailAction.payload.canSendDirectly).toBe(false);
      expect(emailAction.payload.mailto).toBeUndefined();
    }
  });

  // 10. Recommendations prioritize compliant qualified entities
  it("Criterion 10: Top recommendation is compliant and explains trade-offs", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    expect(response.recommendations.length).toBeGreaterThanOrEqual(1);
    const topRec = response.recommendations[0];
    expect(topRec.compliesWithHardConstraints).toBe(true);

    // Ball Beverage violates MOQ, so it must not be Rank #1
    const ballRec = response.recommendations.find((r) => r.itemId === "c-03");
    expect(ballRec?.compliesWithHardConstraints).toBe(false);
    expect(topRec.itemId).not.toBe("c-03");
  });

  // 11. Serializable research objects for history persistence
  it("Criterion 11: Response is cleanly JSON serializable for localStorage history", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    const jsonString = JSON.stringify(response);
    expect(jsonString).toBeDefined();
    const parsed = JSON.parse(jsonString);
    expect(parsed.taskId).toBe(response.taskId);
    expect(parsed.comparison.length).toBe(response.comparison.length);
  });

  // 12. Honest telemetry: zero fabricated duration or metrics
  it("Criterion 12: Telemetry duration and source counts are measured accurately", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    expect(response.stats.durationMs).toBeGreaterThan(0);
    expect(response.stats.urlsFetched).toBe(response.sources.length);
  });

  // 13. Dynamic prompt parsing extracts hard constraints
  it("Criterion 13: Automatically parses format and certifications from natural language", () => {
    const c1 = parsePromptConstraints("cold brew cans 250ml slim BPA-NI MOQ < 30k in Europe");
    expect(c1.targetFormat).toBe("250ml Slim");
    expect(c1.certifications).toContain("BPA-NI");
    expect(c1.maxMoq).toBe(30000);
    expect(c1.geography).toBe("EU / Europe");
  });

  // 14. Action drafts include editable markdown bodies without auto-sending
  it("Criterion 14: Action drafts require explicit user approval (requiresApproval: true)", async () => {
    const response = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    for (const draft of response.actionDrafts) {
      expect(draft.requiresApproval).toBe(true);
      expect(draft.status).toBe("awaiting_approval");
    }
  });
});
