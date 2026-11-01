import type { ResearchResponse, ComparisonItem, SourceDocument, Recommendation, ActionDraft } from "@/lib/contracts";

export const SHOWCASE_RECENT_SESSIONS = [
  {
    id: "QRY-9042",
    prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
    title: "Cold brew can suppliers EU",
    timestamp: "2m ago",
  },
  {
    id: "QRY-8812",
    prompt: "Precision aluminum casing CNC machining manufacturers in Germany with ISO 9001",
    title: "Precision aluminum casing",
    timestamp: "1h ago",
  },
  {
    id: "QRY-8604",
    prompt: "Packaging sustainability audit for beverage retail in DACH region under EU Packaging and Packaging Waste Regulation (PPWR)",
    title: "Packaging sustainability audit",
    timestamp: "1d ago",
  },
];

export const SHOWCASE_SOURCES: SourceDocument[] = [
  {
    id: "s-1",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R1935",
    domain: "eur-lex.europa.eu",
    title: "EUR-Lex Food Contact Aluminium Regulation (EC 1935/2004)",
    retrievedVia: "search",
    fetchedVia: "fetch",
    status: "ok",
    isArticle: true,
  },
  {
    id: "s-2",
    url: "https://www.envases.de/beverage-packaging-catalog",
    domain: "PDF doc / Verified index",
    title: "Envases European Beverage Packaging Catalog Q3 2024",
    retrievedVia: "search",
    fetchedVia: "fetch",
    status: "ok",
  },
  {
    id: "s-3",
    url: "https://www.ardaghgroup.com/beverage-cans/spec-sheet-v4",
    domain: "Direct registry extract",
    title: "Ardagh Beverage Can Spec Sheet v4.1 (Standard & Organic)",
    retrievedVia: "search",
    fetchedVia: "fetch",
    status: "ok",
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
  },
];

export const SHOWCASE_COMPARISON: ComparisonItem[] = [
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
      },
      pricing: {
        value: "€0.118 / unit",
        status: "verified",
        supportingQuote: "Indicative base pricing €0.118 / unit for unprinted cans, palletized ex-works Deventer",
        sourceTitle: "Envases European Packaging Catalog",
        sourceUrl: "https://www.envases.de/catalog",
      },
      delivery: {
        value: "3–4 wks (Rotterdam)",
        status: "verified",
        supportingQuote: "Typical Rotterdam sea-freight dispatch lead time: 3 to 4 weeks",
        sourceTitle: "Envases European Packaging Catalog",
        sourceUrl: "https://www.envases.de/catalog",
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
        supportingQuote: "Bonn agile pilot line accommodates batch runs from 20,000 units",
        sourceTitle: "Ardagh Spec Sheet v4.1",
        sourceUrl: "https://www.ardaghgroup.com",
      },
      pricing: {
        value: "€0.124 / unit",
        status: "verified",
        supportingQuote: "Standard contract run rate €0.124 per unit for small pilot volumes",
        sourceTitle: "Ardagh Spec Sheet v4.1",
        sourceUrl: "https://www.ardaghgroup.com",
      },
      delivery: {
        value: "2–3 wks (Bonn)",
        status: "verified",
        supportingQuote: "Direct freight road transport ex-Bonn factory: 2 to 3 weeks",
        sourceTitle: "Ardagh Spec Sheet v4.1",
        sourceUrl: "https://www.ardaghgroup.com",
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
    statusBadge: "verified",
    isQualifiedSupplier: true,
    email: "contract-eu@ball.com",
    evidenceFields: {
      moq: {
        value: "100,000 units",
        status: "does_not_meet",
        supportingQuote: "High-speed line operational parameters require minimum batch commitments of 100,000 units",
        sourceTitle: "Ball Packaging Technical Specs",
        sourceUrl: "https://www.ball.com/beverage-packaging",
        constraintFit: "does_not_meet",
      },
      pricing: {
        value: "€0.098 / unit",
        status: "verified",
        supportingQuote: "Volume pricing tier unlocks at €0.098 per unit at standard 100k contract tier",
        sourceTitle: "Ball Packaging Technical Specs",
        sourceUrl: "https://www.ball.com/beverage-packaging",
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
    isQualifiedSupplier: false,
    email: null,
    evidenceFields: {
      moq: {
        value: "30,000 units",
        status: "verified",
        supportingQuote: "Export minimum run threshold 30,000 cans for continental road freight",
        sourceTitle: "Canpack Commercial Terms",
        sourceUrl: "https://www.canpack.com",
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
    isQualifiedSupplier: false,
    email: null,
    evidenceFields: {
      pricing: {
        value: "€0.185 / unit",
        status: "unverified",
        supportingQuote: "Sample quotation rates reported in beverage packaging forum at approximately €0.185",
        sourceTitle: "Industry Forum Extract",
        sourceUrl: "https://www.triviumpackaging.com",
      },
    },
  },
];

export const SHOWCASE_ACTION_DRAFT: ActionDraft = {
  id: "a-01",
  type: "email",
  title: "Supplier Enquiry: Envases Group (250ml Slim Can Supply)",
  payload: {
    kind: "email",
    to: "supply-inquiry@envases.com",
    subject: "Inquiry: 250ml Slim Can Supply & BPA-NI Certification",
    specsSummary: "Specs verified: 250ml Slim • Batch MOQ 25,000 • Ingot standard EN 602",
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
  },
  requiresApproval: true,
};

export const SHOWCASE_RESEARCH_RESPONSE: ResearchResponse = {
  taskId: "QRY-9042",
  request: {
    prompt: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
    mode: "deep",
    budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
  },
  plan: {
    objective: "Compare EU cold brew aluminum can suppliers (250ml slim, MOQ < 50k, recyclable liners)",
    entityType: "supplier",
    queries: [
      { id: "q1", query: "cold brew aluminum can manufacturers EU 250ml slim BPA-NI", purpose: "Discover European plants" },
      { id: "q2", query: "beverage can packaging suppliers Europe MOQ 20000 50000 pricing", purpose: "Identify commercial terms" },
      { id: "q3", query: "EUR-Lex Food Contact Aluminium Regulation EC 1935 2004", purpose: "Cross-index regulatory compliance" },
    ],
    extractionFields: [
      { key: "product_range", label: "Product Range", kind: "string" },
      { key: "moq", label: "MOQ", kind: "string" },
      { key: "pricing", label: "Pricing", kind: "string" },
      { key: "delivery", label: "Delivery", kind: "string" },
    ],
    comparisonCriteria: ["product_range", "moq", "pricing", "delivery"],
    actionHints: [{ type: "email", instruction: "Prepare supplier enquiry draft" }],
    budgets: { maxSearches: 4, maxFetchUrls: 10, maxAgentRuns: 1 },
    category: "Raw Material Sourcing",
    geography: "EU / EMEA",
    hardConstraints: ["250ml Slim Format", "MOQ < 50,000 units", "BPA-NI Compliance"],
  },
  sources: SHOWCASE_SOURCES,
  comparison: SHOWCASE_COMPARISON,
  recommendations: [
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
  ],
  missingInfo: [
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
  ],
  actionDrafts: [SHOWCASE_ACTION_DRAFT],
  stats: {
    durationMs: 4200,
    sourcesScanned: 14,
    completedAt: "Updated 2m ago",
  },
  mock: true,
};
