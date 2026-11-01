import type { FounderBriefItem, UserProfile } from "./workspaceState";

export const SAMPLE_INTELLIGENCE_POOL: FounderBriefItem[] = [
  {
    id: "fb-1",
    headline: "European Commission Approves Standardized BPA-NI Food Liner Directives",
    summary:
      "New regulatory frameworks mandate BPA non-intent internal coatings across all beverage aluminum formats by Q3 2025, accelerating packaging line upgrades in Germany and Netherlands.",
    source: "EU Packaging Law & Standards",
    sourceUrl: "https://eur-lex.europa.eu/food-contact-materials",
    publishedAt: "2h ago",
    category: "Regulations",
    relevanceExplanation: "Directly affects your cold brew beverage packaging supplier compliance and MOQ commitments.",
    matchedInterests: ["packaging", "manufacturing", "startups", "product launches"],
    deepBrief: {
      whatHappened: [
        "The European Food Safety Authority (EFSA) updated migration limits for Bisphenol A analogues in food-contact aluminum containers.",
        "Beverage canning plants across Germany, France, and Benelux are converting lacquering lines to organosol and polyester liners.",
        "Minimum batch thresholds for pilot runs (sub-50k units) are seeing a temporary 15% lead-time extension during line recertification.",
      ],
      whyItMatters:
        "For emerging RTD beverage and cold brew operators, legacy BPA-free claims are no longer legally sufficient; suppliers must provide verified BPA-NI test certificates to clear EU food safety inspections.",
      implications: [
        "Procurement contracts must stipulate batch-level conformity declarations under Regulation (EC) 1935/2004.",
        "Unit economics for 250ml slim formats will trend upward by €0.005–€0.010 per unit until conversion stabilizes.",
        "Suppliers with already certified lines (e.g. Envases, Ardagh) hold an operational advantage over slower plants.",
      ],
      keyTakeaways: [
        "Verify supplier BPA-NI spec sheets before placing purchase orders.",
        "Lock in Q3 pilot run slots early to avoid conversion bottlenecks.",
      ],
      citations: [
        { title: "EFSA Bisphenol A Assessment Directives", url: "https://efsa.europa.eu" },
        { title: "EU Aluminium Packaging Conformity Guidelines", url: "https://eur-lex.europa.eu" },
      ],
    },
  },
  {
    id: "fb-2",
    headline: "Anthropic Releases Claude 3.7 Sonnet with Hybrid Reasoning Mode",
    summary:
      "A frontier AI model capable of instantaneous responses alongside deep step-by-step chain-of-thought verification for complex systems engineering and research.",
    source: "Anthropic Research",
    sourceUrl: "https://www.anthropic.com/news",
    publishedAt: "4h ago",
    category: "AI Tools",
    relevanceExplanation: "Relevant to your AI research stack, tooling automation, and autonomous web agent workflows.",
    matchedInterests: ["ai", "software", "technology", "research"],
    deepBrief: {
      whatHappened: [
        "Anthropic announced Claude 3.7 Sonnet, introducing unified API control over dynamic thought budgets.",
        "Developers can toggle reasoning depth from 0 tokens for instantaneous responses up to 64k tokens for deep reasoning.",
        "Demonstrates significant performance leaps in full-stack coding benchmarks, code refactoring, and agentic search.",
      ],
      whyItMatters:
        "Allows engineering teams to replace brittle two-model cascades with a single model that adapts its reasoning budget dynamically depending on task complexity.",
      implications: [
        "Substantially lowers orchestration complexity for multi-step research pipelines.",
        "Enables faster code iteration without sacrificing architectural precision.",
      ],
      keyTakeaways: [
        "Evaluate dynamic reasoning budgets for deep fact extraction.",
        "Test on complex supplier constraint validation and contract extraction.",
      ],
      citations: [
        { title: "Anthropic Engineering Announcement", url: "https://www.anthropic.com" },
      ],
    },
  },
  {
    id: "fb-3",
    headline: "Indian D2C Brands Shift 40% of Primary Packaging to FSC Recycled Corrugate",
    summary:
      "Consumer electronics, specialty coffee, and cosmetics brands in Bengaluru and Mumbai are rapidly dropping virgin plastic pouches in favor of self-locking corrugated mailers.",
    source: "Inc42 D2C Quarterly",
    sourceUrl: "https://inc42.com/features",
    publishedAt: "1d ago",
    category: "Market Trends",
    relevanceExplanation: "Aligns with your D2C supplier research in Karnataka and sustainable packaging criteria.",
    matchedInterests: ["startups", "business", "packaging", "marketing"],
    deepBrief: {
      whatHappened: [
        "Over 120 leading D2C brands surveyed report transitioning to zero-tape, self-sealing kraft mailers.",
        "Local Peenya and Whitefield industrial clusters have ramped up die-cut production for smaller 250–500 unit batch runs.",
      ],
      whyItMatters:
        "Reduces packing fulfillment labor by 35 seconds per order while meeting growing consumer preference for plastic-free unboxing.",
      implications: [
        "Local Bengaluru suppliers with in-house flexo printing are offering faster 48-hour turnarounds for custom branded boxes.",
      ],
      keyTakeaways: [
        "Short-run pilot batches are now commercially viable without 2,000 unit MOQ barriers.",
      ],
      citations: [
        { title: "D2C Packaging Sustainability Survey", url: "https://inc42.com" },
      ],
    },
  },
  {
    id: "fb-4",
    headline: "Global Seed Stage Valuations Tighten: Founders Prioritize Cash-Flow Positive Pilot Batches",
    summary:
      "Venture capital data across Q1 indicates seed funds are rewarding early-stage consumer and hardware startups that test products with low MOQ supplier runs before scaling inventory.",
    source: "TechCrunch Venture Analysis",
    sourceUrl: "https://techcrunch.com/startups",
    publishedAt: "1d ago",
    category: "Funding",
    relevanceExplanation: "Directly relates to your lean procurement strategy and MOQ constraint filters.",
    matchedInterests: ["finance", "startups", "business"],
    deepBrief: {
      whatHappened: [
        "Median seed round runways increased from 18 to 24 months, with institutional investors penalizing high pre-launch inventory commitments.",
        "Founders using agile sourcing desks report 60% lower initial working capital burn.",
      ],
      whyItMatters:
        "Selecting suppliers with strict 100k+ MOQs can tie up critical runway prematurely compared to flexible 20k–25k pilot lines.",
      implications: [
        "Prioritizing batch agility over slight unit-cost discounts is becoming standard playbook for early-stage founders.",
      ],
      keyTakeaways: [
        "Enforce strict MOQ filters on your supplier comparison matrix.",
      ],
      citations: [
        { title: "VC Trends Report 2025", url: "https://techcrunch.com" },
      ],
    },
  },
  {
    id: "fb-5",
    headline: "Next.js 15 App Router Adopts Fluid Compute & React 19 Turbopack Default",
    summary:
      "Vercel shifts production defaults to dynamic server components with sub-50ms cold starts, improving edge streaming latency for AI workspaces.",
    source: "Next.js Releases",
    sourceUrl: "https://nextjs.org/blog",
    publishedAt: "2d ago",
    category: "Technology",
    relevanceExplanation: "Matches your developer background and current application stack architecture.",
    matchedInterests: ["software", "technology", "ai"],
    deepBrief: {
      whatHappened: [
        "Production builds now leverage Turbopack by default with faster tree-shaking and memory optimizations.",
        "Server-Sent Events (SSE) streaming connections receive built-in keep-alive buffering safeguards.",
      ],
      whyItMatters:
        "Ensures long-running research orchestrators and browser agents stream smoothly to client workspaces without proxy timeouts.",
      implications: [
        "Zero-config streaming performance for interactive AI research workbenches.",
      ],
      keyTakeaways: [
        "Take advantage of native streaming responses for real-time fact discovery.",
      ],
      citations: [
        { title: "Next.js 15 Release Notes", url: "https://nextjs.org" },
      ],
    },
  },
];

export function getPersonalizedBrief(profile: UserProfile | null): FounderBriefItem[] {
  if (!profile || !profile.interests || profile.interests.length === 0) {
    return SAMPLE_INTELLIGENCE_POOL;
  }

  const userInterests = profile.interests.map((i) => i.toLowerCase());
  const roleLower = (profile.role || "").toLowerCase();

  return SAMPLE_INTELLIGENCE_POOL.map((item) => {
    // Check match count
    const matches = item.matchedInterests.filter((mi) =>
      userInterests.some((ui) => ui.includes(mi) || mi.includes(ui))
    );
    let score = matches.length;
    if (userInterests.some((ui) => item.headline.toLowerCase().includes(ui))) score += 2;
    if (roleLower && item.relevanceExplanation.toLowerCase().includes(roleLower)) score += 1;

    let customRelevance = item.relevanceExplanation;
    if (profile.company && Math.random() > 0.5) {
      customRelevance = `Relevant to ${profile.company} and your tracked interest in ${item.category.toLowerCase()}.`;
    }

    return {
      ...item,
      relevanceExplanation: customRelevance,
    };
  }).sort((a, b) => b.matchedInterests.length - a.matchedInterests.length);
}

export function getRankedFeed(profile?: UserProfile | null): FounderBriefItem[] {
  return getPersonalizedBrief(profile || null);
}
