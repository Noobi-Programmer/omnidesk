import { getTinyFishClient } from "./client";
import type { SourceDocument, Warning } from "@/lib/contracts";

export interface FetchResult {
  sources: SourceDocument[];
  warnings: Warning[];
}

export async function fetchPageContents(
  urls: string[],
  purpose?: string
): Promise<FetchResult> {
  const client = getTinyFishClient();
  const sources: SourceDocument[] = [];
  const warnings: Warning[] = [];

  // Limit to batches of 10 per TinyFish API rules
  const batch = urls.slice(0, 10);
  if (batch.length === 0) {
    return { sources, warnings };
  }

  try {
    const response = await client.fetch.getContents({
      urls: batch,
      format: "markdown",
      purpose: purpose ?? "Extract supplier capabilities, pricing, MOQ, and contact info",
      ttl: 3600, // cache for 1 hour to save latency
    });

    const now = new Date().toISOString();

    // Successful results
    for (const item of response.results) {
      try {
        const domain = new URL(item.final_url || item.url).hostname;
        const textContent =
          typeof item.text === "string"
            ? item.text
            : item.text && typeof item.text === "object"
            ? JSON.stringify(item.text)
            : "";

        sources.push({
          id: `s-${Math.random().toString(36).substring(2, 9)}`,
          url: item.url,
          finalUrl: item.final_url || undefined,
          domain,
          title: item.title || domain,
          retrievedVia: "search",
          fetchedVia: "fetch",
          contentExcerpt: textContent ? textContent.substring(0, 15000) : "",
          fetchedAt: now,
          status: textContent && textContent.length > 50 ? "ok" : "degraded",
        });
      } catch {
        // Skip malformed URL
      }
    }

    // Capture per-URL errors
    if (response.errors && response.errors.length > 0) {
      for (const err of response.errors) {
        warnings.push({
          code: "SOURCE_FAILED",
          message: `Fetch failed for ${err.url}: ${err.error}`,
        });
        try {
          const domain = new URL(err.url).hostname;
          sources.push({
            id: `s-${Math.random().toString(36).substring(2, 9)}`,
            url: err.url,
            domain,
            title: domain,
            retrievedVia: "search",
            fetchedVia: "fetch",
            status: "failed",
          });
        } catch {
          // Ignore
        }
      }
    }
  } catch (error) {
    warnings.push({
      code: "FETCH_BATCH_ERROR",
      message: error instanceof Error ? error.message : "Fetch request failed",
    });
  }

  return { sources, warnings };
}

export async function fetchUrlAsMarkdown(
  url: string,
  purpose?: string
): Promise<{ content: string; markdown: string; title?: string }> {
  const res = await fetchPageContents([url], purpose);
  const found = res.sources.find((s) => s.url === url || s.finalUrl === url);
  const text = found?.contentExcerpt || "";
  return {
    content: text,
    markdown: text,
    title: found?.title,
  };
}
