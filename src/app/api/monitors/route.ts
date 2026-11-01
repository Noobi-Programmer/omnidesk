import { NextRequest, NextResponse } from "next/server";
import { listMonitors, createMonitor } from "@/server/services/tinyfish/monitors";
import type { ApiResponse, TinyMonitor, CreateMonitorRequest } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const monitors = await listMonitors();
    const response: ApiResponse<TinyMonitor[]> = {
      success: true,
      status: "ok",
      data: monitors,
      sources: [],
      warnings: [],
      error: null,
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list monitors";
    const errorResponse: ApiResponse<TinyMonitor[]> = {
      success: false,
      status: "error",
      data: null,
      sources: [],
      warnings: [],
      error: {
        code: "LIST_MONITORS_FAILED",
        message,
        retryable: true,
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateMonitorRequest = await req.json();

    if (!body.name || !body.type || !body.config) {
      return NextResponse.json(
        {
          success: false,
          status: "error",
          data: null,
          sources: [],
          warnings: [],
          error: {
            code: "INVALID_MONITOR_PAYLOAD",
            message: "name, type, and config are required",
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    const monitor = await createMonitor(body);
    const response: ApiResponse<TinyMonitor> = {
      success: true,
      status: "ok",
      data: monitor,
      sources: [],
      warnings: [],
      error: null,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create monitor";
    const errorResponse: ApiResponse<TinyMonitor> = {
      success: false,
      status: "error",
      data: null,
      sources: [],
      warnings: [],
      error: {
        code: "CREATE_MONITOR_FAILED",
        message,
        retryable: true,
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
