import { getTinyFishClient } from "./client";
import type { SearchResult } from "@/lib/contracts";

const BLOCKED_DOMAINS = new Set([
  "indiamart.com",
  "www.indiamart.com",
  "tradeindia.com",
  "www.tradeindia.com",
  "justdial.com",
  "www.justdial.com",
  "sulekha.com",
  "www.sulekha.com",
  "yellowpages.in",
  "www.yellowpages.in",
  "facebook.com",
  "www.facebook.com",
  "instagram.com",
  "www.instagram.com",
  "linkedin.com",
  "www.linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "www.youtube.com",
  "amazon.in",
  "www.amazon.in",
  "flipkart.com",
  "www.flipkart.com",
]);

export interface SearchOptions {
  query: string;
  queryId: string;
  location?: string;
  language?: string;
  purpose?: string;
}

export async function executeSearch(options: SearchOptions): Promise<SearchResult[]> {
  const client = getTinyFishClient();
  const res = await client.search.query({
    query: options.query,
    location: options.location ?? "IN",
    language: options.language ?? "en",
    domain_type: "web",
    purpose: options.purpose,
  });

  const results: SearchResult[] = [];
  const seenDomains = new Set<string>();

  for (const item of res.results) {
    try {
      const parsedUrl = new URL(item.url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Filter aggregator directories and social media
      if (BLOCKED_DOMAINS.has(hostname) || Array.from(BLOCKED_DOMAINS).some((b) => hostname.endsWith("." + b))) {
        continue;
      }

      // Deduplicate domains per query
      if (seenDomains.has(hostname)) {
        continue;
      }
      seenDomains.add(hostname);

      results.push({
        id: `sr-${Math.random().toString(36).substring(2, 9)}`,
        queryId: options.queryId,
        position: item.position,
        title: item.title,
        url: item.url,
        domain: hostname,
        snippet: item.snippet,
      });
    } catch {
      // Ignore malformed URLs
    }
  }

  return results;
}
