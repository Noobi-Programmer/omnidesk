import type { ComparisonItem, ResearchPlan } from "@/lib/contracts";

export function createSynthesisPrompt(
  comparison: ComparisonItem[],
  plan: ResearchPlan
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are the Chief of Staff synthesizing comparative research for an executive.
Your job is to:
1. Objectively rank the candidate entities based on fit for the objective.
2. Identify distinct rationale and key business risks for each candidate.
3. Explicitly identify critical missing information that the user must verify before buying/engaging.
4. Output valid JSON only.`;

  const comparisonJson = JSON.stringify(comparison, null, 2);

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
      "rationale": "Clear executive rationale explaining why this is #1...",
      "risks": ["Specific risk to confirm..."],
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
