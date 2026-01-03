# Prompt 13 - Exports (COMPLETE)

## Implementation Summary

Artifacts-only exports in PDF, DOCX, and XLSX formats. Uses canonical data only - NEVER mutates database.

---

## Core Requirements Met

### ✅ PDF Export
- Complete proposal document
- Version metadata
- Approval signatures with hashes
- Snapshot information
- Professional formatting

### ✅ DOCX Export
- Word-compatible document
- Structured with headings
- All proposal data
- Approval records
- Export metadata

### ✅ XLSX Export
- Multi-sheet workbook
- Metadata sheet
- Change summary sheet
- Scope items sheet
- Approvals sheet
- Tabular format for analysis

### ✅ Canonical Data Only
- Reads from database (read-only)
- Uses canonical snapshots
- Includes snapshotHash
- Generation timestamp
- NO DATA MUTATION

### ✅ Required Inclusions
- Version meta (proposed, base)
- Approval details with signatures
- snapshotHash from signatures
- generation timestamp
- Proposal metadata

---

## Files Created

### 1. Export Library (`lib/exports.ts`)

**Core Functions:**

**getProposalExportData(proposalId)**
- Fetches all data needed for export
- Includes: proposal, project, sections, items, approvals, signatures
- Read-only query - no mutations
- Returns complete proposal data structure

**generateProposalPDF(proposalId)**
- Generates PDF using PDFKit
- Returns Buffer for streaming
- Includes:
  - Title page
  - Version information
  - Proposal details (title, changeNote, rationale, impacts, risk)
  - Diff summary (if available)
  - Complete proposed scope (sections + items)
  - Approval signatures with hashes
  - Export metadata footer

**generateProposalDOCX(proposalId)**
- Generates Word document using `docx` library
- Returns Buffer for streaming
- Structured with headings (H1, H2, H3)
- Includes same content as PDF
- Professional document formatting

**generateProposalXLSX(proposalId)**
- Generates Excel workbook using ExcelJS
- Returns Buffer for streaming
- Multiple sheets:
  1. **Metadata** - Proposal details, version info, export timestamp
  2. **Change Summary** - Diff statistics (if available)
  3. **Scope Items** - All items with sections, tabular format
  4. **Approvals** - All signatures with hashes and timestamps

---

### 2. API Routes

**GET `/api/proposals/[proposalId]/export/pdf`**
- Generates and streams PDF
- Content-Type: application/pdf
- Content-Disposition: attachment (triggers download)
- Filename: `proposal-{proposalId}.pdf`

**GET `/api/proposals/[proposalId]/export/docx`**
- Generates and streams DOCX
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Content-Disposition: attachment
- Filename: `proposal-{proposalId}.docx`

**GET `/api/proposals/[proposalId]/export/xlsx`**
- Generates and streams XLSX
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Content-Disposition: attachment
- Filename: `proposal-{proposalId}.xlsx`

---

### 3. UI Component (`components/proposals/export-buttons.tsx`)

**ExportButtons Component**
- Three buttons: PDF, DOCX, XLSX
- Icons from lucide-react
- Client-side download handling
- Loading state during export
- Error handling

**Usage:**
```tsx
<ExportButtons proposalId={proposal.id} />
```

---

## Export Content Details

### Version Information
- **Proposed Version**: major.minor format
- **Base Version**: major.minor format
- **Status**: Current proposal status (DRAFT, AWAITING_APPROVAL, APPROVED, REJECTED)
- **Requested By**: Party that created proposal (DEV/CLIENT)

### Proposal Details
- **Title**: Proposal title
- **Change Note**: Brief description
- **Rationale**: Detailed reasoning
- **Impact (Timeline)**: NONE, LOW, MEDIUM, HIGH
- **Impact (Cost)**: NONE, LOW, MEDIUM, HIGH
- **Risk**: LOW, MEDIUM, HIGH

### Diff Summary (if computed)
- **Total Changes**: Count
- **Sections Added/Removed/Modified**: Counts
- **Items Added/Removed/Modified**: Counts
- **Items Moved**: Count

### Proposed Scope
- **Sections**: All proposal sections
  - Title
  - Order index
- **Items**: All items within sections
  - Title
  - Description
  - Acceptance Criteria (if present)
  - Priority (CRITICAL, HIGH, MEDIUM, LOW)
  - Order index

### Approvals (if present)
- **Approval Request Status**: PENDING, APPROVED, REJECTED
- **Recipients**: All approval recipients
  - Name
  - Email
  - Party (DEV/CLIENT)
  - Status (PENDING, SIGNED, DECLINED)
- **Signatures** (if signed):
  - Signed At: ISO 8601 timestamp
  - Typed Name: Signer's name
  - Title: Signer's title (if provided)
  - Snapshot Hash: First 16 characters (for verification)
  - Signature Hash: First 16 characters (for verification)
  - IP Address: Signer's IP
  - User-Agent: Signer's browser

### Export Metadata
- **Generated**: ISO 8601 timestamp
- **Proposal ID**: UUID
- **Notice**: "This export is an artifact only and does not mutate data"

---

## Libraries Used

### PDFKit
- **Version**: ^0.17.2
- **Purpose**: PDF generation
- **Features Used**:
  - Font styling (Helvetica-Bold, Helvetica, Helvetica-Oblique)
  - Font sizes (9-24pt)
  - Text alignment
  - Page breaks
  - Margins

### docx
- **Version**: ^9.5.1
- **Purpose**: DOCX generation
- **Features Used**:
  - Document sections
  - Heading levels (H1, H2, H3)
  - Paragraphs
  - Text runs (bold, italics)
  - Alignment

### ExcelJS
- **Version**: ^4.4.0
- **Purpose**: XLSX generation
- **Features Used**:
  - Workbook creation
  - Multiple worksheets
  - Row/column data
  - Buffer export

---

## Example Exports

### PDF Structure
```
┌─────────────────────────────────────┐
│   Scope Agreement Proposal          │ (centered, 24pt)
├─────────────────────────────────────┤
│ Version Information                 │ (16pt bold)
│ Proposed Version: 1.1               │
│ Base Version: 1.0                   │
│ Status: AWAITING_APPROVAL           │
│ Requested by: DEV                   │
│                                     │
│ Proposal Details                    │ (16pt bold)
│ Title: Add User Registration        │
│ Change Note: New feature...         │
│ ...                                 │
│                                     │
│ Change Summary                      │ (16pt bold)
│ Total Changes: 5                    │
│ ...                                 │
│                                     │
│ Proposed Scope                      │ (16pt bold)
│                                     │
│ Features                            │ (14pt bold)
│ • User Login                        │ (11pt bold)
│   Email and password authentication │ (10pt)
│   Acceptance: ...                   │ (9pt italic)
│   Priority: HIGH                    │ (9pt)
│                                     │
├─────────────────────────────────────┤
│              PAGE 2                 │
├─────────────────────────────────────┤
│ Approvals                           │ (16pt bold)
│ Status: PENDING                     │
│                                     │
│ John Doe (john@dev.com) (DEV)      │
│   Status: SIGNED                    │
│   Signed: 2024-01-01T00:00:00Z     │
│   Typed Name: John Doe              │
│   Snapshot Hash: a3f8b9c2...        │
│   Signature Hash: b4c9d0e1...       │
│ ...                                 │
├─────────────────────────────────────┤
│              PAGE 3                 │
├─────────────────────────────────────┤
│ Export Metadata                     │ (centered, 10pt italic)
│ Generated: 2024-01-01T12:00:00Z     │
│ Proposal ID: proposal-uuid          │
│ This export is an artifact only...  │
└─────────────────────────────────────┘
```

### XLSX Structure
```
Sheet 1: Metadata
┌────────────────────┬─────────────────────┐
│ Scope Agreement... │                     │
│                    │                     │
│ Proposed Version   │ 1.1                 │
│ Base Version       │ 1.0                 │
│ Status             │ AWAITING_APPROVAL   │
│ Title              │ Add User Reg...     │
│ ...                │ ...                 │
│                    │                     │
│ Generated          │ 2024-01-01T...      │
│ Proposal ID        │ proposal-uuid       │
└────────────────────┴─────────────────────┘

Sheet 2: Change Summary
┌────────────────────┬───────┐
│ Metric             │ Count │
├────────────────────┼───────┤
│ Total Changes      │ 5     │
│ Sections Added     │ 1     │
│ ...                │ ...   │
└────────────────────┴───────┘

Sheet 3: Scope Items
┌─────────┬────────────┬─────────────┬───────────────┬──────────┬───────┐
│ Section │ Item Title │ Description │ Acceptance... │ Priority │ Order │
├─────────┼────────────┼─────────────┼───────────────┼──────────┼───────┤
│ Features│ User Login │ Email and...│ User can...   │ HIGH     │ 0     │
│ ...     │ ...        │ ...         │ ...           │ ...      │ ...   │
└─────────┴────────────┴─────────────┴───────────────┴──────────┴───────┘

Sheet 4: Approvals
┌──────────┬───────────────┬───────┬────────┬──────────────┬────────────┬──────────────┐
│ Name     │ Email         │ Party │ Status │ Signed At    │ Typed Name │ Snapshot Hash│
├──────────┼───────────────┼───────┼────────┼──────────────┼────────────┼──────────────┤
│ John Doe │ john@dev.com  │ DEV   │ SIGNED │ 2024-01-01...│ John Doe   │ a3f8b9c2...  │
│ ...      │ ...           │ ...   │ ...    │ ...          │ ...        │ ...          │
└──────────┴───────────────┴───────┴────────┴──────────────┴────────────┴──────────────┘
```

---

## Critical Constraints Enforced

### ✅ Read-Only Operations
- All export functions use SELECT queries only
- No INSERT, UPDATE, DELETE operations
- No prisma mutations
- Database state unchanged after export

### ✅ Canonical Data Only
- Uses data from database as-is
- Includes canonical snapshots from signatures
- No data transformation beyond formatting
- Snapshot hashes included for verification

### ✅ Generation Timestamp
- Every export includes generation timestamp
- ISO 8601 format
- Proves export is a point-in-time artifact

### ✅ No Data Mutation
- Export process cannot modify proposal
- Export process cannot modify approvals
- Export process cannot modify signatures
- Completely side-effect free

---

## Download Flow

**User Action:**
1. User clicks "PDF" button on proposal page
2. `ExportButtons` component calls API

**API Processing:**
3. GET `/api/proposals/{id}/export/pdf`
4. Calls `generateProposalPDF(proposalId)`
5. Fetches data via `getProposalExportData()`
6. Generates PDF buffer with PDFKit
7. Returns buffer with proper headers

**Browser Download:**
8. Browser receives PDF buffer
9. Content-Disposition triggers download
10. File saved as `proposal-{id}.pdf`
11. User can open in PDF viewer

**Same flow for DOCX and XLSX**

---

## Integration Points

**Proposal Page:**
```tsx
// Add export buttons to proposal header
<div className="flex justify-between">
  <h1>{proposal.title}</h1>
  <ExportButtons proposalId={proposal.id} />
</div>
```

**Portal Page:**
```tsx
// Clients can export proposals they're reviewing
<ExportButtons proposalId={proposalId} />
```

**Audit Log:**
- Could log export events if desired
- Not currently implemented (exports are read-only artifacts)

---

## Next Steps

Prompt 13 is **COMPLETE**. Exports can be used for:

- Sharing proposals with stakeholders
- Offline review
- Archival/compliance
- Analysis in Excel
- Printing/distribution
- Legal record-keeping

---

## Testing Checklist

### PDF Export:
- [ ] Export generates without errors
- [ ] PDF opens in viewer
- [ ] All sections present (version, details, scope, approvals)
- [ ] Diff summary included (if available)
- [ ] Approval signatures included (if present)
- [ ] Snapshot hashes displayed correctly
- [ ] Export metadata footer present
- [ ] Formatting is professional

### DOCX Export:
- [ ] Export generates without errors
- [ ] DOCX opens in Word/LibreOffice
- [ ] Headings formatted correctly
- [ ] All content present
- [ ] Can edit document (if needed)
- [ ] Export metadata included

### XLSX Export:
- [ ] Export generates without errors
- [ ] XLSX opens in Excel/Sheets
- [ ] All 4 sheets present (Metadata, Change Summary, Scope Items, Approvals)
- [ ] Data formatted correctly in tables
- [ ] Can sort/filter data
- [ ] Can perform calculations

### General:
- [ ] No database mutations during export
- [ ] Generation timestamp accurate
- [ ] Filename includes proposal ID
- [ ] Download works in multiple browsers
- [ ] Large proposals export successfully
- [ ] v1.0 proposals export (even without diff)
- [ ] Unsigned proposals export (approval section empty)
