import type { FounderByte, FeedCategory, TinyMonitor } from "@/lib/contracts";
import { getSourceForUrl } from "./registry";
import { fetchUrlAsMarkdown } from "../tinyfish/fetch";
import {
  addStoredFounderByte,
  getStoredFounderBytes,
  updateStoredMonitor,
} from "../storage";

export interface MonitorCandidateResult {
  url: string;
  title: string;
  snippet?: string;
  date?: string;
  position?: number;
  site_name?: string;
}

export interface MonitorRunData {
  id?: string;
  request_id?: string;
  query?: string;
  url?: string;
  status_code?: number;
  result_count?: number;
  results?: MonitorCandidateResult[];
  new_result_positions?: number[];
  created_at?: string;
}

export function cleanHostname(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "Web Source";
  }
}

export function classifyCategoriesFromText(title: string, snippet: string): FeedCategory[] {
  const text = `${title} ${snippet}`.toLowerCase();
  const categories: Set<FeedCategory> = new Set();

  if (/funding|seed|series [a-z]|venture|vc|raised|valuation|capital/.test(text)) {
    categories.add("Funding & VC");
  }
  if (/ai|artificial intelligence|llm|model|gpu|reasoning|agent|neural|machine learning/.test(text)) {
    categories.add("AI & Technology");
  }
  if (/launch|launches|released|announces|debuts|protocol|product/.test(text)) {
    categories.add("Product Launches");
  }
  if (/market|economy|inflation|trade|regulation|antitrust|b2b/.test(text)) {
    categories.add("Markets & Business");
  }
  if (/founder|operator|advice|lesson|strategy|pivot|framework/.test(text)) {
    categories.add("Founder Insights");
  }
  if (/startup|y combinator|accelerator|incubator|founder|stealth/.test(text) || categories.size === 0) {
    categories.add("Startups");
  }

  return Array.from(categories);
}

export async function ingestMonitorRun(
  runData: MonitorRunData | null | undefined,
  monitor?: Partial<TinyMonitor>
): Promise<{ ingestedCount: number; bytes: FounderByte[] }> {
  if (!runData || !Array.isArray(runData.results) || runData.results.length === 0) {
    return { ingestedCount: 0, bytes: [] };
  }

  const results = runData.results;
  const newPositions = new Set(runData.new_result_positions || []);
  const candidates = results.filter(
    (r, idx) => newPositions.size === 0 || newPositions.has(r.position ?? idx + 1)
  );

  const ingestedBytes: FounderByte[] = [];
  const storedBytes = getStoredFounderBytes();
  const existingUrls = new Set(
    storedBytes.map((b) => b.url.trim().toLowerCase().replace(/\/+$/, ""))
  );

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    if (!cand.url || !cand.title) continue;

    const normalizedUrl = cand.url.trim().toLowerCase().replace(/\/+$/, "");
    if (existingUrls.has(normalizedUrl)) {
      continue; // Duplicate rejection
    }

    // Source Attribution — never default to TechCrunch
    const matchedSource = getSourceForUrl(cand.url);
    const sourceName = matchedSource
      ? matchedSource.name
      : cand.site_name?.trim() || cleanHostname(cand.url);

    // Publication Date Truthfulness — never fake today's date
    const publishedAt = cand.date && cand.date.trim() ? cand.date.trim() : "Publication date unavailable";
    const retrievedAt = new Date().toISOString();

    // Content enrichment
    let summaryText = cand.snippet || "";
    if (process.env.TINYFISH_API_KEY && matchedSource?.trustLevel === "high") {
      try {
        const fetched = await fetchUrlAsMarkdown(cand.url);
        if (fetched.markdown) {
          const clean = fetched.markdown
            .slice(0, 500)
            .replace(/[#*`_\[\]]/g, "")
            .replace(/\s+/g, " ")
            .trim();
          if (clean.length > 30) {
            summaryText = clean;
          }
        }
      } catch {
        // Fall back to snippet
      }
    }

    if (!summaryText) {
      summaryText = `Public intelligence signal from ${sourceName}.`;
    }

    const whyItMatters = `Significant signal detected from ${sourceName}. Monitor for strategic operational impact and market movement.`;
    const categories = matchedSource?.categories || classifyCategoriesFromText(cand.title, summaryText);

    const newByte: FounderByte = {
      id: `byte-mon-${Date.now()}-${i}`,
      title: cand.title.trim(),
      source: sourceName,
      publishedAt,
      retrievedAt,
      url: cand.url,
      summary: summaryText,
      whyItMatters,
      categories,
      relatedEntities: [sourceName],
    };

    const added = addStoredFounderByte(newByte);
    if (added) {
      existingUrls.add(normalizedUrl);
      ingestedBytes.push(newByte);
    }
  }

  // Update monitor timestamp if monitor ID is known
  const monId = monitor?.id;
  if (monId) {
    updateStoredMonitor(monId, {
      last_run_at: new Date().toISOString(),
    });
  }

  return {
    ingestedCount: ingestedBytes.length,
    bytes: ingestedBytes,
  };
}
