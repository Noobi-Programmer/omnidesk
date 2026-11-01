import { getTinyFishClient } from "./client";
import type { SourceDocument } from "@/lib/contracts";

export interface AgentRunCallbacks {
  onStreamingUrl?: (streamingUrl: string) => void;
  onProgress?: (purpose: string) => void;
}

export interface AgentExtractResult {
  source: SourceDocument;
  data: Record<string, unknown> | null;
  streamingUrl?: string;
  success: boolean;
}

export async function runAgentExtraction(
  url: string,
  supplierName: string,
  callbacks?: AgentRunCallbacks
): Promise<AgentExtractResult> {
  const client = getTinyFishClient();
  const domain = new URL(url).hostname;

  const goal = `You are on ${supplierName}'s website (${url}). Find and extract: product range, indicative pricing, minimum order quantity (MOQ), delivery terms and turnaround time, credibility signals (certifications like ISO, years in business, client roster), and contact details (email, phone, address). If any field is not stated on the site, return null for it. Never guess. Return ONLY the structured output.`;

  const outputSchema = {
    type: "object",
    properties: {
      product_range: { type: "string", nullable: true },
      pricing: { type: "string", nullable: true },
      moq: { type: "string", nullable: true },
      delivery: { type: "string", nullable: true },
      credibility: { type: "string", nullable: true },
      contact: { type: "string", nullable: true },
    },
    required: ["product_range", "pricing", "moq", "delivery", "credibility", "contact"],
  };

  const source: SourceDocument = {
    id: `s-${Math.random().toString(36).substring(2, 9)}`,
    url,
    domain,
    title: supplierName,
    retrievedVia: "search",
    fetchedVia: "agent",
    status: "pending",
  };

  try {
    const stream = await client.agent.stream({
      url,
      goal,
      output_schema: outputSchema,
      agent_config: {
        max_duration_seconds: 60, // Bound strictly to protect Vercel timeout and wallet
      },
    });

    let completedData: Record<string, unknown> | null = null;
    let liveUrl: string | undefined;

    for await (const event of stream) {
      if (event.type === "STREAMING_URL" && "streaming_url" in event) {
        liveUrl = (event as { streaming_url: string }).streaming_url;
        source.agentLiveUrl = liveUrl;
        callbacks?.onStreamingUrl?.(liveUrl);
      } else if (event.type === "PROGRESS" && "purpose" in event) {
        callbacks?.onProgress?.((event as { purpose: string }).purpose);
      } else if (event.type === "COMPLETE" && "result" in event) {
        completedData = (event as { result?: Record<string, unknown> }).result ?? null;
      }
    }

    source.status = completedData ? "ok" : "degraded";
    return {
      source,
      data: completedData,
      streamingUrl: liveUrl,
      success: Boolean(completedData),
    };
  } catch (error) {
    source.status = "failed";
    return {
      source,
      data: null,
      success: false,
    };
  }
}
