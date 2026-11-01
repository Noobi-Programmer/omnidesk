import type { Recommendation, ComparisonItem, ResearchPlan } from "@/lib/contracts";

export function createDraftActionPrompt(
  topRec: Recommendation,
  supplier: ComparisonItem,
  plan: ResearchPlan
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `You are an executive assistant drafting high-converting, professional business correspondence.
RULES:
1. Address the verified supplier company name directly (e.g. "${supplier.name} Sales Team"). NEVER address an article title, blog headline, or unrelated company.
2. If an official email is known, populate "to". If no email was found, set "to" to null.
3. Be concise, polite, and specific: request their product catalogue, volume pricing tiers, sample kit, and lead times.
4. Output valid JSON only.`;

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const rawEmail = supplier.facts.email || supplier.facts.contact || "";
  const matchedEmail = rawEmail.match(emailRegex)?.[0] || null;

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
        "to": ${matchedEmail ? JSON.stringify(matchedEmail) : "null"},
        "canSendDirectly": ${matchedEmail ? "true" : "false"},
        "contactPageUrl": "${supplier.website || ""}",
        "subject": "Enquiry: Custom Packaging RFQ for D2C Brand",
        "body": "Hello ${supplier.name} Sales Team,\n\nWe are looking to source custom packaging boxes for our D2C brand in Bengaluru...\n\nCould you please share your latest product catalogue, MOQ requirements, and unit price breaks for 500 to 2,000 units?\n\nThank you,\nProcurement Team"
      },
      "riskLevel": "medium",
      "status": "awaiting_approval",
      "requiresApproval": true,
      "itemId": "${supplier.id}"
    },
    {
      "id": "a-02",
      "type": "task",
      "title": "Follow up with ${supplier.name}",
      "payload": {
        "kind": "task",
        "dueHint": "in 3 business days",
        "description": "Check email or call ${supplier.facts.phone || "sales desk"} for catalogue and sample kit status"
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
