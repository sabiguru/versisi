import { NextRequest, NextResponse } from "next/server";
import { generateProposalDOCX } from "@/lib/exports";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const { proposalId } = await params;
    const docxBuffer = await generateProposalDOCX(proposalId);

    return new NextResponse(docxBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="proposal-${proposalId}.docx"`,
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
