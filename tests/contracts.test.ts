import { describe, it, expect } from "vitest";
import { ResearchRequestSchema, SseEventName } from "../src/lib/contracts";
import { MockResearchEngine } from "../src/server/mock/engine";

describe("OmniDesk Backend Contracts & Mock Engine Suite", () => {
  it("validates a canonical research request successfully", () => {
    const valid = {
      prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
      mode: "standard",
    };
    const parsed = ResearchRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mode).toBe("standard");
      expect(parsed.data.prompt).toContain("packaging suppliers in Bengaluru");
    }
  });

  it("rejects an empty prompt", () => {
    const invalid = { prompt: "", mode: "standard" };
    const parsed = ResearchRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("executes the MockResearchEngine and emits full SSE sequence with mock=true", async () => {
    const engine = new MockResearchEngine();
    const emittedEvents: Array<{ event: SseEventName; data: unknown }> = [];

    const request = {
      prompt: "Find five reliable packaging suppliers in Bengaluru for a small D2C brand.",
      mode: "standard" as const,
    };

    const response = await engine.execute(request, (event, data) => {
      emittedEvents.push({ event, data });
    });

    expect(response).toBeDefined();
    expect(response.mock).toBe(true);
    expect(response.sources.length).toBeGreaterThanOrEqual(3);
    expect(response.recommendations.length).toBe(3);
    expect(response.actionDrafts.length).toBeGreaterThanOrEqual(1);

    // Verify presence of critical events
    const eventNames = emittedEvents.map((e) => e.event);
    expect(eventNames).toContain("progress");
    expect(eventNames).toContain("plan");
    expect(eventNames).toContain("source");
    expect(eventNames).toContain("agent_live");
    expect(eventNames).toContain("result");

    // Verify honest unknowns exist
    const notFoundFact = response.facts.find((f) => f.status === "not_found");
    expect(notFoundFact).toBeDefined();
    expect(notFoundFact?.value).toBeNull();
  });
});
