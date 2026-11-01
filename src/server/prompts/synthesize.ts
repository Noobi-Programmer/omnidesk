import type { ComparisonItem, ResearchPlan } from "@/lib/contracts";

export function createSynthesisPrompt(
  comparison: ComparisonItem[],
  plan: ResearchPlan
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are the Chief of Staff synthesizing comparative supplier research for an executive.
Your job is to:
1. Objectively rank ONLY qualified supplier/manufacturer entities based on empirical evidence and fit.
2. Ground your rationale in verified facts (product range, local manufacturing facility, stated MOQs).
3. If critical commercial terms (like pricing or MOQ) are not published, explicitly flag them as risks to verify.
4. If fewer than 3 candidates are qualified suppliers, synthesize ONLY the qualified ones. NEVER invent or fabricate filler candidates.
5. Output valid JSON only.`;

  const qualifiedItems = comparison.filter((c) => c.isQualifiedSupplier);
  const comparisonJson = JSON.stringify(qualifiedItems.length > 0 ? qualifiedItems : comparison, null, 2);

  const prompt = `OBJECTIVE: "${plan.objective}"
COMPARISON CRITERIA: ${plan.comparisonCriteria.join(", ")}

CANDIDATE COMPARISON DATA:
${comparisonJson}

Please synthesize recommendations and identify missing critical information. Return JSON with this structure:
{
  "recommendations": [
    {
      "rank": 1,
      "itemId": "c-...",
      "rationale": "Clear executive rationale explaining fit based on verified facts and geography...",
      "risks": ["Specific unverified item to confirm in writing..."],
      "confidence": "high" // "high" | "medium" | "low"
    }
  ],
  "missingInfo": [
    {
      "itemId": "c-...",
      "field": "pricing",
      "whyItMatters": "Why this missing detail affects decisions..."
    }
  ]
}`;

  return { prompt, systemInstruction };
}
