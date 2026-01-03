/**
 * Proposal Export Utilities (Prompt 13)
 *
 * Generate artifacts-only exports (PDF, DOCX, XLSX).
 * Uses canonical data only - NEVER mutates database.
 *
 * REQUIREMENTS:
 * - Include version meta, approvals, snapshotHash, generation timestamp
 * - Read-only operations
 * - Use canonical snapshot data
 */

import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType } from "docx";
import ExcelJS from "exceljs";
import { prisma } from "./prisma";
import { CanonicalSnapshot } from "./canonical-snapshot";
import { DiffSummaryV1 } from "./canonical-diff";

/**
 * Fetch all export data for a proposal
 * Read-only - never mutates data
 */
export async function getProposalExportData(proposalId: string) {
  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      project: true,
      baseScopeVersion: true,
      sections: {
        include: {
          items: {
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
      approvalRequests: {
        include: {
          recipients: {
            include: {
              signature: true,
            },
          },
        },
      },
    },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  return proposal;
}

/**
 * Generate PDF export
 * Returns Buffer that can be streamed to response
 */
export async function generateProposalPDF(proposalId: string): Promise<Buffer> {
  const data = await getProposalExportData(proposalId);
  const diffSummary = data.diffSummaryJson as DiffSummaryV1 | null;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Scope Agreement Proposal", { align: "center" });
    doc.moveDown();

    // Version Info
    doc.fontSize(16).font("Helvetica-Bold").text("Version Information");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Proposed Version: ${data.proposedMajor}.${data.proposedMinor}`);
    doc.text(`Base Version: ${data.baseScopeVersion.major}.${data.baseScopeVersion.minor}`);
    doc.text(`Status: ${data.status}`);
    doc.text(`Requested by: ${data.requestedByParty}`);
    doc.moveDown();

    // Metadata
    doc.fontSize(16).font("Helvetica-Bold").text("Proposal Details");
    doc.fontSize(10).font("Helvetica");
    doc.text(`Title: ${data.title}`);
    doc.text(`Change Note: ${data.changeNote}`);
    doc.text(`Rationale: ${data.rationale}`);
    doc.text(`Impact (Timeline): ${data.impactTimeline}`);
    doc.text(`Impact (Cost): ${data.impactCost}`);
    doc.text(`Risk: ${data.risk}`);
    doc.moveDown();

    // Diff Summary
    if (diffSummary) {
      doc.fontSize(16).font("Helvetica-Bold").text("Change Summary");
      doc.fontSize(10).font("Helvetica");
      doc.text(`Total Changes: ${diffSummary.summary.totalChanges}`);
      doc.text(`Sections Added: ${diffSummary.summary.sectionsAdded}`);
      doc.text(`Sections Removed: ${diffSummary.summary.sectionsRemoved}`);
      doc.text(`Sections Modified: ${diffSummary.summary.sectionsModified}`);
      doc.text(`Items Added: ${diffSummary.summary.itemsAdded}`);
      doc.text(`Items Removed: ${diffSummary.summary.itemsRemoved}`);
      doc.text(`Items Modified: ${diffSummary.summary.itemsModified}`);
      doc.moveDown();
    }

    // Sections
    doc.fontSize(16).font("Helvetica-Bold").text("Proposed Scope");
    doc.moveDown(0.5);

    for (const section of data.sections) {
      doc.fontSize(14).font("Helvetica-Bold").text(section.title);
      doc.moveDown(0.3);

      for (const item of section.items) {
        doc.fontSize(11).font("Helvetica-Bold").text(`• ${item.title}`);
        doc.fontSize(10).font("Helvetica").text(`  ${item.description}`, { indent: 20 });
        if (item.acceptanceCriteria) {
          doc.fontSize(9).font("Helvetica-Oblique").text(`  Acceptance: ${item.acceptanceCriteria}`, { indent: 20 });
        }
        doc.fontSize(9).text(`  Priority: ${item.priority}`, { indent: 20 });
        doc.moveDown(0.3);
      }
      doc.moveDown();
    }

    // Approvals
    if (data.approvalRequests.length > 0) {
      doc.addPage();
      doc.fontSize(16).font("Helvetica-Bold").text("Approvals");
      doc.moveDown();

      for (const approvalRequest of data.approvalRequests) {
        doc.fontSize(12).font("Helvetica-Bold").text(`Status: ${approvalRequest.status}`);
        doc.moveDown(0.5);

        for (const recipient of approvalRequest.recipients) {
          doc.fontSize(10).font("Helvetica");
          doc.text(`${recipient.name || recipient.email} (${recipient.party})`);
          doc.text(`  Status: ${recipient.status}`);

          if (recipient.signature) {
            doc.text(`  Signed: ${new Date(recipient.signature.signedAt).toLocaleString()}`);
            doc.text(`  Typed Name: ${recipient.signature.typedName}`);
            doc.text(`  Snapshot Hash: ${recipient.signature.snapshotHash.substring(0, 16)}...`);
            doc.text(`  Signature Hash: ${recipient.signature.signatureHash.substring(0, 16)}...`);
          }
          doc.moveDown(0.5);
        }
      }
    }

    // Footer
    doc.addPage();
    doc.fontSize(10).font("Helvetica-Oblique").text("Export Metadata", { align: "center" });
    doc.text(`Generated: ${new Date().toISOString()}`, { align: "center" });
    doc.text(`Proposal ID: ${data.id}`, { align: "center" });
    doc.text("This export is an artifact only and does not mutate data.", { align: "center" });

    doc.end();
  });
}

/**
 * Generate DOCX export
 * Returns Buffer that can be streamed to response
 */
export async function generateProposalDOCX(proposalId: string): Promise<Buffer> {
  const data = await getProposalExportData(proposalId);
  const diffSummary = data.diffSummaryJson as DiffSummaryV1 | null;

  const children: any[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "Scope Agreement Proposal",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  // Version Info
  children.push(new Paragraph({ text: "Version Information", heading: HeadingLevel.HEADING_2 }));
  children.push(new Paragraph({ text: `Proposed Version: ${data.proposedMajor}.${data.proposedMinor}` }));
  children.push(new Paragraph({ text: `Base Version: ${data.baseScopeVersion.major}.${data.baseScopeVersion.minor}` }));
  children.push(new Paragraph({ text: `Status: ${data.status}` }));
  children.push(new Paragraph({ text: `Requested by: ${data.requestedByParty}` }));
  children.push(new Paragraph({ text: "" })); // spacer

  // Proposal Details
  children.push(new Paragraph({ text: "Proposal Details", heading: HeadingLevel.HEADING_2 }));
  children.push(new Paragraph({ text: `Title: ${data.title}` }));
  children.push(new Paragraph({ text: `Change Note: ${data.changeNote}` }));
  children.push(new Paragraph({ text: `Rationale: ${data.rationale}` }));
  children.push(new Paragraph({ text: `Impact (Timeline): ${data.impactTimeline}` }));
  children.push(new Paragraph({ text: `Impact (Cost): ${data.impactCost}` }));
  children.push(new Paragraph({ text: `Risk: ${data.risk}` }));
  children.push(new Paragraph({ text: "" }));

  // Diff Summary
  if (diffSummary) {
    children.push(new Paragraph({ text: "Change Summary", heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ text: `Total Changes: ${diffSummary.summary.totalChanges}` }));
    children.push(new Paragraph({ text: `Sections Added: ${diffSummary.summary.sectionsAdded}` }));
    children.push(new Paragraph({ text: `Items Added: ${diffSummary.summary.itemsAdded}` }));
    children.push(new Paragraph({ text: "" }));
  }

  // Sections
  children.push(new Paragraph({ text: "Proposed Scope", heading: HeadingLevel.HEADING_2 }));
  for (const section of data.sections) {
    children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_3 }));
    for (const item of section.items) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: item.title, bold: true })],
        })
      );
      children.push(new Paragraph({ text: item.description }));
      if (item.acceptanceCriteria) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Acceptance: ${item.acceptanceCriteria}`, italics: true })],
          })
        );
      }
      children.push(new Paragraph({ text: `Priority: ${item.priority}` }));
      children.push(new Paragraph({ text: "" }));
    }
  }

  // Export Metadata
  children.push(new Paragraph({ text: "Export Metadata", heading: HeadingLevel.HEADING_2 }));
  children.push(new Paragraph({ text: `Generated: ${new Date().toISOString()}` }));
  children.push(new Paragraph({ text: `Proposal ID: ${data.id}` }));

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Generate XLSX export
 * Returns Buffer that can be streamed to response
 */
export async function generateProposalXLSX(proposalId: string): Promise<Buffer> {
  const data = await getProposalExportData(proposalId);
  const diffSummary = data.diffSummaryJson as DiffSummaryV1 | null;

  const workbook = new ExcelJS.Workbook();

  // Metadata Sheet
  const metaSheet = workbook.addWorksheet("Metadata");
  metaSheet.addRow(["Scope Agreement Proposal Export"]);
  metaSheet.addRow([]);
  metaSheet.addRow(["Proposed Version", `${data.proposedMajor}.${data.proposedMinor}`]);
  metaSheet.addRow(["Base Version", `${data.baseScopeVersion.major}.${data.baseScopeVersion.minor}`]);
  metaSheet.addRow(["Status", data.status]);
  metaSheet.addRow(["Title", data.title]);
  metaSheet.addRow(["Change Note", data.changeNote]);
  metaSheet.addRow(["Rationale", data.rationale]);
  metaSheet.addRow(["Impact (Timeline)", data.impactTimeline]);
  metaSheet.addRow(["Impact (Cost)", data.impactCost]);
  metaSheet.addRow(["Risk", data.risk]);
  metaSheet.addRow(["Requested By", data.requestedByParty]);
  metaSheet.addRow([]);
  metaSheet.addRow(["Generated", new Date().toISOString()]);
  metaSheet.addRow(["Proposal ID", data.id]);

  // Diff Summary Sheet
  if (diffSummary) {
    const diffSheet = workbook.addWorksheet("Change Summary");
    diffSheet.addRow(["Metric", "Count"]);
    diffSheet.addRow(["Total Changes", diffSummary.summary.totalChanges]);
    diffSheet.addRow(["Sections Added", diffSummary.summary.sectionsAdded]);
    diffSheet.addRow(["Sections Removed", diffSummary.summary.sectionsRemoved]);
    diffSheet.addRow(["Sections Modified", diffSummary.summary.sectionsModified]);
    diffSheet.addRow(["Items Added", diffSummary.summary.itemsAdded]);
    diffSheet.addRow(["Items Removed", diffSummary.summary.itemsRemoved]);
    diffSheet.addRow(["Items Modified", diffSummary.summary.itemsModified]);
  }

  // Scope Items Sheet
  const itemsSheet = workbook.addWorksheet("Scope Items");
  itemsSheet.addRow(["Section", "Item Title", "Description", "Acceptance Criteria", "Priority", "Order"]);

  for (const section of data.sections) {
    for (const item of section.items) {
      itemsSheet.addRow([
        section.title,
        item.title,
        item.description,
        item.acceptanceCriteria || "",
        item.priority,
        item.orderIndex,
      ]);
    }
  }

  // Approvals Sheet
  if (data.approvalRequests.length > 0) {
    const approvalsSheet = workbook.addWorksheet("Approvals");
    approvalsSheet.addRow(["Name", "Email", "Party", "Status", "Signed At", "Typed Name", "Snapshot Hash"]);

    for (const approvalRequest of data.approvalRequests) {
      for (const recipient of approvalRequest.recipients) {
        approvalsSheet.addRow([
          recipient.name || "",
          recipient.email,
          recipient.party,
          recipient.status,
          recipient.signature?.signedAt ? new Date(recipient.signature.signedAt).toISOString() : "",
          recipient.signature?.typedName || "",
          recipient.signature?.snapshotHash.substring(0, 16) || "",
        ]);
      }
    }
  }

  return await workbook.xlsx.writeBuffer() as unknown as Buffer;
}
