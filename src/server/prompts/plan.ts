import type { ResearchRequest } from "@/lib/contracts";

export function createPlanPrompt(request: ResearchRequest): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are OmniDesk, an expert Chief of Staff and strategic research planner.
Your role is to decompose a business research request into:
1. A clear research objective.
2. The entity type being researched (supplier, competitor, product, service, or general).
3. 2 to 3 targeted, high-precision search queries tailored for search engines in the target location (default India / 'IN').
4. A concise schema of extraction fields (e.g. pricing, MOQ, delivery, credibility, contact) to benchmark options.
5. Action hints (outreach email, follow-up task).

You must respond ONLY with valid JSON matching the expected schema.`;

  const prompt = `Please generate a research plan for the following founder request:
PROMPT: "${request.prompt}"
MODE: "${request.mode}"
BUSINESS CONTEXT: "${request.context?.businessContext || "Indian business / D2C operator"}"
LOCALE: "${request.context?.locale || "en-IN"}"

Return JSON with this structure:
{
  "objective": "...",
  "entityType": "supplier",
  "queries": [
    { "id": "q1", "query": "...", "purpose": "..." },
    { "id": "q2", "query": "...", "purpose": "..." }
  ],
  "extractionFields": [
    { "key": "product_range", "label": "Product Range", "kind": "string" },
    { "key": "pricing", "label": "Indicative Pricing", "kind": "string" },
    { "key": "moq", "label": "Minimum Order Quantity", "kind": "string" },
    { "key": "delivery", "label": "Delivery Terms & Lead Time", "kind": "string" },
    { "key": "credibility", "label": "Credibility & Certifications", "kind": "string" },
    { "key": "contact", "label": "Contact Details", "kind": "string" }
  ],
  "comparisonCriteria": ["product_range", "pricing", "moq", "delivery", "credibility", "contact"],
  "actionHints": [
    { "type": "email", "instruction": "..." },
    { "type": "task", "instruction": "..." }
  ],
  "budgets": {
    "maxSearches": 4,
    "maxFetchUrls": 10,
    "maxAgentRuns": 1
  }
}`;

  return { prompt, systemInstruction };
}
