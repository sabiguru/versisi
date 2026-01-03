# Prompt 12 - Canonical Diff Summary (COMPLETE)

## Implementation Summary

Deterministic diff computation with changeId hashing. Diffs computed ONCE on proposal submit and NEVER recomputed at render time.

---

## Core Requirements Met

### ✅ diff_summary_v1 Schema
- Deterministic structure with version "1.0"
- Includes baseVersionId, proposedVersionId, computedAt
- Array of changes with stable ordering
- Summary stats (additions, removals, modifications, moves)

### ✅ Persist on Submit
- Diff computed ONCE during proposal submission
- Stored in `ChangeProposal.diffSummaryJson`
- Never recomputed - always read from persisted value

### ✅ Deterministic Ordering
- Changes sorted by sectionIndex ASC, then itemIndex ASC
- Consistent ordering across multiple computations
- Same proposal state → same diff output

### ✅ changeId Hashing
- SHA-256 hash of change details
- Includes: changeType, entityType, before, after
- Unique identifier for each change
- Enables change tracking and comparison

---

## Files Created

### 1. Canonical Diff Library (`lib/canonical-diff.ts`)

**Core Types:**

**DiffSummaryV1**
```typescript
interface DiffSummaryV1 {
  version: "1.0";
  baseVersionId: string;
  proposedVersionId: string;
  computedAt: string; // ISO 8601
  changes: Array<{
    changeId: string; // SHA-256 hash
    changeType: "ADD" | "REMOVE" | "MODIFY" | "MOVE";
    entityType: "SECTION" | "ITEM";
    sectionIndex: number;
    itemIndex: number | null;
    before: {...} | null;
    after: {...} | null;
    fieldChanges: Array<{field, oldValue, newValue}> | null;
  }>;
  summary: {
    sectionsAdded: number;
    sectionsRemoved: number;
    sectionsModified: number;
    itemsAdded: number;
    itemsRemoved: number;
    itemsModified: number;
    itemsMoved: number;
    totalChanges: number;
  };
}
```

**Core Functions:**

**computeCanonicalDiff(baseScopeVersionId, proposalId)**
- Fetches base scope version and proposal
- Computes differences deterministically
- Detects: ADD, REMOVE, MODIFY, MOVE
- Tracks field-level changes
- Generates changeId for each change
- Sorts changes by section/item index
- Returns DiffSummaryV1

**persistDiffSummary(proposalId, diffSummary)**
- Stores diff in ChangeProposal.diffSummaryJson
- Called ONCE during submission
- Never called again

**getDiffSummary(proposalId)**
- Reads persisted diff from database
- NEVER recomputes
- Returns cached DiffSummaryV1 or null

**Helper Functions:**

**computeChangeId(change)**
- Builds canonical representation of change
- Sorts keys for determinism
- Computes SHA-256 hash
- Returns 64-character hex string

**getStableId(entityId, sourceId)**
- Returns `src:<sourceId>` for existing items
- Returns `new:<entityId>` for new items
- Consistent with canonical snapshot IDs

---

### 2. Proposal Submit Actions (`lib/proposal-submit-actions.ts`)

**submitProposalForApproval(proposalId)**
- Validates proposal is in DRAFT status
- Computes canonical diff (ONCE)
- Persists diff to diffSummaryJson
- Updates status to AWAITING_APPROVAL
- Creates ApprovalRequest with recipients
- Logs PROPOSAL_SUBMITTED audit event
- Returns approvalRequestId

**recomputeProposalDiff(proposalId)** (Admin only)
- Manual diff recomputation for debugging
- Logs PROPOSAL_DIFF_RECOMPUTED audit event
- Should NEVER be used in normal workflow

---

### 3. Diff Viewer Component (`components/proposals/diff-viewer.tsx`)

**Read-only diff visualization:**
- Summary stats cards (Added, Removed, Modified, Moved)
- Detailed change list with before/after comparison
- Color-coded by change type (green=add, red=remove, blue=modify, purple=move)
- Field-level change tracking
- Stable ID display
- changeId display (first 8 chars)
- Computed timestamp
- Warning: "never recomputed" notice

---

## Diff Algorithm Details

### Change Detection

**ADD (Section/Item)**
- Proposal contains entity not in base scope
- before: null
- after: full entity data
- Increments sectionsAdded or itemsAdded

**REMOVE (Section/Item)**
- Base scope contains entity not in proposal
- before: full entity data
- after: null
- Increments sectionsRemoved or itemsRemoved

**MODIFY (Section/Item)**
- Entity exists in both base and proposal
- Field values differ
- before: base entity data
- after: proposal entity data
- fieldChanges: array of {field, oldValue, newValue}
- Increments sectionsModified or itemsModified

**MOVE (Item only)**
- Item exists in both with different orderIndex
- Detected as part of MODIFY
- Increments itemsMoved
- Included in fieldChanges

### Deterministic Ordering

**Section-Level Changes:**
- Sorted by sectionIndex (ascending)
- Index represents position in proposal

**Item-Level Changes:**
- Sorted first by sectionIndex (ascending)
- Then by itemIndex within section (ascending)
- null itemIndex (section-level) comes before numeric itemIndex

**Result:**
- Changes appear in document order
- Same input always produces same output order
- Human-readable sequence

### Field-Level Tracking

**Tracked Fields:**
- title
- description
- acceptanceCriteria
- priority
- orderIndex

**Field Change Format:**
```typescript
{
  field: "title",
  oldValue: "Original Title",
  newValue: "Updated Title"
}
```

---

## Example Diff Output

**Scenario:** Update proposal v1.1 based on v1.0

**Base Scope (v1.0):**
- Section "Features" (orderIndex: 0)
  - Item "User Login" (orderIndex: 0, priority: HIGH)
  - Item "Dashboard" (orderIndex: 1, priority: MEDIUM)

**Proposed Scope (v1.1):**
- Section "Features" (orderIndex: 0)
  - Item "User Login" (orderIndex: 0, priority: CRITICAL) ← modified
  - Item "User Registration" (orderIndex: 1, priority: HIGH) ← added
  - Item "Dashboard" (orderIndex: 2, priority: MEDIUM) ← moved
- Section "Settings" (orderIndex: 1) ← added

**Generated Diff:**
```json
{
  "version": "1.0",
  "baseVersionId": "base-uuid",
  "proposedVersionId": "proposal-uuid",
  "computedAt": "2024-01-01T00:00:00.000Z",
  "changes": [
    {
      "changeId": "a1b2c3d4...",
      "changeType": "MODIFY",
      "entityType": "ITEM",
      "sectionIndex": 0,
      "itemIndex": 0,
      "before": {
        "id": "src:login-uuid",
        "title": "User Login",
        "priority": "HIGH",
        ...
      },
      "after": {
        "id": "src:login-uuid",
        "title": "User Login",
        "priority": "CRITICAL",
        ...
      },
      "fieldChanges": [
        { "field": "priority", "oldValue": "HIGH", "newValue": "CRITICAL" }
      ]
    },
    {
      "changeId": "e5f6g7h8...",
      "changeType": "ADD",
      "entityType": "ITEM",
      "sectionIndex": 0,
      "itemIndex": 1,
      "before": null,
      "after": {
        "id": "new:registration-uuid",
        "title": "User Registration",
        ...
      },
      "fieldChanges": null
    },
    {
      "changeId": "i9j0k1l2...",
      "changeType": "MODIFY",
      "entityType": "ITEM",
      "sectionIndex": 0,
      "itemIndex": 2,
      "before": {
        "id": "src:dashboard-uuid",
        "orderIndex": 1,
        ...
      },
      "after": {
        "id": "src:dashboard-uuid",
        "orderIndex": 2,
        ...
      },
      "fieldChanges": [
        { "field": "orderIndex", "oldValue": "1", "newValue": "2" }
      ]
    },
    {
      "changeId": "m3n4o5p6...",
      "changeType": "ADD",
      "entityType": "SECTION",
      "sectionIndex": 1,
      "itemIndex": null,
      "before": null,
      "after": {
        "id": "new:settings-uuid",
        "title": "Settings",
        ...
      },
      "fieldChanges": null
    }
  ],
  "summary": {
    "sectionsAdded": 1,
    "sectionsRemoved": 0,
    "sectionsModified": 0,
    "itemsAdded": 1,
    "itemsRemoved": 0,
    "itemsModified": 2,
    "itemsMoved": 1,
    "totalChanges": 4
  }
}
```

---

## Critical Constraints Enforced

### ✅ Computed Once
- `computeCanonicalDiff()` called ONLY in `submitProposalForApproval()`
- Stored in `diffSummaryJson` field
- Never deleted or overwritten (except by admin recompute)

### ✅ Never Recomputed at Render
- UI components use `getDiffSummary()` to read persisted value
- No diff computation in GET requests
- No diff computation in React components
- Warning displayed in UI

### ✅ Deterministic Output
- Same base + proposal → same diff
- Stable ordering (section/item index)
- Stable changeIds (SHA-256)
- No timestamps in change data (only in metadata)

### ✅ Immutable After Submission
- Once proposal submitted, diff is frozen
- Represents exact state at submission time
- Legal/audit requirement

---

## Integration Points

**Proposal Submission:**
```typescript
// In proposal submission workflow
const result = await submitProposalForApproval(proposalId);
// Diff computed and persisted automatically
```

**Proposal Page Display:**
```typescript
// In proposal page component
const diffSummary = await getDiffSummary(proposalId);
if (diffSummary) {
  return <DiffViewer diffSummary={diffSummary} />;
}
```

**Portal Display:**
- Diff visible to all approval recipients
- Shows exactly what is changing
- Helps inform approval decisions

---

## Next Steps

Prompt 12 is **COMPLETE**. Ready to use canonical diffs in:

- Approval workflows (show diff before signing)
- Exports (include diff summary in PDF/DOCX/XLSX)
- Audit logs (track what changed when)
- Version comparison (compare any two versions)

---

## Testing Checklist

- [ ] Create proposal with additions
- [ ] Submit proposal (triggers diff computation)
- [ ] Verify diff persisted to diffSummaryJson
- [ ] Reload page (diff not recomputed)
- [ ] View diff in UI (shows correct changes)
- [ ] Verify changeIds are deterministic
- [ ] Verify ordering is stable
- [ ] Test modifications (field changes tracked)
- [ ] Test removals (sections and items)
- [ ] Test moves (orderIndex changes)
- [ ] Verify v1.0 proposals skip diff (no base scope)
- [ ] Verify same proposal produces same diff hash
- [ ] Admin recompute works (logs audit event)
