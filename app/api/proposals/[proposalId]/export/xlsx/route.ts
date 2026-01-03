import { NextRequest, NextResponse } from "next/server";
import { generateProposalXLSX } from "@/lib/exports";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const { proposalId } = await params;
    const xlsxBuffer = await generateProposalXLSX(proposalId);

    return new NextResponse(xlsxBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="proposal-${proposalId}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("XLSX export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate XLSX" },
      { status: 500 }
    );
  }
}
