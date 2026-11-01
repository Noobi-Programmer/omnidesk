import type {
  ComparisonItem,
  Recommendation,
  MissingInfo,
  ActionDraft,
  ResearchPlan,
} from "@/lib/contracts";

export interface SynthesisOutput {
  recommendations: Recommendation[];
  missingInfo: MissingInfo[];
  actionDrafts: ActionDraft[];
}

export function synthesizeRecommendationsAndActions(
  comparison: ComparisonItem[],
  plan: ResearchPlan
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

  return {
    recommendations,
    missingInfo,
    actionDrafts,
  };
}
