import type { Recommendation, ComparisonItem, ResearchPlan } from "@/lib/contracts";

export function createDraftActionPrompt(
  topRec: Recommendation,
  supplier: ComparisonItem,
  plan: ResearchPlan
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are an executive assistant drafting high-converting, professional business correspondence.
Write a concise, polite, and specific Request for Quotation (RFQ) or business enquiry email.
Include specific questions regarding any missing information (e.g. volume discounts, custom lead times).
Output valid JSON only.`;

  const prompt = `SUPPLIER: ${supplier.name}
WEBSITE: ${supplier.website || "N/A"}
KNOWN FACTS: ${JSON.stringify(supplier.facts)}
RATIONALE: ${topRec.rationale}
RESEARCH OBJECTIVE: ${plan.objective}

Draft an enquiry email and a follow-up task. Return JSON:
{
  "actionDrafts": [
    {
      "id": "a-01",
      "type": "email",
      "title": "Enquiry & RFQ: ${supplier.name}",
      "payload": {
        "kind": "email",
        "to": "${supplier.facts.contact?.includes("@") ? supplier.facts.contact.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/)?.[0] || null : null}",
        "subject": "Enquiry: Custom Quotation for D2C Brand",
        "body": "Professional email body text here..."
      },
      "riskLevel": "medium",
      "status": "awaiting_approval",
      "requiresApproval": true,
      "itemId": "${supplier.id}"
    },
    {
      "id": "a-02",
      "type": "task",
      "title": "Follow up with ${supplier.name} if no response",
      "payload": {
        "kind": "task",
        "dueHint": "in 3 business days",
        "description": "Check email for catalogue or call sales desk"
      },
      "riskLevel": "low",
      "status": "awaiting_approval",
      "requiresApproval": true,
      "itemId": "${supplier.id}"
    }
  ]
}`;

  return { prompt, systemInstruction };
}
