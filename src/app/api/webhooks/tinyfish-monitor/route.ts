import { NextRequest, NextResponse } from "next/server";
import type { MonitorWebhookPayload, FounderByte, FeedCategory } from "@/lib/contracts";
import { addFounderByte } from "@/server/services/bytes/index";
import { getSourceForUrl } from "@/server/services/bytes/registry";
import { fetchUrlAsMarkdown } from "@/server/services/tinyfish/fetch";

export const dynamic = "force-dynamic";

const processedRunIds = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const payload: MonitorWebhookPayload = await req.json();

    const monitorId = payload.monitor_id || payload.monitor?.id;
    const runId = payload.run?.id;

    if (!monitorId) {
      return NextResponse.json(
        { success: false, error: "Missing monitor_id in webhook payload" },
        { status: 400 }
      );
    }

    // Deduplicate webhook events
    if (runId && processedRunIds.has(runId)) {
      return NextResponse.json({
        success: true,
        message: "Run already processed (deduplicated)",
        runId,
      });
    }

    if (runId) {
      processedRunIds.add(runId);
      // Keep set bounded to last 200 runs
      if (processedRunIds.size > 200) {
        const first = processedRunIds.values().next().value;
        if (first) processedRunIds.delete(first);
      }
    }

    const results = payload.run?.results || [];
    const newPositions = new Set(payload.run?.new_result_positions || []);
    const newCandidates = results.filter(
      (r, idx) => newPositions.size === 0 || newPositions.has(r.position ?? idx + 1)
    );

    let createdBytesCount = 0;

    for (const cand of newCandidates) {
      if (!cand.url || !cand.title) continue;

      const matchedSource = getSourceForUrl(cand.url);
      const sourceName = matchedSource
        ? matchedSource.name
        : cand.site_name || new URL(cand.url).hostname.replace(/^www\./, "");

      // Enrich with fetch if available and trustworthy
      let pageExcerpt = cand.snippet || "";
      try {
        if (process.env.TINYFISH_API_KEY && matchedSource?.trustLevel === "high") {
          const fetched = await fetchUrlAsMarkdown(cand.url);
          if (fetched.markdown) {
            pageExcerpt = fetched.markdown.slice(0, 400).replace(/[\r\n]+/g, " ");
          }
        }
      } catch {
        // Fall back to snippet
      }

      const summary =
        pageExcerpt ||
        cand.snippet ||
        `Verified intelligence update detected from ${sourceName} via TinyFish Monitor.`;

      const whyItMatters = `Direct market signal from ${sourceName}. Review for strategic positioning and operational relevance.`;

      const categories: FeedCategory[] = matchedSource?.categories || [
        "Startups",
        "AI & Technology",
      ];

      const newByte: FounderByte = {
        id: `byte-mon-${Date.now()}-${createdBytesCount}`,
        title: cand.title,
        source: sourceName,
        publishedAt: cand.date || new Date().toISOString().split("T")[0],
        retrievedAt: new Date().toISOString(),
        url: cand.url,
        summary,
        whyItMatters,
        categories,
        relatedEntities: [sourceName],
      };

      addFounderByte(newByte);
      createdBytesCount++;
    }

    return NextResponse.json({
      success: true,
      monitorId,
      runId,
      candidateResultsCount: results.length,
      createdBytesCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
