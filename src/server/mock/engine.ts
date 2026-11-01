import type {
  ResearchRequest,
  ResearchResponse,
  SseEventName,
  ApiResponse,
} from "@/lib/contracts";

export class MockResearchEngine {
  async execute(
    request: ResearchRequest,
    onEvent: (event: SseEventName, data: unknown) => void
  ): Promise<ResearchResponse> {
    const taskId = `mock-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    // Stage 1: Planning
    onEvent("progress", {
      stage: "planning",
      progress: 10,
      message: "Formulating research plan and target extraction fields...",
    });
    await new Promise((r) => setTimeout(r, 400));

    const plan = {
      objective: "Identify, verify, and compare reliable packaging suppliers in Bengaluru for small D2C brands",
      entityType: "supplier" as const,
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
        { key: "product_range", label: "Product Range", kind: "string" as const },
        { key: "pricing", label: "Indicative Pricing", kind: "string" as const },
        { key: "moq", label: "Minimum Order Quantity", kind: "string" as const },
        { key: "delivery", label: "Delivery Terms & Lead Time", kind: "string" as const },
        { key: "credibility", label: "Credibility & Certifications", kind: "string" as const },
        { key: "contact", label: "Contact Details", kind: "string" as const },
      ],
      comparisonCriteria: ["product_range", "pricing", "moq", "delivery", "credibility", "contact"],
      actionHints: [
        { type: "email" as const, instruction: "Draft enquiry email requesting custom catalogue, sample box, and slab pricing" },
        { type: "task" as const, instruction: "Schedule follow-up phone call in 3 business days" },
      ],
      budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
    };
    onEvent("plan", plan);

    // Stage 2: Searching
    onEvent("progress", {
      stage: "searching",
      progress: 30,
      message: "Searching live web via TinyFish Search (14 results discovered)...",
    });
    await new Promise((r) => setTimeout(r, 400));

    const searchResults = [
      {
        id: "sr-1",
        queryId: "q1",
        position: 1,
        title: "PrintPack Industries — Custom Corrugated Packaging Bengaluru",
        url: "https://example-printpack.in",
        domain: "example-printpack.in",
        snippet: "Leading manufacturer of customized packaging boxes, e-flute mailers, and mono cartons in Peenya, Bengaluru.",
      },
      {
        id: "sr-2",
        queryId: "q1",
        position: 2,
        title: "EcoPack Solutions India — Sustainable D2C Mailer Boxes",
        url: "https://example-ecopack.in",
        domain: "example-ecopack.in",
        snippet: "Eco-friendly, FSC certified biodegradable boxes and paper honeycomb cushioning for D2C brands in Bengaluru.",
      },
      {
        id: "sr-3",
        queryId: "q2",
        position: 3,
        title: "Bangalore Box Company — Industrial Shipping Cartons",
        url: "https://example-blrbox.co.in",
        domain: "example-blrbox.co.in",
        snippet: "Bulk packaging and heavy-duty shipping cartons manufacturer since 1994. Peenya Industrial cluster.",
      },
    ];

    // Stage 3: Fetching
    onEvent("progress", {
      stage: "fetching",
      progress: 50,
      message: "Fetching clean page Markdown via TinyFish Fetch (3 sites)...",
    });
    await new Promise((r) => setTimeout(r, 400));

    const sources = [
      {
        id: "s-1",
        url: "https://example-printpack.in",
        domain: "example-printpack.in",
        title: "PrintPack Industries",
        retrievedVia: "search" as const,
        fetchedVia: "fetch" as const,
        status: "ok" as const,
        fetchedAt: now,
      },
      {
        id: "s-2",
        url: "https://example-ecopack.in",
        domain: "example-ecopack.in",
        title: "EcoPack Solutions",
        retrievedVia: "search" as const,
        fetchedVia: "fetch" as const,
        status: "ok" as const,
        fetchedAt: now,
      },
      {
        id: "s-3",
        url: "https://example-blrbox.co.in",
        domain: "example-blrbox.co.in",
        title: "Bangalore Box Co.",
        retrievedVia: "search" as const,
        fetchedVia: "agent" as const,
        status: "ok" as const,
        agentLiveUrl: "https://agent.tinyfish.ai/runs/demo-stream/live",
        fetchedAt: now,
      },
    ];

    for (const s of sources) {
      onEvent("source", s);
    }

    // Simulate Agent Live event
    onEvent("agent_live", {
      sourceId: "s-3",
      url: "https://example-blrbox.co.in",
      agentLiveUrl: "https://agent.tinyfish.ai/runs/demo-stream/live",
    });

    // Stage 4: Extracting
    onEvent("progress", {
      stage: "extracting",
      progress: 70,
      message: "Extracting structured facts and verbatim quote citations...",
    });
    await new Promise((r) => setTimeout(r, 400));

    const facts = [
      {
        id: "f-1",
        sourceId: "s-1",
        field: "moq",
        value: "250 units",
        status: "found" as const,
        quote: "Minimum order quantity starts at just 250 units for custom printed mailer boxes",
        confidence: "high" as const,
      },
      {
        id: "f-2",
        sourceId: "s-1",
        field: "pricing",
        value: "₹18–₹42 per unit",
        status: "found" as const,
        quote: "Indicative rates for 3-ply corrugated box start at Rs 18 to Rs 42 per unit based on volume",
        confidence: "high" as const,
      },
      {
        id: "f-3",
        sourceId: "s-2",
        field: "moq",
        value: "500 units per SKU",
        status: "found" as const,
        quote: "All custom kraft mailers require a minimum initial batch of 500 units per SKU",
        confidence: "high" as const,
      },
      {
        id: "f-4",
        sourceId: "s-2",
        field: "pricing",
        value: null, // Honest unknown
        status: "not_found" as const,
        confidence: "low" as const,
      },
      {
        id: "f-5",
        sourceId: "s-3",
        field: "moq",
        value: "1,000 units",
        status: "found" as const,
        quote: "Bulk production runs with MOQ of 1,000 cartons",
        confidence: "high" as const,
      },
    ];

    // Stage 5: Synthesizing
    onEvent("progress", {
      stage: "synthesizing",
      progress: 85,
      message: "Benchmarking options and generating evidence scores...",
    });
    await new Promise((r) => setTimeout(r, 400));

    const comparison = [
      {
        id: "c-01",
        name: "PrintPack Industries",
        website: "https://example-printpack.in",
        sourceIds: ["s-1"],
        facts: {
          product_range: "Custom corrugated boxes, rigid boxes, self-sealing mailers",
          pricing: "₹18–₹42 per unit",
          moq: "250 units",
          delivery: "Karnataka 48 hours; Pan-India 5–7 business days",
          credibility: "ISO 9001:2015 certified; 12+ years in Peenya cluster",
          contact: "sales@printpack.co.in | +91 80 4123 4567",
        },
        evidenceScore: 92,
      },
      {
        id: "c-02",
        name: "EcoPack Solutions",
        website: "https://example-ecopack.in",
        sourceIds: ["s-2"],
        facts: {
          product_range: "Biodegradable mailer bags, honeycomb paper, recycled kraft",
          pricing: "Not found",
          moq: "500 units per SKU",
          delivery: "Pan-India 5–6 business days",
          credibility: "FSC certified 100% recycled paper; 8 years operating",
          contact: "contact@ecopack-india.com | +91 98450 12345",
        },
        evidenceScore: 78,
      },
      {
        id: "c-03",
        name: "Bangalore Box Co.",
        website: "https://example-blrbox.co.in",
        sourceIds: ["s-3"],
        facts: {
          product_range: "Heavy-duty shipping cartons, mono cartons",
          pricing: "₹12–₹28 per box",
          moq: "1,000 units",
          delivery: "Local delivery in 24 hours",
          credibility: "30+ years in industrial manufacturing",
          contact: "support@blrboxco.in | +91 80 2839 0000",
        },
        evidenceScore: 84,
      },
    ];

    const recommendations = [
      {
        rank: 1,
        itemId: "c-01",
        rationale: "Best overall fit for an early D2C brand: lowest MOQ (250 units), transparent published pricing (₹18-₹42), fast local dispatch (48h), and ISO 9001 certification.",
        risks: ["Unit economics higher for smaller 250-unit pilot; ask for tiered breaks at 500+."],
        confidence: "high" as const,
        supportedBy: ["f-1", "f-2"],
      },
      {
        rank: 2,
        itemId: "c-02",
        rationale: "Top choice for brands emphasizing eco-friendly sustainability (FSC certified recycled paper).",
        risks: ["Pricing is not published online and requires quotation; MOQ is higher at 500 units."],
        confidence: "medium" as const,
        supportedBy: ["f-3"],
      },
      {
        rank: 3,
        itemId: "c-03",
        rationale: "Lowest unit cost for high-volume shipping cartons, but high MOQ (1,000 units) requires more working capital.",
        risks: ["1,000 unit minimum order quantity is steep for initial pilot batch."],
        confidence: "high" as const,
        supportedBy: ["f-5"],
      },
    ];

    const missingInfo = [
      {
        itemId: "c-02",
        field: "pricing",
        whyItMatters: "EcoPack Solutions does not publish unit pricing online; quotation required before finalizing budget.",
      },
    ];

    // Stage 6: Drafting
    onEvent("progress", {
      stage: "drafting",
      progress: 95,
      message: "Drafting supplier outreach email and follow-up task...",
    });
    await new Promise((r) => setTimeout(r, 300));

    const actionDrafts = [
      {
        id: "a-01",
        type: "email" as const,
        title: "Request for Quotation: Custom Boxes (PrintPack Industries)",
        payload: {
          kind: "email" as const,
          to: "sales@printpack.co.in",
          subject: "Enquiry: Custom Corrugated Packaging for D2C Brand (Batch of 250-500 units)",
          body: "Hello PrintPack Team,\n\nWe are an emerging D2C brand based in Bengaluru and came across your custom packaging offerings. We are looking to order custom corrugated mailer boxes (E-flute) with 2-color branding.\n\nCould you please share:\n1. Your sample kit or digital catalogue\n2. Tiered unit quotation for 250, 500, and 1,000 units\n3. Typical lead time from artwork confirmation to dispatch\n\nLooking forward to partnering with you.\n\nBest regards,\nOperations Lead",
        },
        riskLevel: "medium" as const,
        status: "awaiting_approval" as const,
        requiresApproval: true as const,
        itemId: "c-01",
      },
      {
        id: "a-02",
        type: "task" as const,
        title: "Follow up with PrintPack Industries if no response by Thursday",
        payload: {
          kind: "task" as const,
          dueHint: "in 3 business days",
          description: "Check inbox for PrintPack quotation. If not received, call sales desk at +91 80 4123 4567.",
        },
        riskLevel: "low" as const,
        status: "awaiting_approval" as const,
        requiresApproval: true as const,
        itemId: "c-01",
      },
    ];

    // Warning simulation
    onEvent("warning", {
      code: "SOURCE_FAILED",
      message: "1 candidate aggregator (yellowpages.in) was automatically filtered.",
    });

    const response: ResearchResponse = {
      taskId,
      createdAt: now,
      request,
      plan,
      searchResults,
      sources,
      facts,
      comparison,
      recommendations,
      missingInfo,
      conflicts: [],
      actionDrafts,
      stats: {
        durationMs: 2500,
        searches: 2,
        urlsFetched: 3,
        agentRuns: 1,
        llmCalls: 4,
        sourcesOk: 3,
        sourcesFailed: 0,
      },
      mock: true,
    };

    const envelope: ApiResponse<ResearchResponse> = {
      success: true,
      status: "partial",
      data: response,
      sources: sources.map((s) => ({ id: s.id, url: s.url, title: s.title })),
      warnings: [{ code: "SOURCE_FILTERED", message: "Aggregator directories filtered." }],
      error: null,
    };

    onEvent("progress", {
      stage: "done",
      progress: 100,
      message: "Research completed successfully.",
    });

    onEvent("result", envelope);
    return response;
  }
}
