import type { SourceRegistryItem, FeedCategory } from "@/lib/contracts";

export const SOURCE_REGISTRY: SourceRegistryItem[] = [
  {
    id: "src-yc",
    name: "Y Combinator",
    domain: "ycombinator.com",
    sourceType: "yc",
    trustLevel: "high",
    categories: ["Startups", "Founder Insights", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-hn",
    name: "Hacker News",
    domain: "news.ycombinator.com",
    sourceType: "yc",
    trustLevel: "high",
    categories: ["Startups", "AI & Technology", "Founder Insights"],
    enabled: true,
  },
  {
    id: "src-reuters",
    name: "Reuters",
    domain: "reuters.com",
    sourceType: "reuters",
    trustLevel: "high",
    categories: ["Markets & Business", "Funding & VC", "AI & Technology"],
    enabled: true,
  },
  {
    id: "src-x",
    name: "X (Twitter)",
    domain: "x.com",
    sourceType: "x",
    trustLevel: "high",
    categories: ["Founder Insights", "Startups", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-twitter",
    name: "Twitter",
    domain: "twitter.com",
    sourceType: "x",
    trustLevel: "high",
    categories: ["Founder Insights", "Startups", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-tc",
    name: "TechCrunch",
    domain: "techcrunch.com",
    sourceType: "publication",
    trustLevel: "high",
    categories: ["Startups", "Funding & VC", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-stratechery",
    name: "Stratechery",
    domain: "stratechery.com",
    sourceType: "blog",
    trustLevel: "high",
    categories: ["Founder Insights", "Markets & Business", "AI & Technology"],
    enabled: true,
  },
  {
    id: "src-anthropic",
    name: "Anthropic News",
    domain: "anthropic.com",
    sourceType: "blog",
    trustLevel: "high",
    categories: ["AI & Technology", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-openai",
    name: "OpenAI News",
    domain: "openai.com",
    sourceType: "blog",
    trustLevel: "high",
    categories: ["AI & Technology", "Product Launches"],
    enabled: true,
  },
  {
    id: "src-inc42",
    name: "Inc42",
    domain: "inc42.com",
    sourceType: "publication",
    trustLevel: "high",
    categories: ["Startups", "Funding & VC", "Markets & Business"],
    enabled: true,
  },
  {
    id: "src-eurlex",
    name: "EUR-Lex Regulatory",
    domain: "eur-lex.europa.eu",
    sourceType: "publication",
    trustLevel: "high",
    categories: ["Markets & Business", "Startups"],
    enabled: true,
  },
];

export function getSourceForUrl(url: string): SourceRegistryItem | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    
    // Exact or suffix match
    const match = SOURCE_REGISTRY.find(
      (item) => item.enabled && (hostname === item.domain || hostname.endsWith(`.${item.domain}`))
    );
    return match || null;
  } catch {
    return null;
  }
}

export function isSourceAllowed(url: string): boolean {
  return getSourceForUrl(url) !== null;
}
