import { NextRequest, NextResponse } from "next/server";
import { signApprovalRequest, markApprovalViewed } from "@/lib/approval-actions";
import { getRequestMetadata } from "@/lib/request-metadata";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, typedName, title, attestConfirmed } = body;

    if (!recipientId || !typedName || !attestConfirmed) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get IP and User-Agent from request
    const { ipAddress, userAgent } = await getRequestMetadata();

    // Mark as viewed before signing
    await markApprovalViewed(recipientId);

    // Sign the approval
    await signApprovalRequest({
      recipientId,
      typedName,
      title,
      attestConfirmed,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign approval error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to sign approval" },
      { status: 500 }
    );
  }
}
