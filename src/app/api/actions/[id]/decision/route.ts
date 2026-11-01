import { NextRequest, NextResponse } from "next/server";
import {
  ActionDecisionRequestSchema,
  ActionDecisionResponse,
  ApiResponse,
} from "@/lib/contracts";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "INVALID_REQUEST", message: "Invalid JSON body", retryable: false },
      } satisfies ApiResponse<null>,
      { status: 400 }
    );
  }

  const parsed = ActionDecisionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        status: "error",
        data: null,
        sources: [],
        warnings: [],
        error: { code: "VALIDATION_FAILED", message: "Invalid decision schema", retryable: false },
      } satisfies ApiResponse<null>,
      { status: 400 }
    );
  }

  const { decision, editedPayload } = parsed.data;
  const auditId = `audit-${Math.random().toString(36).substring(2, 9)}`;

  let mailto: string | undefined;
  if (decision === "approve" && editedPayload) {
    const to = editedPayload.to || "";
    const subject = encodeURIComponent(editedPayload.subject || "Enquiry");
    const emailBody = encodeURIComponent(editedPayload.body || "");
    mailto = `mailto:${to}?subject=${subject}&body=${emailBody}`;
  }

  const responseData: ActionDecisionResponse = {
    id,
    status: decision === "approve" ? "approved" : "dismissed",
    auditId,
    mailto,
  };

  return NextResponse.json({
    success: true,
    status: "ok",
    data: responseData,
    sources: [],
    warnings: [],
    error: null,
  } satisfies ApiResponse<ActionDecisionResponse>);
}
