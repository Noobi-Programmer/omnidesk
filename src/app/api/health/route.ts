import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  const tinyfish = Boolean(process.env.TINYFISH_API_KEY);
  const gemini = Boolean(process.env.GEMINI_API_KEY);
  const groq = Boolean(process.env.GROQ_API_KEY);
  const mock = process.env.DEMO_MODE === "1" || (!gemini && !groq);
  const agentEnabled = process.env.OMNIDESK_AGENT_ENABLED !== "0";

  return NextResponse.json({
    success: true,
    status: "ok",
    data: {
      tinyfish,
      llm: gemini || groq || mock,
      provider: mock ? "mock" : gemini ? "gemini" : "groq",
      mock,
      agentEnabled,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    sources: [],
    warnings: [],
    error: null,
  } satisfies ApiResponse<Record<string, unknown>>);
}
