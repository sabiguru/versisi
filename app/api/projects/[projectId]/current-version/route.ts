import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = await requireUserId();
    const { projectId } = await params;

    // Check user has access to project
    const membership = await prisma.projectMembership.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    // Get latest scope version
    const currentVersion = await prisma.scopeVersion.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      versionId: currentVersion?.id || null,
      major: currentVersion?.major || 0,
      minor: currentVersion?.minor || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
