import type { ResearchRequest } from "@/lib/contracts";

export function createPlanPrompt(request: ResearchRequest): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are OmniDesk, an expert Chief of Staff and strategic research planner.
Your role is to decompose a business research request into:
1. A clear research objective.
2. The entity type being researched (supplier, competitor, product, service, or general).
3. 2 to 3 targeted, high-precision search queries tailored to find actual manufacturer/supplier websites rather than blog articles or courier directories.
   - Always include the target location (e.g. "Bengaluru" or "Peenya Industrial Area").
   - Target direct factory/manufacturing keywords (e.g. "corrugated box manufacturers factory Bengaluru", "packaging boxes suppliers Bengaluru direct").
4. A concise schema of extraction fields:
   - product_range
   - pricing
   - moq
   - delivery
   - credibility
   - email
   - phone
   - location
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
    { "id": "q1", "query": "packaging manufacturers factory Peenya Bengaluru", "purpose": "Find direct packaging manufacturer websites in Bengaluru industrial clusters" },
    { "id": "q2", "query": "corrugated mailer box supplier Bengaluru MOQ pricing contact", "purpose": "Find commercial terms, minimum order quantities, and direct contact details" }
  ],
  "extractionFields": [
    { "key": "product_range", "label": "Product Range", "kind": "string" },
    { "key": "pricing", "label": "Indicative Pricing", "kind": "string" },
    { "key": "moq", "label": "Minimum Order Quantity", "kind": "string" },
    { "key": "delivery", "label": "Delivery Terms & Lead Time", "kind": "string" },
    { "key": "credibility", "label": "Credibility & Certifications", "kind": "string" },
    { "key": "email", "label": "Official Email", "kind": "string" },
    { "key": "phone", "label": "Phone Number", "kind": "string" },
    { "key": "location", "label": "Factory / Office Location", "kind": "string" }
  ],
  "comparisonCriteria": ["product_range", "pricing", "moq", "delivery", "credibility", "email", "phone", "location"],
  "actionHints": [
    { "type": "email", "instruction": "Draft specific RFQ enquiry email to top verified supplier" },
    { "type": "task", "instruction": "Schedule follow-up call in 3 business days" }
  ],
  "budgets": {
    "maxSearches": 4,
    "maxFetchUrls": 10,
    "maxAgentRuns": 1
  }
}`;

  return { prompt, systemInstruction };
}
