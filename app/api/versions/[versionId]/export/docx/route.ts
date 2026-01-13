import { NextRequest, NextResponse } from "next/server";
import { generateScopeVersionDOCX } from "@/lib/exports";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    const docxBuffer = await generateScopeVersionDOCX(versionId);

    return new NextResponse(docxBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="scope-version-${versionId}.docx"`,
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate DOCX" },
      { status: 500 }
    );
  }
}
