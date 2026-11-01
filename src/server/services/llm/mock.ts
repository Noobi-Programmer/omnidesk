import type { LLMProvider, LLMCompletionOptions } from "./provider";

export class MockLLMProvider implements LLMProvider {
  name = "mock";

  async complete<T>(options: LLMCompletionOptions<T>): Promise<T> {
    const prompt = options.prompt.toLowerCase();

    // 1. Planning phase
    if (prompt.includes("generate a research plan") || prompt.includes("planning")) {
      const plan = {
        objective: "Identify, verify, and compare reliable packaging suppliers in Bengaluru for small D2C brands",
        entityType: "supplier",
        queries: [
          {
            id: "q1",
            query: "custom packaging manufacturers suppliers Bengaluru D2C boxes",
            purpose: "Discover primary packaging manufacturer websites",
          },
          {
            id: "q2",
            query: "Bengaluru corrugated box mailer manufacturer MOQ pricing contact",
            purpose: "Identify commercial terms, minimum order quantities, and contact details",
          },
        ],
        extractionFields: [
          { key: "product_range", label: "Product Range", kind: "string" },
          { key: "pricing", label: "Indicative Pricing", kind: "string" },
          { key: "moq", label: "Minimum Order Quantity", kind: "string" },
          { key: "delivery", label: "Delivery Terms & Lead Time", kind: "string" },
          { key: "credibility", label: "Credibility & Certifications", kind: "string" },
          { key: "contact", label: "Contact Details", kind: "string" },
        ],
        comparisonCriteria: ["product_range", "pricing", "moq", "delivery", "credibility", "contact"],
        actionHints: [
          { type: "email", instruction: "Draft enquiry email requesting custom catalogue, sample box, and slab pricing" },
          { type: "task", instruction: "Schedule follow-up phone call in 3 business days" },
        ],
        budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
      };
      if (options.schema) return options.schema.parse(plan);
      return plan as T;
    }

    // 2. Extraction phase
    if (prompt.includes("extract structured facts") || prompt.includes("extraction")) {
      const facts = {
        suppliers: [
          {
            name: "PrintPack Industries",
            facts: {
              product_range: "Custom corrugated boxes, rigid boxes, self-sealing mailers",
              pricing: "₹18–₹42 per unit depending on flute and print volume",
              moq: "250 units",
              delivery: "Karnataka 48 hours; Pan-India 5–7 business days",
              credibility: "ISO 9001:2015 certified; 12+ years operating history; supplies 40+ D2C brands",
              contact: "sales@printpack.co.in | +91 80 4123 4567 | Peenya Industrial Area, Bengaluru",
            },
            quotes: {
              pricing: "Indicative rates for 3-ply corrugated box start at Rs 18 to Rs 42 per unit based on volume",
              moq: "Minimum order quantity starts at just 250 units for custom printed mailer boxes",
              delivery: "Standard dispatch within 48 hours for Bengaluru and Karnataka",
            },
          },
          {
            name: "EcoPack Solutions",
            facts: {
              product_range: "Biodegradable mailer bags, honeycomb paper rolls, recycled kraft boxes",
              pricing: null, // Honest unknown
              moq: "500 units per SKU",
              delivery: "Pan-India delivery within 5–6 business days",
              credibility: "FSSAI compliant & FSC certified recycled paper; 8 years in sustainable packaging",
              contact: "contact@ecopack-india.com | +91 98450 12345 | Whitefield, Bengaluru",
            },
            quotes: {
              moq: "All custom kraft mailers require a minimum initial batch of 500 units per SKU",
              credibility: "FSC-certified 100% post-consumer recycled paper",
            },
          },
          {
            name: "Bangalore Box Co.",
            facts: {
              product_range: "Heavy-duty shipping cartons, mono cartons, die-cut shipping boxes",
              pricing: "₹12–₹28 per shipping box",
              moq: "1,000 units",
              delivery: "Local delivery in Bengaluru within 24 hours",
              credibility: "30+ years in manufacturing; Peenya Industrial cluster",
              contact: "support@blrboxco.in | +91 80 2839 0000",
            },
            quotes: {
              moq: "Bulk production runs with MOQ of 1,000 cartons",
            },
          },
        ],
      };
      if (options.schema) return options.schema.parse(facts);
      return facts as T;
    }

    // 3. Synthesis & Recommendations phase
    if (prompt.includes("synthesize") || prompt.includes("recommendation")) {
      const synthesis = {
        recommendations: [
          {
            rank: 1,
            itemId: "c-01",
            supplierName: "PrintPack Industries",
            rationale: "Best overall fit for a small D2C brand due to accessible MOQ (250 units), transparent published pricing (₹18-₹42), fast local dispatch (48h), and ISO certification.",
            risks: ["Unit economics higher for smaller 250-unit run; request tiered price breaks for 500+ units."],
            confidence: "high",
            supportedBy: ["f-moq-1", "f-price-1"],
          },
          {
            rank: 2,
            itemId: "c-02",
            supplierName: "EcoPack Solutions",
            rationale: "Ideal if brand identity prioritizes eco-friendly/sustainable credentials (FSC certified recycled materials).",
            risks: ["Pricing is not published online and requires direct quotation; MOQ is higher at 500 units."],
            confidence: "medium",
            supportedBy: ["f-moq-2"],
          },
          {
            rank: 3,
            itemId: "c-03",
            supplierName: "Bangalore Box Co.",
            rationale: "Lowest unit cost for standard corrugated shipping cartons, but high MOQ (1,000 units) requires more working capital.",
            risks: ["High MOQ of 1,000 units; less suited for pilot stage D2C batches."],
            confidence: "high",
            supportedBy: ["f-moq-3"],
          },
        ],
        missingInfo: [
          {
            itemId: "c-02",
            field: "pricing",
            whyItMatters: "EcoPack Solutions does not publish unit pricing online; quotation required before finalizing budget.",
          },
        ],
        conflicts: [],
      };
      if (options.schema) return options.schema.parse(synthesis);
      return synthesis as T;
    }

    // 4. Action Drafting phase
    const draft = {
      actionDrafts: [
        {
          id: "a-01",
          type: "email",
          title: "Request for Quotation: Custom Boxes (PrintPack Industries)",
          payload: {
            kind: "email",
            to: "sales@printpack.co.in",
            subject: "Enquiry: Custom Corrugated Packaging for D2C Brand (Batch of 250-500 units)",
            body: "Hello PrintPack Team,\n\nWe are an emerging D2C brand based in Bengaluru and came across your custom packaging offerings. We are looking to order custom corrugated mailer boxes (E-flute) with 2-color branding.\n\nCould you please share:\n1. Your sample kit or digital catalogue\n2. Tiered unit quotation for 250, 500, and 1,000 units\n3. Typical lead time from artwork confirmation to dispatch\n\nLooking forward to partnering with you.\n\nBest regards,\nOperations Lead",
          },
          riskLevel: "medium",
          status: "awaiting_approval",
          requiresApproval: true,
          itemId: "c-01",
        },
        {
          id: "a-02",
          type: "task",
          title: "Follow up with PrintPack Industries if no response by Thursday",
          payload: {
            kind: "task",
            dueHint: "in 3 business days",
            description: "Check inbox for PrintPack quotation. If not received, call sales desk at +91 80 4123 4567.",
          },
          riskLevel: "low",
          status: "awaiting_approval",
          requiresApproval: true,
          itemId: "c-01",
        },
      ],
    };

    if (options.schema) return options.schema.parse(draft);
    return draft as T;
  }
}
