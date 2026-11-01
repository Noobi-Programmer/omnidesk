import type { ResearchRequest, ResearchIntent, ResearchPlan } from "@/lib/contracts";

export function detectIntentFromPrompt(prompt: string): ResearchIntent {
  const p = prompt.toLowerCase();

  if (
    p.includes("supplier") ||
    p.includes("manufacturer") ||
    p.includes("factory") ||
    p.includes("packaging") ||
    p.includes("moq") ||
    p.includes("boxes") ||
    p.includes("casing") ||
    p.includes("cans") ||
    p.includes("vendor") ||
    p.includes("sourcing")
  ) {
    return "supplier";
  }

  if (p.includes("competitor") || p.includes("alternatives") || p.includes("vs ") || p.includes("compare competitors")) {
    return "competitor";
  }

  if (
    p.includes("startup") ||
    p.includes("founder") ||
    p.includes("funding") ||
    p.includes("seed round") ||
    p.includes("series a") ||
    p.includes("venture capital") ||
    p.includes("vc") ||
    p.includes("valuation") ||
    p.includes("investor")
  ) {
    return "startup";
  }

  if (
    p.includes("market") ||
    p.includes("industry") ||
    p.includes("ecosystem") ||
    p.includes("cagr") ||
    p.includes("regulation") ||
    p.includes("growth") ||
    p.includes("forecast")
  ) {
    return "market";
  }

  if (
    p.includes("technology") ||
    p.includes("model") ||
    p.includes("architecture") ||
    p.includes("benchmark") ||
    p.includes("algorithm") ||
    p.includes("ai agent") ||
    p.includes("llm") ||
    p.includes("compute")
  ) {
    return "technology";
  }

  if (p.includes("company") || p.includes("revenue") || p.includes("business model") || p.includes("acquisition")) {
    return "company";
  }

  if (p.includes("product") || p.includes("specs") || p.includes("pricing tiers")) {
    return "product";
  }

  return "general";
}

export function createPlanPrompt(request: ResearchRequest): { prompt: string; systemInstruction: string } {
  const intent = detectIntentFromPrompt(request.prompt);
  const mode = request.mode || "standard";
  const searchBudget = mode === "quick" ? 2 : mode === "deep" ? 5 : 3;

  const systemInstruction = `You are OmniDesk, an expert AI Research Architect and Strategic Planner.
Your role is to decompose a user's natural language research objective into a rigorous, multi-query research plan.

Classify the intent into one of:
- general: Broad multi-source investigation across news, reports, analysis, and websites.
- startup: Startups, founders, funding rounds, valuations, and venture capital.
- competitor: Competitive landscape, feature matrices, and market positioning.
- supplier: Physical suppliers, manufacturers, commercial MOQ, and factory capabilities.
- market: Industry trends, market sizing, economic data, and regulatory shifts.
- technology: Technical systems, AI models, architectures, and benchmarks.
- company: Corporate analysis, business models, executive leadership, and acquisitions.
- product: Product specifications, pricing, reviews, and capabilities.

Guidelines:
1. Generate exactly ${searchBudget} distinct targeted queries. Each query MUST tackle a distinct angle of the question (e.g. foundational facts, key players, metrics/pricing, recent developments, risks/limitations).
2. For supplier intent: target official manufacturer domains, factory specs, and commercial MOQs.
3. For non-supplier intent: NEVER force supplier terms. Allow and target credible news, blogs, technical reports, and company websites.
4. Output valid JSON matching the schema.`;

  const prompt = `Generate a ${mode} research plan (${searchBudget} search queries) for:
PROMPT: "${request.prompt}"
DETECTED INTENT: "${intent}"
MODE: "${mode}"

Return JSON matching this structure:
{
  "objective": "Concise summary of research objective",
  "intent": "${intent}",
  "entityType": "${intent === "supplier" ? "supplier" : intent === "competitor" ? "competitor" : "general"}",
  "queries": [
    { "id": "q1", "query": "Targeted query 1", "purpose": "Angle 1 purpose" },
    { "id": "q2", "query": "Targeted query 2", "purpose": "Angle 2 purpose" }
  ],
  "extractionFields": [
    { "key": "key_metric_1", "label": "Key Metric 1", "kind": "string" },
    { "key": "key_metric_2", "label": "Key Metric 2", "kind": "string" }
  ],
  "comparisonCriteria": ["key_metric_1", "key_metric_2"],
  "actionHints": [
    { "type": "task", "instruction": "Follow-up investigation or decision" }
  ],
  "budgets": {
    "maxSearches": ${searchBudget},
    "maxFetchUrls": ${searchBudget * 3},
    "maxAgentRuns": 0
  }
}`;

  return { prompt, systemInstruction };
}
