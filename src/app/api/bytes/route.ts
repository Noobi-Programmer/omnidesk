import { NextRequest, NextResponse } from "next/server";
import { getFounderBytes } from "@/server/services/bytes/index";
import type { ApiResponse, FounderByte } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "All";
    const query = searchParams.get("query") || "";
    const live = searchParams.get("live") === "true";

    const bytes = await getFounderBytes({ category, query, live });

    const response: ApiResponse<FounderByte[]> = {
      success: true,
      status: "ok",
      data: bytes,
      sources: bytes.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
      })),
      warnings: [],
      error: null,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to retrieve founder bytes";
    const errorResponse: ApiResponse<FounderByte[]> = {
      success: false,
      status: "error",
      data: null,
      sources: [],
      warnings: [],
      error: {
        code: "BYTES_FETCH_FAILED",
        message: errorMessage,
        retryable: true,
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
