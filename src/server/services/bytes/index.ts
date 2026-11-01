import type { FounderByte, FeedCategory, SearchResult } from "@/lib/contracts";
import { searchWeb } from "../tinyfish/search";
import { getSourceForUrl } from "./registry";

export const CURATED_FOUNDER_BYTES: FounderByte[] = [
  {
    id: "byte-1",
    title: "Y Combinator W25 Batch Spotlight: AI Agents Shift from Chat to Action Workflows",
    source: "Y Combinator",
    author: "Garry Tan",
    publishedAt: "2025-02-28",
    retrievedAt: new Date().toISOString(),
    url: "https://www.ycombinator.com/blog",
    summary:
      "YC's latest batch showcases a decisive pivot from generative chat wrappers to autonomous background agents that execute end-to-end procurement, code migration, and compliance audits without human babysitting.",
    whyItMatters:
      "Founders who build verification-first, high-reliability agent loops with tight tool-use budgets are commanding higher enterprise ACVs compared to generic conversational assistants.",
    categories: ["Startups", "AI & Technology", "Founder Insights"],
    relatedEntities: ["Y Combinator", "OpenAI", "Anthropic", "B2B SaaS"],
  },
  {
    id: "byte-2",
    title: "Anthropic Releases Claude 3.7 Sonnet with Dynamic Reasoning Budgets",
    source: "Founder Blog",
    author: "Dario Amodei",
    publishedAt: "2025-02-24",
    retrievedAt: new Date().toISOString(),
    url: "https://www.anthropic.com/news/claude-3-7-sonnet",
    summary:
      "Anthropic introduced Claude 3.7 Sonnet, the first frontier model offering hybrid reasoning where API callers can dynamically dial reasoning tokens from zero up to 64k tokens per task.",
    whyItMatters:
      "Developers no longer need complex routing topologies between 'fast' models and 'thinking' models; single API calls can adaptively spend compute on difficult claims while answering easy ones instantly.",
    categories: ["AI & Technology", "Product Launches"],
    relatedEntities: ["Anthropic", "Claude", "OpenAI o3-mini", "DeepSeek R1"],
  },
  {
    id: "byte-3",
    title: "Reuters: Global Venture Funding Rebounds 22% Driven by Specialized AI Hardware and Energy",
    source: "Reuters",
    author: "Krystal Hu",
    publishedAt: "2025-02-27",
    retrievedAt: new Date().toISOString(),
    url: "https://www.reuters.com/technology/global-venture-funding-rebounds-2025",
    summary:
      "Global venture investment rebounded sharply in early 2025, with institutional capital concentrating on sovereign compute clusters, nuclear power for data centres, and vertically integrated industrial robotics.",
    whyItMatters:
      "Early-stage software valuations remain disciplined, but deep tech and infrastructure rounds are closing at historical speed with competitive multi-term sheet dynamics.",
    categories: ["Funding & VC", "Markets & Business"],
    relatedEntities: ["Sequoia Capital", "Andreessen Horowitz", "Nvidia", "SMR Nuclear"],
  },
  {
    id: "byte-4",
    title: "Naval Ravikant on Autonomous Agent Economics: 'Permissionless Leverage at Marginal Zero Cost'",
    source: "X (Twitter)",
    author: "@naval",
    publishedAt: "2025-02-26",
    retrievedAt: new Date().toISOString(),
    url: "https://x.com/naval/status/1894728190",
    summary:
      "Code and media gave creators infinite distribution; autonomous agents give every founder infinite delegation. The new constraint is not headcount or runway, but taste, truth-seeking, and decision clarity.",
    whyItMatters:
      "Solopreneurs and small 3-person squads can now command the market output of legacy 50-person consulting and research bureaus by orchestrating specialized agent swarms.",
    categories: ["Founder Insights", "Startups"],
    relatedEntities: ["Naval Ravikant", "Solo Founders", "Agentic Systems"],
  },
  {
    id: "byte-5",
    title: "European Commission Approves Standardized Food-Contact Packaging Directives (EC 1935/2004 Recertification)",
    source: "Reuters",
    author: "Philip Blenkinsop",
    publishedAt: "2025-02-25",
    retrievedAt: new Date().toISOString(),
    url: "https://eur-lex.europa.eu/food-contact-materials",
    summary:
      "New European environmental standards enforce strict BPA-NI (Non-Intent) coatings and mandatory digital product passports on all beverage canning and recycled paper mailers by Q3 2025.",
    whyItMatters:
      "D2C brands exporting or manufacturing in the EU must immediately verify batch-level conformity declarations from suppliers to avoid border customs retention.",
    categories: ["Markets & Business", "Startups"],
    relatedEntities: ["European Commission", "Envases", "Ardagh Group", "Ball Corporation"],
  },
  {
    id: "byte-6",
    title: "Ben Thompson: The Aggregation Theory of Agentic Discovery",
    source: "Stratechery",
    author: "Ben Thompson",
    publishedAt: "2025-02-27",
    retrievedAt: new Date().toISOString(),
    url: "https://stratechery.com/2025/aggregation-theory-agents",
    summary:
      "Search engines aggregated consumers to sell ad impressions; AI agents aggregate intent to directly transact and extract structured truth. The winners will own the verified verification layer, not the raw crawler.",
    whyItMatters:
      "SEO-driven affiliate farms and ad-heavy directories are losing traffic to headless web fetchers and multi-source research synthesizers.",
    categories: ["Founder Insights", "Markets & Business", "AI & Technology"],
    relatedEntities: ["Stratechery", "Google", "TinyFish", "Perplexity"],
  },
  {
    id: "byte-7",
    title: "Stripe Launches Open-Source Financial Agent Protocol for Cross-Border B2B Invoicing",
    source: "Product Launches",
    author: "Patrick Collison",
    publishedAt: "2025-02-26",
    retrievedAt: new Date().toISOString(),
    url: "https://stripe.com/newsroom/news/agent-invoicing-protocol",
    summary:
      "Stripe unveiled an agentic protocol allowing software agents to negotiate commercial terms, draft purchase orders, and verify invoice receipts with programmable human-in-the-loop sign-offs.",
    whyItMatters:
      "Reduces invoice reconciliation cycles from 14 days to under 30 seconds for international procurement while keeping human CFOs in control of approvals.",
    categories: ["Product Launches", "Startups", "Funding & VC"],
    relatedEntities: ["Stripe", "Patrick Collison", "B2B Payments"],
  },
  {
    id: "byte-8",
    title: "Indian D2C Logistics Surge: Bengaluru Industrial Hubs Cut Short-Run Mailer MOQs to 250 Units",
    source: "TechCrunch",
    author: "Manish Singh",
    publishedAt: "2025-02-24",
    retrievedAt: new Date().toISOString(),
    url: "https://techcrunch.com/2025/02/india-d2c-manufacturing-clusters",
    summary:
      "Digital die-cutting and on-demand flexographic printing in Karnataka's industrial clusters have enabled manufacturers to drop minimum order quantities from 5,000 to 250 boxes with 48-hour turnarounds.",
    whyItMatters:
      "Early-stage consumer startups can now order custom branded packaging on a weekly cadence without burning working capital on warehouse inventory.",
    categories: ["Startups", "Markets & Business"],
    relatedEntities: ["D2C India", "PrintPack", "Peenya Industrial Cluster"],
  },
];

const dynamicFounderBytes: FounderByte[] = [];

export function addFounderByte(byte: FounderByte): void {
  const existingIdx = dynamicFounderBytes.findIndex(
    (b) => b.id === byte.id || b.url.toLowerCase() === byte.url.toLowerCase()
  );
  if (existingIdx >= 0) {
    dynamicFounderBytes[existingIdx] = byte;
  } else {
    dynamicFounderBytes.unshift(byte);
  }
}

export interface FetchFounderBytesOptions {
  category?: FeedCategory | string;
  query?: string;
  live?: boolean;
}

export async function getFounderBytes(
  options: FetchFounderBytesOptions = {}
): Promise<FounderByte[]> {
  const { category, query, live } = options;

  let bytes = [...dynamicFounderBytes, ...CURATED_FOUNDER_BYTES];

  // If live fetching is requested and TinyFish is available, fetch live HN / tech updates
  if (live && process.env.TINYFISH_API_KEY) {
    try {
      const searchResults = await searchWeb(
        "Hacker News top stories AI tech startups Y Combinator",
        { maxResults: 5 }
      );

      const liveBytes: FounderByte[] = searchResults.map((res: SearchResult, index: number) => {
        const publishedAt = new Date().toISOString().split("T")[0];
        const retrievedAt = new Date().toISOString();
        const matchedSource = getSourceForUrl(res.url);

        return {
          id: `live-${Date.now()}-${index}`,
          title: res.title,
          source: matchedSource ? matchedSource.name : res.domain.includes("ycombinator") ? "Y Combinator" : "TechCrunch",
          publishedAt,
          retrievedAt,
          url: res.url,
          summary: res.snippet || "Live intelligence retrieved via TinyFish Search.",
          whyItMatters:
            "Fresh public community signal detected on live web indices. Monitor for ecosystem shifts and competitive moves.",
          categories: ["Startups", "AI & Technology"],
          relatedEntities: [res.domain],
        };
      });

      // Deduplicate by URL or title
      const existingUrls = new Set(bytes.map((b) => b.url.toLowerCase()));
      const newUnique = liveBytes.filter((b) => !existingUrls.has(b.url.toLowerCase()));
      bytes = [...newUnique, ...bytes];
    } catch {
      // Graceful fallback to curated pool if live fetch fails or times out
    }
  }

  // Filter by category
  if (category && category !== "All") {
    bytes = bytes.filter((b) =>
      b.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  // Filter by search query
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    bytes = bytes.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.whyItMatters.toLowerCase().includes(q) ||
        b.relatedEntities.some((e) => e.toLowerCase().includes(q)) ||
        b.source.toLowerCase().includes(q)
    );
  }

  return bytes;
}
