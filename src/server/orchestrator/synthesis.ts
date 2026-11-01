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
  const isSupplier = plan.intent === "supplier" || plan.entityType === "supplier";

  // 1. Separate compliant candidates from non-compliant candidates
  const compliantCandidates = comparison.filter((c) => c.constraintFit !== "does_not_meet");
  const nonCompliantCandidates = comparison.filter((c) => c.constraintFit === "does_not_meet");

  // Sort compliant by evidence score descending
  compliantCandidates.sort((a, b) => b.evidenceScore - a.evidenceScore);

  const recommendations: Recommendation[] = [];

  if (isSupplier) {
    // ----------------------------------------------------
    // SUPPLIER INTENT: SUPPLIER QUALIFICATION & SOURCING
    // ----------------------------------------------------
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
  } else {
    // ----------------------------------------------------
    // NON-SUPPLIER INTENT: STARTUPS, COMPETITORS, MARKETS, TECH
    // ----------------------------------------------------
    const allCandidates = [...compliantCandidates, ...nonCompliantCandidates];
    allCandidates.sort((a, b) => b.evidenceScore - a.evidenceScore);

    allCandidates.slice(0, 3).forEach((c, idx) => {
      const rank = idx + 1;
      let rationale = "";
      const risks: string[] = [];

      const entityLabel = c.entityType || (plan.intent === "startup" ? "Startup" : plan.intent === "competitor" ? "Competitor" : "Entity");

      if (rank === 1) {
        rationale = `Primary ${entityLabel.toLowerCase()} discovery with highest factual backing (${c.evidenceScore}% evidence score). Disclosed in official sources with actionable benchmarks.`;
      } else if (rank === 2) {
        rationale = `Prominent ${entityLabel.toLowerCase()} with corroborated market presence and substantive public documentation.`;
      } else {
        rationale = `Relevant ${entityLabel.toLowerCase()} operating within target domain; provides comparative baseline.`;
      }

      // Context-aware risks (NO supplier MOQ/pricing mentions)
      if (c.facts.quantitative_data === "Not found") {
        risks.push("Quantitative metrics or funding figures not disclosed in public page text.");
      }
      if (c.facts.timeline_or_milestone === "Not found") {
        risks.push("Specific roadmap timeline or founding date not verified from primary source.");
      }

      recommendations.push({
        rank,
        itemId: c.id,
        rationale,
        risks: risks.length > 0 ? risks : ["Subject to ongoing market and technological developments."],
        confidence: c.evidenceScore >= 60 ? "high" : "medium",
        supportedBy: Object.keys(c.facts),
        compliesWithHardConstraints: true,
      });
    });
  }

  // 2. Identify missing information (intent-specific)
  const missingInfo: MissingInfo[] = [];
  for (const c of comparison) {
    if (isSupplier) {
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
    } else {
      if (c.facts.quantitative_data === "Not found") {
        missingInfo.push({
          itemId: c.id,
          field: "quantitative_data",
          whyItMatters: `Specific quantitative metrics or performance benchmarks for ${c.name} were unstated in public page text.`,
        });
      }
      if (c.facts.timeline_or_milestone === "Not found") {
        missingInfo.push({
          itemId: c.id,
          field: "timeline_or_milestone",
          whyItMatters: `Specific deployment timeline or founding year for ${c.name} not confirmed in fetched source.`,
        });
      }
    }
  }

  // 3. Draft actions (strictly branch on intent)
  const actionDrafts: ActionDraft[] = [];
  const topCandidate = compliantCandidates[0] || comparison[0];

  if (isSupplier && topCandidate) {
    // SUPPLIER RFQ WORKFLOW
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
  } else if (!isSupplier && topCandidate) {
    // RESEARCH & STRATEGY ACTIONS (NO SUPPLIER RFQs, NO PRODUCTION SAMPLES)
    actionDrafts.push({
      id: "a-01",
      type: "task",
      title: `Deep-dive into ${topCandidate.name}'s architecture & public disclosures`,
      payload: {
        kind: "task",
        dueHint: "in 2 business days",
        description: `Review detailed technical documentation, developer notes, and product announcements for ${topCandidate.name} to evaluate competitive positioning.`,
      },
      riskLevel: "low",
      status: "awaiting_approval",
      requiresApproval: true,
      itemId: topCandidate.id,
    });

    actionDrafts.push({
      id: "a-02",
      type: "task",
      title: `Synthesize market insights into executive briefing`,
      payload: {
        kind: "task",
        dueHint: "in 1 week",
        description: `Incorporate key findings and comparative metrics from this research run into the strategic product roadmap and founder intelligence archive.`,
      },
      riskLevel: "low",
      status: "awaiting_approval",
      requiresApproval: true,
      itemId: topCandidate.id,
    });
  }

  // 4. Construct Full Deep Research Report
  const now = new Date().toISOString();
  // Only cite successfully fetched sources
  const usableSources = (sources || []).filter(
    (s) => s.status !== "failed" && Boolean(s.url)
  );

  const citations: ResearchCitation[] = usableSources.map((s, idx) => ({
    id: `cite-${idx + 1}`,
    sourceUrl: s.url,
    sourceTitle: s.title || s.domain,
    domain: s.domain,
    snippet: s.contentExcerpt ? s.contentExcerpt.slice(0, 240) + "..." : "Retrieved via TinyFish Fetch.",
    publishedAt: undefined, // Truthful dates: do not fabricate retrieval time as publication date
    retrievedAt: s.fetchedAt || now,
  }));

  const keyFindings: string[] = [
    `Investigated ${citations.length} primary web sources retrieved via TinyFish for: "${plan.objective.slice(0, 70)}"`,
    topCandidate
      ? `Top-ranked entity is ${topCandidate.name} with ${topCandidate.evidenceScore}% evidence grounding confidence.`
      : "Candidates assessed against target criteria.",
    isSupplier
      ? (compliantCandidates.length > 0
          ? `${compliantCandidates.length} supplier candidate(s) satisfy stated constraints.`
          : "Commercial terms require direct verification.")
      : `Extracted ${comparison.length} relevant candidate profile(s) with verifiable disclosures.`,
    missingInfo.length > 0
      ? `${missingInfo.length} question(s) remain open based on available public disclosures.`
      : "Core questions substantiated by public source documentation.",
  ];

  const relevantEntities: ResearchEntity[] = comparison.map((c) => ({
    name: c.name,
    type: c.entityType || (isSupplier ? "Supplier / Manufacturer" : "Entity"),
    description: isSupplier
      ? `Location: ${c.location || "Not specified"}. Evidence coverage: ${c.evidenceScore}%.`
      : `Identified in research for ${plan.intent}. Evidence score: ${c.evidenceScore}%.`,
    sourceUrl: c.website,
  }));

  const statisticsAndEvidence: ResearchEvidenceItem[] = [];
  if (facts && facts.length > 0) {
    facts.filter((f) => f.status === "found" && f.quote && f.sourceUrl).forEach((f) => {
      statisticsAndEvidence.push({
        claim: `${f.field.replace("_", " ")}: ${f.value}`,
        value: String(f.value),
        sourceUrl: f.sourceUrl!,
        sourceTitle: f.sourceTitle || "Verified Source",
        quote: f.quote,
      });
    });
  } else {
    comparison.forEach((c) => {
      if (!c.website) return;
      Object.entries(c.facts).forEach(([k, v]) => {
        if (v && v !== "Not found") {
          statisticsAndEvidence.push({
            claim: `${c.name} — ${k.replace("_", " ")}`,
            value: v,
            sourceUrl: c.website!,
            sourceTitle: c.name,
          });
        }
      });
    });
  }

  const sections: ResearchSection[] = isSupplier
    ? [
        {
          id: "sec-1",
          heading: "Executive Landscape & Supplier Overview",
          content: `Our multi-source investigation evaluated ${comparison.length} verified supplier candidate(s) against the prompt objective: "${plan.objective}". Analysis prioritized official company portals, direct technical disclosures, and operational capacities over third-party directory aggregators.`,
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
      ]
    : [
        {
          id: "sec-1",
          heading: "Executive Overview & Landscape Investigation",
          content: `OmniDesk investigated ${citations.length} primary web sources across targeted search queries for "${plan.objective}". The findings synthesize public disclosures, technical whitepapers, and operational announcements discovered via TinyFish.`,
          citationIds: citations.slice(0, 3).map((c) => c.id),
        },
        {
          id: "sec-2",
          heading: "Comparative Findings & Grounded Evidence Benchmarks",
          content: comparison
            .map(
              (c) =>
                `### ${c.name}\n- **Category / Entity Type:** ${c.entityType || "Market Player"}\n- **Core Takeaway:** ${c.facts.key_findings || "Documented in source archives"}\n- **Metrics & Benchmarks:** ${c.facts.quantitative_data || "Unstated in public disclosures"}\n- **Timeline & Milestones:** ${c.facts.timeline_or_milestone || "Ongoing operation"}\n- **Evidence Grounding:** ${c.evidenceScore}% verified from source markdown.`
            )
            .join("\n\n"),
          citationIds: citations.map((c) => c.id),
        },
        {
          id: "sec-3",
          heading: "Strategic Implications & Forward Outlook",
          content: `1. **Ecosystem Momentum:** Discovered sources demonstrate active development in this domain with distinct approaches across market participants.\n2. **Factual Verification:** Review grounded statistics and individual source citations for high-impact decisions.\n3. **Continuous Tracking:** Set up TinyFish topic monitoring to track emerging announcements and regulatory updates.`,
          citationIds: citations.slice(0, 2).map((c) => c.id),
        },
      ];

  const report: ResearchReport = {
    id: `rep-${Math.random().toString(36).substring(2, 9)}`,
    title: `Deep Research Report: ${request?.prompt?.slice(0, 60) || plan.objective}`,
    objective: plan.objective,
    executiveSummary: `OmniDesk investigated ${citations.length} primary source(s) across targeted queries. ${
      topCandidate ? `${topCandidate.name} was identified with strongest factual backing.` : "Comparative analysis completed."
    } Findings are grounded in sources retrieved via TinyFish.`,
    methodology: `Structured 5-stage research pipeline: (1) Query decomposition into ${plan.queries.length} targeted queries, (2) Live web discovery via TinyFish Search, (3) Clean markdown extraction via TinyFish Fetch, (4) Factual claim extraction, and (5) Executive synthesis.`,
    keyFindings,
    sections,
    relevantEntities,
    statisticsAndEvidence: statisticsAndEvidence.slice(0, 10),
    conflictsAndUncertainties: missingInfo.map((m) => m.whyItMatters),
    implicationsAndConclusions: isSupplier
      ? [
          `Prioritize ${topCandidate?.name || "the top candidate"} for initial commercial outreach.`,
          "Request formal written quotations for batch tiering before issuing purchase orders.",
          "Verify production turnaround and sample availability prior to scale commitment.",
        ]
      : [
          `Synthesize findings for ${topCandidate?.name || "lead candidates"} into ongoing strategic plans.`,
          "Monitor emerging regulatory and competitive shifts across primary sources.",
          "Validate core metrics directly against primary whitepapers and official disclosures.",
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
