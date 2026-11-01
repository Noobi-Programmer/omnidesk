import { NextRequest, NextResponse } from "next/server";
import { runMonitorNow } from "@/server/services/tinyfish/monitors";
import type { ApiResponse } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const runResult = await runMonitorNow(id);

    const response: ApiResponse<any> = {
      success: true,
      status: "ok",
      data: runResult,
      sources: [],
      warnings: [],
      error: null,
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to trigger monitor run";
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "TRIGGER_RUN_FAILED", message, retryable: true },
      },
      { status: 500 }
    );
  }
}
