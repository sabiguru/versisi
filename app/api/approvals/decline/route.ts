import { NextRequest, NextResponse } from "next/server";
import { declineApprovalRequest, markApprovalViewed } from "@/lib/approval-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, reason } = body;

    if (!recipientId || !reason) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mark as viewed before declining
    await markApprovalViewed(recipientId);

    // Decline the approval
    await declineApprovalRequest({
      recipientId,
      reason,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Decline approval error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to decline approval" },
      { status: 500 }
    );
  }
}
