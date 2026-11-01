import { getTinyFishClient } from "./client";
import type { SearchResult } from "@/lib/contracts";

export const BLOCKED_DOMAINS = new Set([
  // B2B Aggregators & Generic Directories
  "indiamart.com",
  "tradeindia.com",
  "justdial.com",
  "sulekha.com",
  "yellowpages.in",
  "dial4trade.com",
  "exportersindia.com",
  "bharatbizs.com",
  "indiabizlist.com",
  "b2bmap.com",
  
  // Courier, Parcel & Logistics Aggregators (NOT packaging manufacturers)
  "porter.in",
  "delhivery.com",
  "bluedart.com",
  "dtdc.in",
  "dtdc.com",
  "dunzo.com",
  "shiprocket.in",
  "shadowfax.in",
  "xpressbees.com",
  "ecomexpress.in",
  "gati.com",
  "safexpress.com",
  "rivigo.com",
  "pickrr.com",
  "borzo.com",
  "blowhorn.com",

  // Social & Community Platforms
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "medium.com",
  "quora.com",
  "reddit.com",
  "wikipedia.org",
  "substack.com",
  "pinterest.com",
  "wordpress.com",
  "blogspot.com",
  "tumblr.com",

  // Media, News, and Generic Listicle Publishers
  "indiatoday.in",
  "timesofindia.indiatimes.com",
  "economictimes.indiatimes.com",
  "ndtv.com",
  "hindustantimes.com",
  "livemint.com",
  "thehindu.com",
  "yourstory.com",
  "inc42.com",
  "forbes.com",
  "entrepreneur.com",
  "business-standard.com",

  // E-commerce Consumer Marketplaces
  "amazon.in",
  "amazon.com",
  "flipkart.com",
]);

export const EDITORIAL_PATH_PATTERNS = [
  /\/blog(\/|$)/i,
  /\/blogs(\/|$)/i,
  /\/news(\/|$)/i,
  /\/article(\/|$)/i,
  /\/articles(\/|$)/i,
  /\/top-10/i,
  /\/top-5/i,
  /\/best-/i,
  /\/list-of-/i,
  /\/category\//i,
  /\/tag\//i,
];

export function isBlockedDomain(hostname: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  for (const blocked of BLOCKED_DOMAINS) {
    if (cleanHost === blocked || cleanHost.endsWith("." + blocked)) {
      return true;
    }
  }
  return false;
}

export function isEditorialUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return EDITORIAL_PATH_PATTERNS.some((pattern) => pattern.test(parsed.pathname));
  } catch {
    return false;
  }
}

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

      // Filter aggregator directories, couriers, and social media
      if (isBlockedDomain(hostname)) {
        continue;
      }

      // Filter editorial blog/article paths
      if (isEditorialUrl(item.url)) {
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

export async function searchWeb(
  query: string,
  options?: { maxResults?: number; location?: string }
): Promise<SearchResult[]> {
  const queryId = `q-${Math.random().toString(36).substring(2, 8)}`;
  const list = await executeSearch({
    query,
    queryId,
    location: options?.location,
  });
  return options?.maxResults ? list.slice(0, options.maxResults) : list;
}
