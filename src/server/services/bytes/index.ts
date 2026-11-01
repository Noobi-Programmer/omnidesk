import type { FounderByte, FeedCategory, SearchResult } from "@/lib/contracts";
import { searchWeb } from "../tinyfish/search";
import { getSourceForUrl } from "./registry";
import {
  getStoredFounderBytes,
  addStoredFounderByte,
  saveStoredFounderBytes,
} from "../storage";
import { cleanHostname, classifyCategoriesFromText } from "./ingest";
import { SAMPLE_FOUNDER_BYTES } from "../../../../tests/fixtures/sample_bytes";

// Re-export sample bytes for test suites
export { SAMPLE_FOUNDER_BYTES as CURATED_FOUNDER_BYTES };

export function addFounderByte(byte: FounderByte): boolean {
  return addStoredFounderByte(byte);
}

export function clearFounderBytes(): void {
  saveStoredFounderBytes([]);
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

  // 1. Read exclusively from persistent durable store (no hardcoded fake news)
  let bytes = getStoredFounderBytes();

  // 2. If live search is explicitly requested and TinyFish is configured
  if (live && process.env.TINYFISH_API_KEY) {
    try {
      const searchResults = await searchWeb(
        "AI tech startups founders funding announcements",
        { maxResults: 5 }
      );

      for (let i = 0; i < searchResults.length; i++) {
        const res: SearchResult = searchResults[i];
        if (!res.url || !res.title) continue;

        const matchedSource = getSourceForUrl(res.url);
        // Accurate source attribution — never default to TechCrunch
        const sourceName = matchedSource
          ? matchedSource.name
          : cleanHostname(res.url);

        // Publication date truthfulness — never fabricate current date
        const publishedAt = "Publication date unavailable";
        const retrievedAt = new Date().toISOString();

        const liveByte: FounderByte = {
          id: `live-${Date.now()}-${i}`,
          title: res.title.trim(),
          source: sourceName,
          publishedAt,
          retrievedAt,
          url: res.url,
          summary: res.snippet || `Live intelligence signal discovered from ${sourceName}.`,
          whyItMatters:
            `Direct market signal detected on ${sourceName}. Useful for competitive and ecosystem tracking.`,
          categories: matchedSource?.categories || classifyCategoriesFromText(res.title, res.snippet || ""),
          relatedEntities: [sourceName],
        };

        addStoredFounderByte(liveByte);
      }

      // Re-read updated durable bytes
      bytes = getStoredFounderBytes();
    } catch {
      // Gracefully continue with durable bytes on network error
    }
  }

  // 3. Filter by category
  if (category && category !== "All") {
    bytes = bytes.filter((b) =>
      b.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  // 4. Filter by search query
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
