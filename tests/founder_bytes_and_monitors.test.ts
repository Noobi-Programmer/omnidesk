import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { getFounderBytes, addFounderByte, clearFounderBytes } from "../src/server/services/bytes/index";
import { SAMPLE_FOUNDER_BYTES } from "./fixtures/sample_bytes";
import {
  listMonitors,
  createMonitor,
  updateMonitorStatus,
  runMonitorNow,
  deleteMonitor,
} from "../src/server/services/tinyfish/monitors";
import { isSourceAllowed, getSourceForUrl } from "../src/server/services/bytes/registry";
import { MockResearchEngine } from "../src/server/mock/engine";
import type { FounderByte, ResearchResponse } from "../src/lib/contracts";

describe("Founder Bytes & Source Registry Suite", () => {
  beforeEach(() => {
    SAMPLE_FOUNDER_BYTES.forEach((b) => addFounderByte(b));
  });

  afterAll(() => {
    clearFounderBytes();
  });
  it("retrieves curated founder bytes and filters by category", async () => {
    const allBytes = await getFounderBytes({ category: "All" });
    expect(allBytes.length).toBeGreaterThanOrEqual(8);

    const startupBytes = await getFounderBytes({ category: "Startups" });
    expect(startupBytes.length).toBeGreaterThan(0);
    startupBytes.forEach((b) => {
      expect(b.categories).toContain("Startups");
    });
  });

  it("filters founder bytes by search keyword", async () => {
    const anthropicBytes = await getFounderBytes({ query: "Dynamic Reasoning" });
    expect(anthropicBytes.length).toBeGreaterThan(0);
    expect(anthropicBytes[0].title.toLowerCase()).toContain("dynamic reasoning");
  });

  it("adds and deduplicates new founder bytes dynamically", async () => {
    const testByte: FounderByte = {
      id: "test-byte-1",
      title: "OpenAI Launches Autonomous Coding Engine",
      source: "TechCrunch",
      publishedAt: "2025-02-28",
      retrievedAt: new Date().toISOString(),
      url: "https://techcrunch.com/2025/02/openai-engine",
      summary: "OpenAI released new automated agent execution harness.",
      whyItMatters: "Directly impacts AI tooling.",
      categories: ["AI & Technology", "Product Launches"],
      relatedEntities: ["OpenAI"],
    };

    addFounderByte(testByte);

    const fetched = await getFounderBytes({ query: "Autonomous Coding Engine" });
    expect(fetched.length).toBeGreaterThan(0);
    expect(fetched[0].title).toBe("OpenAI Launches Autonomous Coding Engine");
  });

  it("validates allowed domains and sources in registry", () => {
    expect(isSourceAllowed("https://news.ycombinator.com/item?id=123")).toBe(true);
    expect(isSourceAllowed("https://www.reuters.com/technology/article")).toBe(true);
    expect(isSourceAllowed("https://x.com/naval/status/123")).toBe(true);
    expect(isSourceAllowed("https://malicious-spam-site.xyz")).toBe(false);

    const ycSource = getSourceForUrl("https://www.ycombinator.com/blog");
    expect(ycSource).not.toBeNull();
    expect(ycSource?.name).toBe("Y Combinator");
  });
});

describe("TinyMonitor Management Suite", () => {
  it("lists existing seed monitors", async () => {
    const monitors = await listMonitors();
    expect(monitors.length).toBeGreaterThanOrEqual(3);
    const searchMon = monitors.find((m) => m.type === "search");
    expect(searchMon).toBeDefined();
    expect(searchMon?.schedule_cron).toBeDefined();
  });

  it("creates a new topic monitor subscription", async () => {
    const created = await createMonitor({
      name: "Sovereign AI Compute Monitor",
      type: "search",
      config: {
        query: "sovereign AI compute cluster infrastructure funding",
        recency_minutes: 1440,
        result_limit: 5,
      },
      schedule_cron: "0 8 * * *",
      purpose: "Track sovereign AI compute investments.",
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Sovereign AI Compute Monitor");
    expect(created.status).toBe("active");
  });

  it("pauses and resumes a monitor subscription", async () => {
    const monitors = await listMonitors();
    const firstMon = monitors[0];

    const paused = await updateMonitorStatus(firstMon.id, "paused");
    expect(paused.status).toBe("paused");

    const resumed = await updateMonitorStatus(firstMon.id, "active");
    expect(resumed.status).toBe("active");
  });

  it("triggers an immediate monitor check run", async () => {
    const monitors = await listMonitors();
    const target = monitors[0];

    const runResult = await runMonitorNow(target.id);
    expect(runResult).toBeDefined();
    expect(runResult.run).toBeDefined();
  }, 15000);
});

describe("Deep Research Structured Report Suite", () => {
  it("generates a full Deep Research report with citations and executive summary", async () => {
    const engine = new MockResearchEngine();
    const response: ResearchResponse = await engine.execute(
      {
        prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
        mode: "deep",
      },
      () => {}
    );

    expect(response.report).toBeDefined();
    const report = response.report!;

    expect(report.title).toContain("Deep Research Report");
    expect(report.executiveSummary).toBeDefined();
    expect(report.executiveSummary.length).toBeGreaterThan(20);
    expect(report.methodology).toBeDefined();
    expect(report.keyFindings.length).toBeGreaterThan(0);
    expect(report.sections.length).toBeGreaterThanOrEqual(3);
    expect(report.citations.length).toBeGreaterThan(0);
    expect(report.statisticsAndEvidence.length).toBeGreaterThan(0);
    expect(report.implicationsAndConclusions.length).toBeGreaterThan(0);

    // Verify citations have valid URL and domain
    report.citations.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.sourceUrl).toMatch(/^https?:\/\//);
      expect(c.domain).toBeDefined();
    });
  });
});
