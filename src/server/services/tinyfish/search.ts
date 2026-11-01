import { getTinyFishClient } from "./client";
import type { SearchResult, ResearchIntent } from "@/lib/contracts";

// B2B Aggregators & Generic Lead Directories
export const B2B_DIRECTORY_DOMAINS = new Set([
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
  "alibaba.com",
]);

// Courier & Logistics Services (Not product/packaging manufacturers)
export const COURIER_LOGISTICS_DOMAINS = new Set([
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
]);

// Pure Social / Spam / Non-factual entertainment sites
export const LOW_SIGNAL_SOCIAL_DOMAINS = new Set([
  "pinterest.com",
  "tumblr.com",
  "tiktok.com",
  "quora.com",
  "facebook.com",
  "instagram.com",
]);

// High-Value Editorial & News Publications (Great for General, Startup, Tech & Market Research)
export const RESPECTED_EDITORIAL_DOMAINS = new Set([
  "reuters.com",
  "techcrunch.com",
  "ycombinator.com",
  "news.ycombinator.com",
  "bloomberg.com",
  "ft.com",
  "wsj.com",
  "economist.com",
  "theverge.com",
  "wired.com",
  "arstechnica.com",
  "venturebeat.com",
  "inc42.com",
  "yourstory.com",
  "livemint.com",
  "economictimes.indiatimes.com",
  "forbes.com",
  "fortune.com",
  "stratechery.com",
  "github.com",
  "arxiv.org",
  "wikipedia.org",
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

export function isB2BDirectory(hostname: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  for (const domain of B2B_DIRECTORY_DOMAINS) {
    if (cleanHost === domain || cleanHost.endsWith("." + domain)) {
      return true;
    }
  }
  return false;
}

export function isCourierOrLogistics(hostname: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  for (const domain of COURIER_LOGISTICS_DOMAINS) {
    if (cleanHost === domain || cleanHost.endsWith("." + domain)) {
      return true;
    }
  }
  return false;
}

export function isBlockedDomain(hostname: string): boolean {
  return isB2BDirectory(hostname) || isCourierOrLogistics(hostname);
}

export function isEditorialUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    return EDITORIAL_PATH_PATTERNS.some((pattern) => pattern.test(parsed.pathname));
  } catch {
    return false;
  }
}

export function isRespectedPublication(hostname: string): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "");
  for (const domain of RESPECTED_EDITORIAL_DOMAINS) {
    if (cleanHost === domain || cleanHost.endsWith("." + domain)) {
      return true;
    }
  }
  return false;
}

export interface SearchOptions {
  query: string;
  queryId: string;
  location?: string;
  language?: string;
  purpose?: string;
  intent?: ResearchIntent;
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
  const isSupplierIntent = options.intent === "supplier";

  for (const item of res.results) {
    try {
      const parsedUrl = new URL(item.url);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

      // 1. Always filter low-signal scrapers / spam
      if (LOW_SIGNAL_SOCIAL_DOMAINS.has(hostname)) {
        continue;
      }

      // 2. For supplier searches, couriers are irrelevant
      if (isSupplierIntent && isCourierOrLogistics(hostname)) {
        continue;
      }

      // 3. Mark characteristics
      const isDirectory = isB2BDirectory(hostname);
      const isArticle =
        isEditorialUrl(item.url) || isRespectedPublication(hostname);

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
        isArticle,
        isDirectory,
      });
    } catch {
      // Ignore malformed URLs
    }
  }

  return results;
}

export async function searchWeb(
  query: string,
  options?: { maxResults?: number; location?: string; intent?: ResearchIntent }
): Promise<SearchResult[]> {
  const queryId = `q-${Math.random().toString(36).substring(2, 8)}`;
  const list = await executeSearch({
    query,
    queryId,
    location: options?.location,
    intent: options?.intent,
  });
  return options?.maxResults ? list.slice(0, options.maxResults) : list;
}
