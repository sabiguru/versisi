import { NextRequest, NextResponse } from "next/server";
import { generateScopeVersionXLSX } from "@/lib/exports";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  try {
    const { versionId } = await params;
    const xlsxBuffer = await generateScopeVersionXLSX(versionId);

    return new NextResponse(xlsxBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="scope-version-${versionId}.xlsx"`,
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
