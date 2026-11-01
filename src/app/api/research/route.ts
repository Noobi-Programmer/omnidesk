import { NextRequest } from "next/server";
import { ResearchRequestSchema, SseEventName } from "@/lib/contracts";
import { getResearchEngine } from "@/server/orchestrator/engine";

export const maxDuration = 60; // 60s max execution for Vercel Hobby Fluid Compute
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = ResearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.format() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const engine = getResearchEngine();

  const stream = new ReadableStream({
    async start(controller) {
      // 5-second SSE heartbeat comment
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 5000);

      let hasEmittedError = false;
      const sendEvent = (event: SseEventName, data: unknown) => {
        try {
          if (event === "error") {
            hasEmittedError = true;
          }
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream might be closed by client
        }
      };

      try {
        await engine.execute(parsed.data, sendEvent);
      } catch (error) {
        if (!hasEmittedError) {
          sendEvent("error", {
            success: false,
            status: "error",
            data: null,
            sources: [],
            warnings: [],
            error: {
              code: "PIPELINE_ERROR",
              message: error instanceof Error ? error.message : "Pipeline execution failed",
              retryable: true,
            },
          });
        }
      } finally {
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
