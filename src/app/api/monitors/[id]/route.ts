import { NextRequest, NextResponse } from "next/server";
import {
  getMonitor,
  updateMonitorStatus,
  deleteMonitor,
} from "@/server/services/tinyfish/monitors";
import type { ApiResponse, TinyMonitor } from "@/lib/contracts";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const monitor = await getMonitor(id);
    if (!monitor) {
      return NextResponse.json(
        {
          success: false,
          status: "error",
          data: null,
          sources: [],
          warnings: [],
          error: { code: "NOT_FOUND", message: "Monitor not found", retryable: false },
        },
        { status: 404 }
      );
    }
    const response: ApiResponse<TinyMonitor> = {
      success: true,
      status: "ok",
      data: monitor,
      sources: [],
      warnings: [],
      error: null,
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get monitor";
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "GET_MONITOR_FAILED", message, retryable: true },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status = body.status === "paused" ? "paused" : "active";

    const monitor = await updateMonitorStatus(id, status);
    const response: ApiResponse<TinyMonitor> = {
      success: true,
      status: "ok",
      data: monitor,
      sources: [],
      warnings: [],
      error: null,
    };
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update monitor status";
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "UPDATE_MONITOR_FAILED", message, retryable: true },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteMonitor(id);
    return NextResponse.json({
      success,
      status: success ? "ok" : "error",
      data: { deleted: success, id },
      sources: [],
      warnings: [],
      error: success ? null : { code: "DELETE_FAILED", message: "Failed to delete monitor", retryable: false },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete monitor";
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "DELETE_MONITOR_FAILED", message, retryable: true },
      },
      { status: 500 }
    );
  }
}
