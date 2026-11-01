import type {
  ResearchRequest,
  ResearchResponse,
  SseEventName,
  ApiResponse,
  ComparisonItem,
  ExtractedFact,
  Recommendation,
  MissingInfo,
  ActionDraft,
  SourceDocument,
} from "@/lib/contracts";

export class MockResearchEngine {
  async execute(
    request: ResearchRequest,
    onEvent: (event: SseEventName, data: unknown) => void
  ): Promise<ResearchResponse> {
    const taskId = `QRY-${Math.floor(9000 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const isCanQuery =
      /cold\s+brew|can|aluminum|beverage|eu|ardagh|envases|ball/i.test(request.prompt);

    // Stage 1: Planning
    onEvent("progress", {
      stage: "planning",
      progress: 10,
      message: "Parsing natural language constraints and formulating research plan...",
    });
    await new Promise((r) => setTimeout(r, 200));

    const plan = isCanQuery
      ? {
          objective: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
          entityType: "supplier" as const,
          queries: [
            {
              id: "q1",
              query: "cold brew aluminum can manufacturers EU 250ml slim BPA-NI",
              purpose: "Discover primary European can manufacturers and production plants",
            },
            {
              id: "q2",
              query: "beverage can packaging suppliers Europe MOQ 20000 50000 pricing",
              purpose: "Identify commercial terms, pilot batch thresholds, and lead times",
            },
            {
              id: "q3",
              query: "EUR-Lex Food Contact Aluminium Regulation EC 1935 2004",
              purpose: "Cross-index regulatory compliance and packaging registry data",
            },
          ],
          extractionFields: [
            { key: "product_range", label: "Product Range", kind: "string" as const },
            { key: "moq", label: "MOQ", kind: "string" as const },
            { key: "pricing", label: "Pricing", kind: "string" as const },
            { key: "delivery", label: "Delivery", kind: "string" as const },
            { key: "credibility", label: "Certifications", kind: "string" as const },
            { key: "contact", label: "Contact Details", kind: "string" as const },
          ],
          comparisonCriteria: ["product_range", "moq", "pricing", "delivery", "credibility", "contact"],
          actionHints: [
            { type: "email" as const, instruction: "Prepare supplier enquiry draft for 250ml Slim BPA-NI batch" },
          ],
          budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
          category: "Aluminum Beverage Cans",
          geography: "EU / EMEA",
          hardConstraints: ["250ml Slim Format", "MOQ < 50,000 units", "BPA-NI Compliance"],
        }
      : {
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
            { key: "moq", label: "Minimum Order Quantity", kind: "string" as const },
            { key: "pricing", label: "Indicative Pricing", kind: "string" as const },
            { key: "delivery", label: "Delivery Terms & Lead Time", kind: "string" as const },
            { key: "credibility", label: "Credibility & Certifications", kind: "string" as const },
            { key: "contact", label: "Contact Details", kind: "string" as const },
          ],
          comparisonCriteria: ["product_range", "moq", "pricing", "delivery", "credibility", "contact"],
          actionHints: [
            { type: "email" as const, instruction: "Draft enquiry email requesting custom catalogue" },
            { type: "task" as const, instruction: "Schedule follow-up call" },
          ],
          budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
          category: "Corrugated Packaging",
          geography: "Bengaluru, India",
          hardConstraints: ["Local manufacturing in Bengaluru", "Low MOQ for D2C"],
        };

    onEvent("plan", plan);

    // Stage 2: Searching
    onEvent("progress", {
      stage: "searching",
      progress: 30,
      message: `Scanning live web via TinyFish Search (${plan.queries.length} queries)...`,
    });
    await new Promise((r) => setTimeout(r, 200));

    // Stage 3: Fetching Sources
    onEvent("progress", {
      stage: "fetching",
      progress: 50,
      message: "Fetching clean page Markdown via TinyFish Fetch...",
    });
    await new Promise((r) => setTimeout(r, 200));

    const sources: SourceDocument[] = isCanQuery
      ? [
          {
            id: "s-1",
            url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R1935",
            domain: "eur-lex.europa.eu",
            title: "EUR-Lex Food Contact Aluminium Regulation (EC 1935/2004)",
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "ok",
            isArticle: true,
            fetchedAt: now,
          },
          {
            id: "s-2",
            url: "https://www.envases.de/beverage-packaging-catalog",
            domain: "envases.de",
            title: "Envases European Beverage Packaging Catalog Q3 2024",
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "ok",
            fetchedAt: now,
          },
          {
            id: "s-3",
            url: "https://www.ardaghgroup.com/beverage-cans/spec-sheet-v4",
            domain: "ardaghgroup.com",
            title: "Ardagh Beverage Can Spec Sheet v4.1 (Standard & Organic)",
            retrievedVia: "search",
            fetchedVia: "agent",
            status: "ok",
            agentLiveUrl: "https://agent.tinyfish.ai/runs/ardagh-live/stream",
            fetchedAt: now,
          },
          {
            id: "s-4",
            url: "https://www.verpackungsregister.org/en/lucid-packaging-register",
            domain: "verpackungsregister.org",
            title: "German Federal Packaging Registry (LUCID ID: DE4910283)",
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "ok",
            isArticle: true,
            fetchedAt: now,
          },
        ]
      : [
          {
            id: "s-1",
            url: "https://example-printpack.in",
            domain: "example-printpack.in",
            title: "PrintPack Industries — Custom Corrugated Packaging Bengaluru",
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "ok",
            fetchedAt: now,
          },
          {
            id: "s-2",
            url: "https://example-ecopack.in",
            domain: "example-ecopack.in",
            title: "EcoPack Solutions India — Sustainable D2C Mailer Boxes",
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "ok",
            fetchedAt: now,
          },
          {
            id: "s-3",
            url: "https://example-blrbox.co.in",
            domain: "example-blrbox.co.in",
            title: "Bangalore Box Company — Industrial Shipping Cartons",
            retrievedVia: "search",
            fetchedVia: "agent",
            status: "ok",
            agentLiveUrl: "https://agent.tinyfish.ai/runs/demo-stream/live",
            fetchedAt: now,
          },
        ];

    for (const s of sources) {
      onEvent("source", s);
    }

    const agentSource = sources.find((s) => s.agentLiveUrl);
    if (agentSource && agentSource.agentLiveUrl) {
      onEvent("agent_live", {
        sourceId: agentSource.id,
        url: agentSource.url,
        agentLiveUrl: agentSource.agentLiveUrl,
      });
    }

    // Stage 4: Extracting Facts
    onEvent("progress", {
      stage: "extracting",
      progress: 70,
      message: "Extracting structured facts, quotes, and validating constraints...",
    });
    await new Promise((r) => setTimeout(r, 200));

    const facts: ExtractedFact[] = isCanQuery
      ? [
          {
            id: "f-1",
            sourceId: "s-2",
            field: "moq",
            value: "25,000 units",
            status: "found",
            quote: "Minimum order threshold for 250ml slim formats with certified BPA-NI epoxy starts at 25,000 units",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://www.envases.de/beverage-packaging-catalog",
            sourceTitle: "Envases Packaging Catalog",
            retrievedAt: now,
          },
          {
            id: "f-2",
            sourceId: "s-2",
            field: "pricing",
            value: "€0.118 / unit",
            status: "found",
            quote: "Indicative base pricing €0.118 / unit for unprinted cans, palletized ex-works Deventer",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://www.envases.de/beverage-packaging-catalog",
            sourceTitle: "Envases Packaging Catalog",
            retrievedAt: now,
          },
          {
            id: "f-3",
            sourceId: "s-3",
            field: "moq",
            value: "20,000 units",
            status: "found",
            quote: "Bonn facility agile pilot line accommodates batch runs from 20,000 units",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://www.ardaghgroup.com/beverage-cans/spec-sheet-v4",
            sourceTitle: "Ardagh Spec Sheet",
            retrievedAt: now,
          },
          {
            id: "f-4",
            sourceId: "s-3",
            field: "pricing",
            value: "€0.124 / unit",
            status: "found",
            quote: "Standard run rate €0.124 per unit for small pilot volumes",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://www.ardaghgroup.com/beverage-cans/spec-sheet-v4",
            sourceTitle: "Ardagh Spec Sheet",
            retrievedAt: now,
          },
          {
            id: "f-5",
            sourceId: "s-3",
            field: "moq",
            value: "100,000 units",
            status: "found",
            quote: "Ball high-speed production line minimum contract threshold 100,000 units",
            confidence: "high",
            evidenceStatus: "does_not_meet",
            sourceUrl: "https://www.ball.com/beverage-packaging",
            sourceTitle: "Ball Packaging Technical Docs",
            retrievedAt: now,
            constraintViolated: true,
          },
          {
            id: "f-6",
            sourceId: "s-1",
            field: "pricing",
            value: null,
            status: "not_found",
            confidence: "low",
            evidenceStatus: "not_found",
            sourceUrl: "https://eur-lex.europa.eu",
          },
        ]
      : [
          {
            id: "f-1",
            sourceId: "s-1",
            field: "moq",
            value: "250 units",
            status: "found",
            quote: "Minimum order quantity starts at just 250 units for custom printed mailer boxes",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://example-printpack.in",
            sourceTitle: "PrintPack Industries",
            retrievedAt: now,
          },
          {
            id: "f-2",
            sourceId: "s-1",
            field: "pricing",
            value: "₹18–₹42 per unit",
            status: "found",
            quote: "Indicative rates for 3-ply corrugated box start at Rs 18 to Rs 42 per unit based on volume",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://example-printpack.in",
            sourceTitle: "PrintPack Industries",
            retrievedAt: now,
          },
          {
            id: "f-3",
            sourceId: "s-2",
            field: "moq",
            value: "500 units per SKU",
            status: "found",
            quote: "All custom kraft mailers require a minimum initial batch of 500 units per SKU",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://example-ecopack.in",
            sourceTitle: "EcoPack Solutions",
            retrievedAt: now,
          },
          {
            id: "f-4",
            sourceId: "s-2",
            field: "pricing",
            value: null, // Honest unknown
            status: "not_found",
            confidence: "low",
            evidenceStatus: "not_found",
            sourceUrl: "https://example-ecopack.in",
            sourceTitle: "EcoPack Solutions",
            retrievedAt: now,
          },
          {
            id: "f-5",
            sourceId: "s-3",
            field: "moq",
            value: "1,000 units",
            status: "found",
            quote: "Bulk production runs with MOQ of 1,000 cartons",
            confidence: "high",
            evidenceStatus: "verified",
            sourceUrl: "https://example-blrbox.co.in",
            sourceTitle: "Bangalore Box Co.",
            retrievedAt: now,
          },
        ];

    // Stage 5: Synthesizing
    onEvent("progress", {
      stage: "synthesizing",
      progress: 85,
      message: "Benchmarking options and enforcing hard constraints...",
    });
    await new Promise((r) => setTimeout(r, 200));

    const comparison: ComparisonItem[] = isCanQuery
      ? [
          {
            id: "c-01",
            name: "Envases Group (NL)",
            location: "Deventer plant",
            website: "https://www.envases.de",
            sourceIds: ["s-2"],
            facts: {
              product_range: "250ml Slim, 330ml Sleek (BPA-NI)",
              moq: "25,000 units",
              pricing: "€0.118 / unit",
              delivery: "3–4 wks (Rotterdam)",
              status: "Verified",
            },
            evidenceScore: 94,
            constraintFit: "meets",
            statusBadge: "verified",
            isQualifiedSupplier: true,
            email: "supply-inquiry@envases.com",
            specSheetUrl: "https://www.envases.de/specs/spec-sheet.pdf",
            specSheetLabel: "spec-sheet.pdf",
            evidenceFields: {
              moq: {
                value: "25,000 units",
                status: "verified",
                supportingQuote: "Minimum order threshold for 250ml slim formats with certified BPA-NI epoxy starts at 25,000 units",
                sourceTitle: "Envases European Packaging Catalog",
                sourceUrl: "https://www.envases.de/catalog",
                retrievedAt: now,
              },
              pricing: {
                value: "€0.118 / unit",
                status: "verified",
                supportingQuote: "Indicative base pricing €0.118 / unit for unprinted cans, palletized ex-works Deventer",
                sourceTitle: "Envases European Packaging Catalog",
                sourceUrl: "https://www.envases.de/catalog",
                retrievedAt: now,
              },
              delivery: {
                value: "3–4 wks (Rotterdam)",
                status: "verified",
                supportingQuote: "Typical Rotterdam sea-freight dispatch lead time: 3 to 4 weeks",
                sourceTitle: "Envases European Packaging Catalog",
                sourceUrl: "https://www.envases.de/catalog",
                retrievedAt: now,
              },
            },
          },
          {
            id: "c-02",
            name: "Ardagh Metal Packaging (DE)",
            location: "Bonn production line",
            website: "https://www.ardaghgroup.com",
            sourceIds: ["s-3"],
            facts: {
              product_range: "250ml Slim (Standard & Organic liner)",
              moq: "20,000 units",
              pricing: "€0.124 / unit",
              delivery: "2–3 wks (Bonn)",
              status: "Verified",
            },
            evidenceScore: 92,
            constraintFit: "meets",
            statusBadge: "verified",
            isQualifiedSupplier: true,
            email: "eu-sales@ardaghgroup.com",
            specSheetUrl: "https://www.ardaghgroup.com/quote-ref-84",
            specSheetLabel: "quote-ref-84",
            evidenceFields: {
              moq: {
                value: "20,000 units",
                status: "verified",
                supportingQuote: "Bonn facility agile pilot line accommodates batch runs from 20,000 units",
                sourceTitle: "Ardagh Beverage Can Spec Sheet v4.1",
                sourceUrl: "https://www.ardaghgroup.com/beverage-cans",
                retrievedAt: now,
              },
              pricing: {
                value: "€0.124 / unit",
                status: "verified",
                supportingQuote: "Standard run rate €0.124 per unit for small pilot volumes",
                sourceTitle: "Ardagh Beverage Can Spec Sheet v4.1",
                sourceUrl: "https://www.ardaghgroup.com/beverage-cans",
                retrievedAt: now,
              },
              delivery: {
                value: "2–3 wks (Bonn)",
                status: "verified",
                supportingQuote: "Fast road-freight dispatch within 2-3 weeks from central Bonn plant",
                sourceTitle: "Ardagh Beverage Can Spec Sheet v4.1",
                sourceUrl: "https://www.ardaghgroup.com/beverage-cans",
                retrievedAt: now,
              },
            },
          },
          {
            id: "c-03",
            name: "Ball Beverage Packaging (FR)",
            location: "Mont facility",
            website: "https://www.ball.com",
            sourceIds: ["s-3"],
            facts: {
              product_range: "250ml, 355ml Sleek",
              moq: "100,000 units",
              pricing: "€0.098 / unit",
              delivery: "5–6 wks",
              status: "Verified",
            },
            evidenceScore: 88,
            constraintFit: "does_not_meet",
            statusBadge: "does_not_meet",
            isQualifiedSupplier: true,
            email: "contract-eu@ball.com",
            evidenceFields: {
              moq: {
                value: "100,000 units",
                status: "does_not_meet",
                supportingQuote: "High-speed line operational parameters require minimum batch commitments of 100,000 units",
                sourceTitle: "Ball Packaging Technical Specs",
                sourceUrl: "https://www.ball.com/beverage-packaging",
                retrievedAt: now,
                constraintFit: "does_not_meet",
              },
              pricing: {
                value: "€0.098 / unit",
                status: "verified",
                supportingQuote: "Volume pricing tier unlocks at €0.098 per unit at standard 100k contract tier",
                sourceTitle: "Ball Packaging Technical Specs",
                sourceUrl: "https://www.ball.com/beverage-packaging",
                retrievedAt: now,
              },
            },
          },
          {
            id: "c-04",
            name: "Canpack Nordic (PL)",
            location: "Kraków export",
            website: "https://www.canpack.com",
            sourceIds: [],
            facts: {
              product_range: "250ml Slim",
              moq: "30,000 units",
              pricing: "Not found",
              delivery: "4 wks",
              status: "Missing info",
            },
            evidenceScore: 65,
            constraintFit: "partial",
            statusBadge: "missing_info",
            isQualifiedSupplier: true,
            email: null,
            evidenceFields: {
              moq: {
                value: "30,000 units",
                status: "verified",
                supportingQuote: "Standard export batch 30,000 units",
                sourceTitle: "Canpack Global Overview",
                sourceUrl: "https://www.canpack.com",
                retrievedAt: now,
              },
              pricing: {
                value: null,
                status: "not_found",
              },
            },
          },
          {
            id: "c-05",
            name: "Trivium Packaging (ES)",
            location: "Sevilla plant",
            website: "https://www.triviumpackaging.com",
            sourceIds: [],
            facts: {
              product_range: "250ml Aluminium Bottle/Can hybrid",
              moq: "Not found",
              pricing: "€0.185 / unit",
              delivery: "Not found",
              status: "Unverified",
            },
            evidenceScore: 42,
            constraintFit: "unknown",
            statusBadge: "unverified",
            isQualifiedSupplier: true,
            email: null,
            evidenceFields: {
              moq: {
                value: null,
                status: "not_found",
              },
              pricing: {
                value: "€0.185 / unit",
                status: "unverified",
                supportingQuote: "Sample quotation rates reported in beverage packaging forum at approximately €0.185",
                sourceTitle: "Industry Forum Extract",
                sourceUrl: "https://www.triviumpackaging.com",
                retrievedAt: now,
              },
            },
          },
        ]
      : [
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
            factDetails: {
              moq: {
                value: "250 units",
                quote: "Minimum order quantity starts at just 250 units for custom printed mailer boxes",
                sourceUrl: "https://example-printpack.in",
                sourceTitle: "PrintPack Industries",
                status: "found",
              },
              pricing: {
                value: "₹18–₹42 per unit",
                quote: "Indicative rates for 3-ply corrugated box start at Rs 18 to Rs 42 per unit based on volume",
                sourceUrl: "https://example-printpack.in",
                sourceTitle: "PrintPack Industries",
                status: "found",
              },
            },
            evidenceScore: 92,
            statusBadge: "verified",
            constraintFit: "meets",
            isQualifiedSupplier: true,
            email: "sales@printpack.co.in",
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
            factDetails: {
              moq: {
                value: "500 units per SKU",
                quote: "All custom kraft mailers require a minimum initial batch of 500 units per SKU",
                sourceUrl: "https://example-ecopack.in",
                sourceTitle: "EcoPack Solutions",
                status: "found",
              },
              pricing: {
                value: null,
                status: "not_found",
              },
            },
            evidenceScore: 78,
            statusBadge: "verified",
            constraintFit: "meets",
            isQualifiedSupplier: true,
            email: "contact@ecopack-india.com",
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
            factDetails: {
              moq: {
                value: "1,000 units",
                quote: "Bulk production runs with MOQ of 1,000 cartons",
                sourceUrl: "https://example-blrbox.co.in",
                sourceTitle: "Bangalore Box Co.",
                status: "found",
              },
            },
            evidenceScore: 84,
            statusBadge: "verified",
            constraintFit: "meets",
            isQualifiedSupplier: true,
            email: "support@blrboxco.in",
          },
        ];

    const recommendations: Recommendation[] = isCanQuery
      ? [
          {
            rank: 1,
            itemId: "c-01",
            rationale:
              "Partner with Envases Group (NL) for immediate scale with certified BPA-NI liners, or Ardagh Metal Packaging (DE) if sub-30k pilot batch flexibility is prioritized. Ball Beverage holds the lowest unit cost but strictly enforces 100k MOQ.",
            risks: ["Ensure unprinted cans receive appropriate exterior basecoat before digital sleeving."],
            confidence: "high",
            supportedBy: ["f-1", "f-2"],
            compliesWithHardConstraints: true,
          },
          {
            rank: 2,
            itemId: "c-02",
            rationale:
              "Ardagh Metal Packaging (DE) offers superior pilot agility with a 20,000 MOQ threshold and certified organic inner lacquers from their Bonn plant.",
            risks: ["Slightly higher unit cost (€0.124 vs €0.118) on initial pilot runs."],
            confidence: "high",
            supportedBy: ["f-3", "f-4"],
            compliesWithHardConstraints: true,
          },
          {
            rank: 3,
            itemId: "c-03",
            rationale:
              "Ball Beverage Packaging (FR) delivers the lowest unit price (€0.098) but strictly enforces a 100k unit MOQ, which violates the < 50k pilot constraint.",
            risks: ["Violates hard MOQ constraint (< 50,000 units requested; 100,000 enforced)."],
            confidence: "low",
            supportedBy: ["f-5"],
            compliesWithHardConstraints: false,
          },
        ]
      : [
          {
            rank: 1,
            itemId: "c-01",
            rationale: "Best overall fit for an early D2C brand: lowest MOQ (250 units), transparent published pricing (₹18-₹42), fast local dispatch (48h), and ISO 9001 certification.",
            risks: ["Unit economics higher for smaller 250-unit pilot; ask for tiered breaks at 500+."],
            confidence: "high",
            supportedBy: ["f-1", "f-2"],
            compliesWithHardConstraints: true,
          },
          {
            rank: 2,
            itemId: "c-02",
            rationale: "Top choice for brands emphasizing eco-friendly sustainability (FSC certified recycled paper).",
            risks: ["Pricing is not published online and requires quotation; MOQ is higher at 500 units."],
            confidence: "medium",
            supportedBy: ["f-3"],
            compliesWithHardConstraints: true,
          },
          {
            rank: 3,
            itemId: "c-03",
            rationale: "Lowest unit cost for high-volume shipping cartons, but high MOQ (1,000 units) requires more working capital.",
            risks: ["1,000 unit minimum order quantity is steep for initial pilot batch."],
            confidence: "high",
            supportedBy: [],
            compliesWithHardConstraints: true,
          },
        ];

    const missingInfo: MissingInfo[] = isCanQuery
      ? [
          {
            itemId: "c-04",
            field: "pricing",
            whyItMatters: "Canpack Nordic does not publish unit pricing online; request quote for 30k batch.",
          },
          {
            itemId: "c-05",
            field: "moq",
            whyItMatters: "Trivium Packaging does not state bottle-can hybrid MOQ online; verify pilot batch limits.",
          },
        ]
      : [
          {
            itemId: "c-02",
            field: "pricing",
            whyItMatters: "EcoPack Solutions does not publish unit pricing online; quotation required before finalizing budget.",
          },
        ];

    // Stage 6: Action Drafting
    onEvent("progress", {
      stage: "drafting",
      progress: 95,
      message: "Drafting supplier outreach email and follow-up task...",
    });
    await new Promise((r) => setTimeout(r, 200));

    const actionDrafts: ActionDraft[] = isCanQuery
      ? [
          {
            id: "a-01",
            type: "email",
            title: "Supplier Enquiry: Envases Group (250ml Slim Can Supply)",
            payload: {
              kind: "email",
              to: "supply-inquiry@envases.com",
              subject: "Inquiry: 250ml Slim Can Supply & BPA-NI Certification",
              body: `Dear Commercial Sales Team,

We are conducting final qualification for 250ml slim aluminum cans suitable for RTD cold brew coffee distribution across the EU market.

Could you please confirm the following technical and commercial terms based on your current production schedule:

1. Pricing tier for initial trial run (25,000 units) vs scale volume (100,000 units).
2. Guarantee of BPA non-intent (BPA-NI) certified internal epoxy or polymer liner suitable for high-nitrogen cold coffee matrices.
3. Current lead time from Rotterdam / Deventer facilities for unprinted vs digitally sleeved batches.
4. Packaging technical spec sheet and food contact conformity declarations under EC 1935/2004.

We are ready to initiate testing samples upon confirmation.

Best regards,
Apex Global Procurement Team
supply@apexglobal.internal`,
              mailto: "mailto:supply-inquiry@envases.com?subject=Inquiry:%20250ml%20Slim%20Can%20Supply%20%26%20BPA-NI%20Certification",
              canSendDirectly: true,
              contactPageUrl: "https://www.envases.de",
              specsSummary: "Specs verified: 250ml Slim • Batch MOQ 25,000 • Ingot standard EN 602",
            },
            riskLevel: "medium",
            status: "awaiting_approval",
            requiresApproval: true,
            itemId: "c-01",
          },
          {
            id: "a-02",
            type: "task",
            title: "Review Ardagh Spec Sheet v4.1 for Organic liner compatibility",
            payload: {
              kind: "task",
              dueHint: "in 2 business days",
              description: "Cross-check acidic coffee matrix pH compatibility with Ardagh Bonn production line specs.",
            },
            riskLevel: "low",
            status: "awaiting_approval",
            requiresApproval: true,
            itemId: "c-02",
          },
        ]
      : [
          {
            id: "a-01",
            type: "email",
            title: "Request for Quotation: Custom Boxes (PrintPack Industries)",
            payload: {
              kind: "email",
              to: "sales@printpack.co.in",
              subject: "Enquiry: Custom Corrugated Packaging for D2C Brand (Batch of 250-500 units)",
              body: `Dear PrintPack Industries Sales Team,

We are an emerging D2C brand based in Bengaluru and came across your custom packaging offerings. We are looking to order custom corrugated mailer boxes (E-flute) with 2-color branding.

Could you please share:
1. Your sample kit or digital catalogue
2. Tiered unit quotation for 250, 500, and 1,000 units
3. Typical lead time from artwork confirmation to dispatch

Looking forward to partnering with you.

Best regards,
Operations Lead`,
              mailto: "mailto:sales@printpack.co.in?subject=Enquiry:%20Custom%20Corrugated%20Packaging",
              canSendDirectly: true,
              contactPageUrl: "https://example-printpack.in",
              specsSummary: "Verified: 250 MOQ • 48h dispatch • ISO 9001",
            },
            riskLevel: "medium",
            status: "awaiting_approval",
            requiresApproval: true,
            itemId: "c-01",
          },
        ];

    const response: ResearchResponse = {
      taskId,
      createdAt: now,
      request,
      plan,
      searchResults: [],
      sources,
      facts,
      comparison,
      recommendations,
      missingInfo,
      conflicts: [],
      actionDrafts,
      stats: {
        durationMs: 4200,
        searches: plan.queries.length,
        urlsFetched: sources.length,
        agentRuns: sources.some((s) => s.agentLiveUrl) ? 1 : 0,
        llmCalls: 0,
        sourcesOk: sources.filter((s) => s.status === "ok").length,
        sourcesFailed: sources.filter((s) => s.status === "failed").length,
      },
      mock: true,
      qualifiedCount: comparison.length,
      isSufficient: comparison.length >= 3,
    };

    const envelope: ApiResponse<ResearchResponse> = {
      success: true,
      status: "ok",
      data: response,
      sources: sources.map((s) => ({ id: s.id, url: s.url, title: s.title })),
      warnings: [],
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
