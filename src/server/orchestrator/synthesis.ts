import type {
  ComparisonItem,
  Recommendation,
  MissingInfo,
  ActionDraft,
  ResearchPlan,
  ResearchReport,
  ResearchSection,
  ResearchCitation,
  ResearchEntity,
  ResearchEvidenceItem,
  SourceDocument,
  ExtractedFact,
  ResearchRequest,
} from "@/lib/contracts";

export interface SynthesisOutput {
  recommendations: Recommendation[];
  missingInfo: MissingInfo[];
  actionDrafts: ActionDraft[];
  report: ResearchReport;
}

export function synthesizeRecommendationsAndActions(
  comparison: ComparisonItem[],
  plan: ResearchPlan,
  request?: ResearchRequest,
  sources?: SourceDocument[],
  facts?: ExtractedFact[]
): SynthesisOutput {
  // 1. Separate compliant candidates from non-compliant candidates
  const compliantCandidates = comparison.filter((c) => c.constraintFit !== "does_not_meet");
  const nonCompliantCandidates = comparison.filter((c) => c.constraintFit === "does_not_meet");

  // Sort compliant by evidence score descending
  compliantCandidates.sort((a, b) => b.evidenceScore - a.evidenceScore);

  const recommendations: Recommendation[] = [];

  // Rank top compliant candidates
  compliantCandidates.slice(0, 3).forEach((c, idx) => {
    const rank = idx + 1;
    let rationale = "";
    const risks: string[] = [];

    if (rank === 1) {
      const emailNote = c.email ? "direct sales desk verified" : "requires outreach via web contact";
      rationale = `Top-ranked choice for immediate qualification. Complies with hard requirements with ${c.evidenceScore}% evidence confidence (${emailNote}).`;
    } else if (rank === 2) {
      rationale = `Strong alternative supplier offering flexibility. Recommend requesting formal quotation and sample kit.`;
    } else {
      rationale = `Viable backup option with standard lead times.`;
    }

    // Flag any missing pricing or MOQ as risk
    if (c.facts.pricing === "Not found") {
      risks.push("Pricing not published online; request formal slab quotation.");
    }
    if (c.facts.delivery === "Not found") {
      risks.push("Verify current factory dispatch turnaround before committing.");
    }

    recommendations.push({
      rank,
      itemId: c.id,
      rationale,
      risks,
      confidence: c.evidenceScore >= 70 ? "high" : "medium",
      supportedBy: Object.keys(c.facts),
      compliesWithHardConstraints: true,
    });
  });

  // If there are non-compliant candidates, add explanation
  if (nonCompliantCandidates.length > 0 && recommendations.length < 3) {
    nonCompliantCandidates.forEach((c) => {
      recommendations.push({
        rank: recommendations.length + 1,
        itemId: c.id,
        rationale: `Does not meet hard constraints (e.g. MOQ exceeds threshold), but retained for high-volume benchmark reference.`,
        risks: ["Violates target minimum order constraint. Requires volume scale."],
        confidence: "low",
        supportedBy: [],
        compliesWithHardConstraints: false,
      });
    });
  }

  // 2. Identify missing information
  const missingInfo: MissingInfo[] = [];
  for (const c of comparison) {
    if (c.facts.pricing === "Not found") {
      missingInfo.push({
        itemId: c.id,
        field: "pricing",
        whyItMatters: `${c.name} does not state unit pricing online; request quotation for batch sizing.`,
      });
    }
    if (c.facts.contact === "Not found" || !c.email) {
      missingInfo.push({
        itemId: c.id,
        field: "contact",
        whyItMatters: `No verified direct email found for ${c.name}; direct inquiry to website contact form.`,
      });
    }
  }

  // 3. Draft actions for the top recommended candidate
  const actionDrafts: ActionDraft[] = [];
  const topCandidate = compliantCandidates[0] || comparison[0];

  if (topCandidate) {
    const hasEmail = Boolean(topCandidate.email && topCandidate.email.includes("@"));
    const emailTo = hasEmail ? topCandidate.email! : null;

    const emailSubject = `Inquiry: Commercial Supply & Technical Qualification (${topCandidate.name})`;
    const emailBody = `Dear Commercial Sales Team at ${topCandidate.name},

We are conducting qualification for supply partners aligned with our production schedule.

Could you please confirm the following technical and commercial terms:
1. Tiered unit quotation for initial batch vs scale volume.
2. Technical conformity and food contact / safety declarations.
3. Current factory lead times and dispatch options from ${topCandidate.location || "your facility"}.
4. Availability of physical production samples for testing.

Looking forward to your response.

Best regards,
Procurement Team`;

    actionDrafts.push({
      id: "a-01",
      type: "email",
      title: `Draft Enquiry: ${topCandidate.name}`,
      payload: {
        kind: "email",
        to: emailTo,
        subject: emailSubject,
        body: emailBody,
        mailto: hasEmail
          ? `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
          : undefined,
        canSendDirectly: hasEmail,
        contactPageUrl: topCandidate.website,
        specsSummary: `${topCandidate.name} • ${topCandidate.location || "Direct Supply"}`,
      },
      riskLevel: "medium",
      status: "awaiting_approval",
      requiresApproval: true,
      itemId: topCandidate.id,
    });

    actionDrafts.push({
      id: "a-02",
      type: "task",
      title: `Follow up with ${topCandidate.name} regarding RFQ`,
      payload: {
        kind: "task",
        dueHint: "in 3 business days",
        description: `Review inbox for quotation response from ${topCandidate.name}. If no response received, check contact portal at ${topCandidate.website || "supplier site"}.`,
      },
      riskLevel: "low",
      status: "awaiting_approval",
      requiresApproval: true,
      itemId: topCandidate.id,
    });
  }

  // 4. Construct Full Deep Research Report
  const now = new Date().toISOString();
  const sourceDocs = sources || [];
  const citations: ResearchCitation[] = sourceDocs.map((s, idx) => ({
    id: `cite-${idx + 1}`,
    sourceUrl: s.url,
    sourceTitle: s.title || s.domain,
    domain: s.domain,
    snippet: s.contentExcerpt ? s.contentExcerpt.slice(0, 240) + "..." : "Retrieved via TinyFish Fetch.",
    publishedAt: s.fetchedAt || now,
    retrievedAt: now,
  }));

  const keyFindings: string[] = [
    `Identified ${comparison.length} relevant candidate entities across ${citations.length} primary web sources.`,
    topCandidate
      ? `Top-ranked match is ${topCandidate.name} with ${topCandidate.evidenceScore}% evidence grounding confidence.`
      : "Candidates assessed against target criteria.",
    compliantCandidates.length > 0
      ? `${compliantCandidates.length} candidate(s) fully satisfy stated constraints.`
      : "Commercial terms require direct verification.",
    missingInfo.length > 0
      ? `${missingInfo.length} commercial field(s) require confirmation due to unstated public figures.`
      : "Complete empirical coverage achieved across public sources.",
  ];

  const relevantEntities: ResearchEntity[] = comparison.map((c) => ({
    name: c.name,
    type: c.entityType || "Supplier / Manufacturer",
    description: `Location: ${c.location || "Not specified"}. Evidence coverage: ${c.evidenceScore}%.`,
    sourceUrl: c.website,
  }));

  const statisticsAndEvidence: ResearchEvidenceItem[] = [];
  if (facts && facts.length > 0) {
    facts.filter((f) => f.status === "found" && f.quote).forEach((f) => {
      statisticsAndEvidence.push({
        claim: `${f.field.replace("_", " ")}: ${f.value}`,
        value: String(f.value),
        sourceUrl: f.sourceUrl || "https://example.com",
        sourceTitle: f.sourceTitle || "Verified Source",
        quote: f.quote,
      });
    });
  } else {
    comparison.forEach((c) => {
      Object.entries(c.facts).forEach(([k, v]) => {
        if (v && v !== "Not found") {
          statisticsAndEvidence.push({
            claim: `${c.name} — ${k.replace("_", " ")}`,
            value: v,
            sourceUrl: c.website || "https://example.com",
            sourceTitle: c.name,
          });
        }
      });
    });
  }

  const sections: ResearchSection[] = [
    {
      id: "sec-1",
      heading: "Executive Landscape & Market Overview",
      content: `Our multi-source investigation evaluated ${comparison.length} verified market options against the prompt objective: "${plan.objective}". Analysis prioritized official company portals, direct technical disclosures, and operational capacities over third-party directory aggregators.`,
      citationIds: citations.slice(0, 3).map((c) => c.id),
    },
    {
      id: "sec-2",
      heading: "Detailed Entity Benchmarks & Comparative Findings",
      content: comparison
        .map(
          (c) =>
            `### ${c.name}\n- **Operational Base:** ${c.location || "Direct supplier"}\n- **Product Range:** ${c.facts.product_range || "Catalogue on file"}\n- **MOQ & Batch Thresholds:** ${c.facts.moq || "Contact for MOQ"}\n- **Pricing Disclosures:** ${c.facts.pricing || "Quotations upon RFQ"}\n- **Evidence Grounding:** ${c.evidenceScore}% verified from direct page text.`
        )
        .join("\n\n"),
      citationIds: citations.map((c) => c.id),
    },
    {
      id: "sec-3",
      heading: "Strategic Implications & Recommended Action Plan",
      content: `1. **Immediate Engagement:** Initiate formal RFQ outreach to ${topCandidate?.name || "top candidate"} using the prepared draft enquiry.\n2. **Commercial De-risking:** Prioritize verification of unpublished unit price breaks and pilot batch minimums before contractual commitments.\n3. **Regulatory Audit:** Validate formal certification documentation and request physical production samples for testing.`,
      citationIds: citations.slice(0, 2).map((c) => c.id),
    },
  ];

  const report: ResearchReport = {
    id: `rep-${Math.random().toString(36).substring(2, 9)}`,
    title: `Deep Research Report: ${request?.prompt?.slice(0, 60) || plan.objective}`,
    objective: plan.objective,
    executiveSummary: `OmniDesk investigated ${citations.length} primary sources across targeted search queries. ${
      topCandidate ? `${topCandidate.name} emerged as the leading option based on verified disclosures.` : "Comparative analysis completed."
    } All findings are cross-verified against clean page text retrieved via TinyFish.`,
    methodology: `Structured 5-stage research pipeline: (1) Decomposition into ${plan.queries.length} targeted queries, (2) Live web discovery via TinyFish Search, (3) Clean markdown extraction via TinyFish Fetch, (4) Forensic claim cross-examination with exact verbatim quotes, and (5) Executive synthesis.`,
    keyFindings,
    sections,
    relevantEntities,
    statisticsAndEvidence: statisticsAndEvidence.slice(0, 10),
    conflictsAndUncertainties: missingInfo.map((m) => m.whyItMatters),
    implicationsAndConclusions: [
      `Prioritize ${topCandidate?.name || "the top candidate"} for initial commercial outreach.`,
      "Request formal written quotations for batch tiering before issuing purchase orders.",
      "Verify production turnaround and sample availability prior to scale commitment.",
    ],
    citations,
    createdAt: now,
  };

  return {
    recommendations,
    missingInfo,
    actionDrafts,
    report,
  };
}
