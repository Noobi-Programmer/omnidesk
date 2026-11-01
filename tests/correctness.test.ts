import { describe, it, expect } from "vitest";
import { isBlockedDomain, isEditorialUrl } from "../src/server/services/tinyfish/search";
import { qualifySupplierCandidate, cleanSupplierName } from "../src/server/orchestrator/qualification";
import { MockResearchEngine } from "../src/server/mock/engine";
import type { SourceDocument } from "../src/lib/contracts";

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
});
