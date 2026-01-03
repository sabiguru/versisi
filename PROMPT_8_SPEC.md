# Prompt 8 - Proposal Editor Specification

## Overview

The Proposal editor is the **ONLY** way to change scope. All edits are structured operations on an editable proposal copy. Base scope is READ-ONLY.

## Core Principles (STRICT)

1. **Proposals are the only way to change scope**
2. **Base scope is read-only** (displayed for reference only)
3. **Structured operations only** (no freeform editing)
4. **Required metadata** before submission
5. **Diff persisted** on submit
6. **Locked after approval sent** (no further edits)

## Required Features

### 1. Editable Proposal (NOT Base Scope)

**What Users Edit:**
- ProposalSections (copy of base sections)
- ProposalItems (copy of base items)
- New sections/items can be added
- Existing sections/items can be modified/removed

**What Users CANNOT Edit:**
- ScopeVersion (base scope) - READ-ONLY
- Approved versions - IMMUTABLE

### 2. Structured Operations

**Section Operations:**
- `addProposalSection(proposalId, title)` - Add new section
- `renameProposalSection(sectionId, title)` - Rename section
- `reorderProposalSections(proposalId, order[])` - Change order
- `removeProposalSection(sectionId)` - Delete section

**Item Operations:**
- `addProposalItem(sectionId, itemData)` - Add new item
- `updateProposalItem(itemId, itemData)` - Modify item
- `moveProposalItem(itemId, toSectionId, newIndex)` - Move item
- `removeProposalItem(itemId)` - Delete item

**Item Fields:**
```typescript
interface ProposalItemData {
  title: string;
  description: string;
  acceptanceCriteria?: string;
  priority: "MUST" | "SHOULD" | "COULD";
}
```

### 3. Required Metadata Fields

**Before Submit:**
```typescript
interface ProposalMetadata {
  changeNote: string;        // Short summary (required)
  rationale: string;         // Why this change (required)
  impactTimeline: "NONE" | "MINOR" | "MAJOR";  // Timeline impact
  impactCost: "NONE" | "MINOR" | "MAJOR";      // Cost impact
  risk: "LOW" | "MED" | "HIGH";                // Risk level
}
```

**Validation:**
- All fields required before approval request
- Cannot submit without metadata
- Displayed prominently in UI

### 4. Diff Computation & Persistence

**Compute Diff:**
```typescript
interface ProposalDiffEntry {
  type: "ADD" | "REMOVE" | "MODIFY" | "MOVE";
  entityType: "SECTION" | "ITEM";
  sourceId?: string;         // Source scope item ID
  targetId?: string;         // Proposal item ID
  summary: string;           // Human-readable summary
  fieldChanges?: {           // For MODIFY type
    field: string;
    from: string;
    to: string;
  }[];
}
```

**Persist on Submit:**
```typescript
await prisma.changeProposal.update({
  where: { id: proposalId },
  data: {
    diffSummaryJson: computedDiff,
    submittedAt: new Date(),
    status: "AWAITING_APPROVAL",
  },
});
```

**Never Recompute:**
- Diff computed once on submit
- Persisted as JSON
- Never recalculated at render time
- Ensures stable diff even if algo changes

### 5. Locking After Approval Sent

**Lock Conditions:**
```typescript
const isLocked =
  proposal.status === "AWAITING_APPROVAL" ||
  proposal.status === "APPROVED" ||
  proposal.status === "REJECTED";
```

**When Locked:**
- No add/remove/modify/move operations allowed
- Metadata cannot be changed
- Only view mode
- Show "locked" indicator in UI

**Enforcement:**
```typescript
async function enforceProposalEditable(proposalId: string) {
  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new NotFoundError("Proposal not found");
  }

  if (proposal.status !== "DRAFT" && proposal.status !== "INTERNAL_REVIEW") {
    throw new Error("Proposal is locked - approval already sent");
  }
}
```

## UI Components Required

### 1. Proposal Editor Page

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Proposal Header                                     │
│ - Title, Status, Version                            │
│ - Metadata form (changeNote, rationale, impact)     │
├─────────────────────────────────────────────────────┤
│ Split View:                                         │
│                                                     │
│ ┌──────────────┬──────────────┐                    │
│ │  Base Scope  │   Proposal   │                    │
│ │  (read-only) │   (editable) │                    │
│ │              │              │                    │
│ │  v1.0        │   v1.1       │                    │
│ │  sections    │   sections   │                    │
│ │  items       │   +edit      │                    │
│ └──────────────┴──────────────┘                    │
├─────────────────────────────────────────────────────┤
│ Diff Panel (auto-computed)                          │
│ - Added: 3 items                                    │
│ - Removed: 1 item                                   │
│ - Modified: 2 items                                 │
└─────────────────────────────────────────────────────┘
```

### 2. Section Editor Component

**Features:**
- Add section button
- Section title inline edit
- Drag-to-reorder
- Delete section button
- Item list per section

### 3. Item Editor Component

**Features:**
- Add item button
- Item form (title, description, acceptance, priority)
- Move item (drag or dropdown)
- Delete item button
- Inline editing

### 4. Metadata Form

**Fields:**
- Change Note (textarea, required)
- Rationale (textarea, required)
- Impact Timeline (select: NONE/MINOR/MAJOR)
- Impact Cost (select: NONE/MINOR/MAJOR)
- Risk (select: LOW/MED/HIGH)

### 5. Diff Viewer

**Shows:**
- Summary stats (X added, Y removed, Z modified)
- Detailed changes per section
- Color coding:
  - Green = added
  - Red = removed
  - Yellow = modified
  - Blue = moved

## Server Actions Required

### Metadata
```typescript
updateProposalMetadata(proposalId, metadata);
```

### Section Operations
```typescript
addProposalSection(proposalId, title);
renameProposalSection(sectionId, title);
reorderProposalSections(proposalId, order[]);
removeProposalSection(sectionId);
```

### Item Operations
```typescript
addProposalItem(sectionId, itemData);
updateProposalItem(itemId, itemData);
moveProposalItem(itemId, toSectionId, newIndex);
removeProposalItem(itemId);
```

### Diff & Submit
```typescript
computeProposalDiff(proposalId);
submitProposal(proposalId); // Computes diff, locks, changes status
```

### Initialize Proposal
```typescript
createProposalFromVersion(projectId, baseVersionId);
```

## Diff Computation Algorithm

### Step 1: Map Base to Proposal

**Using Source IDs:**
```typescript
// ProposalItem.sourceScopeItemId links to ScopeItem.id
// If sourceScopeItemId is null → NEW item
// If base item not in proposal → REMOVED item
```

### Step 2: Detect Changes

**For Each Item:**
- No sourceScopeItemId → **ADD**
- Has sourceScopeItemId → compare fields:
  - Title changed → **MODIFY** (field: title)
  - Description changed → **MODIFY** (field: description)
  - Section changed → **MOVE**
  - Order changed → **MOVE**

**For Each Base Item:**
- Not in proposal → **REMOVE**

### Step 3: Create Diff Entries

```typescript
const diffEntries: ProposalDiffEntry[] = [];

// Added items
proposalItems
  .filter(item => !item.sourceScopeItemId)
  .forEach(item => {
    diffEntries.push({
      type: "ADD",
      entityType: "ITEM",
      targetId: item.id,
      summary: `Added "${item.title}"`,
    });
  });

// Modified items
proposalItems
  .filter(item => item.sourceScopeItemId)
  .forEach(proposalItem => {
    const baseItem = baseItems.find(b => b.id === proposalItem.sourceScopeItemId);

    if (baseItem.title !== proposalItem.title) {
      diffEntries.push({
        type: "MODIFY",
        entityType: "ITEM",
        sourceId: baseItem.id,
        targetId: proposalItem.id,
        summary: `Modified "${baseItem.title}"`,
        fieldChanges: [{
          field: "title",
          from: baseItem.title,
          to: proposalItem.title,
        }],
      });
    }
  });

// Removed items
baseItems
  .filter(baseItem => !proposalItems.some(p => p.sourceScopeItemId === baseItem.id))
  .forEach(baseItem => {
    diffEntries.push({
      type: "REMOVE",
      entityType: "ITEM",
      sourceId: baseItem.id,
      summary: `Removed "${baseItem.title}"`,
    });
  });
```

### Step 4: Persist

```typescript
await prisma.changeProposal.update({
  where: { id: proposalId },
  data: {
    diffSummaryJson: {
      stats: {
        added: diffEntries.filter(d => d.type === "ADD").length,
        removed: diffEntries.filter(d => d.type === "REMOVE").length,
        modified: diffEntries.filter(d => d.type === "MODIFY").length,
      },
      changes: diffEntries,
    },
  },
});
```

## Workflow

### 1. Create Proposal
```
User: Click "Create Proposal"
  ↓
System: Copy current ScopeVersion → Proposal
  ↓
Proposal: Status = DRAFT, editable
```

### 2. Edit Proposal
```
User: Add/remove/modify sections/items
  ↓
System: Update ProposalSections/ProposalItems
  ↓
UI: Show live diff
```

### 3. Fill Metadata
```
User: Enter changeNote, rationale, impact, risk
  ↓
System: Update ChangeProposal metadata
```

### 4. Submit for Approval
```
User: Click "Submit for Approval"
  ↓
System: Validate metadata (all required)
  ↓
System: Compute diff → persist to diffSummaryJson
  ↓
System: Status → AWAITING_APPROVAL
  ↓
System: Lock proposal (no further edits)
  ↓
System: Create ApprovalRequest
  ↓
System: Send emails to leaders
```

### 5. After Approval
```
All Leaders Sign
  ↓
System: Proposal → ScopeVersion (immutable)
  ↓
System: Project.currentScopeVersionId → new version
  ↓
System: Proposal status → APPROVED
```

## Anti-Patterns (DO NOT DO)

### ❌ Inline Editing on Approved Versions
```typescript
// BAD - Editing approved version directly
await prisma.scopeItem.update({
  where: { id: itemId },
  data: { title: newTitle },
});
```

### ❌ Freeform Doc Editing
```typescript
// BAD - Rich text editor on full document
<RichTextEditor content={proposal.fullDocument} />
```

### ✅ Correct Pattern
```typescript
// GOOD - Structured operation on proposal
await addProposalItem(sectionId, {
  title: "New Feature",
  description: "Description here",
  priority: "MUST",
});
```

## Validation Rules

**Before Submit:**
1. Metadata complete (changeNote, rationale, impact, risk)
2. At least one change made (diff not empty)
3. All items have required fields
4. User has permission (DEV leader typically)

**Before Edit:**
1. Proposal must be DRAFT or INTERNAL_REVIEW
2. User must be project member
3. Proposal not locked

## Files to Create

**Server Actions:**
- `app/app/projects/[projectId]/proposals/[proposalId]/actions.ts`

**Components:**
- `components/proposal/proposal-editor.tsx`
- `components/proposal/section-editor.tsx`
- `components/proposal/item-editor.tsx`
- `components/proposal/metadata-form.tsx`
- `components/proposal/diff-viewer.tsx`

**Utilities:**
- `lib/diff-computation.ts`
- `lib/proposal-operations.ts`

**Updated Page:**
- `app/app/projects/[projectId]/proposals/[proposalId]/page.tsx`

## Status States

```typescript
enum ProposalStatus {
  DRAFT              // Editable
  INTERNAL_REVIEW    // Editable (optional)
  AWAITING_APPROVAL  // Locked
  APPROVED           // Locked, became ScopeVersion
  REJECTED           // Locked
  WITHDRAWN          // Locked
}
```

## Summary

Prompt 8 creates a structured proposal editor where:
- ✅ All scope changes go through proposals
- ✅ Base scope is read-only
- ✅ Only structured operations allowed
- ✅ Metadata required before submit
- ✅ Diff computed and persisted once
- ✅ Locked after approval sent
- ❌ No inline edits on approved versions
- ❌ No freeform document editing

This is the **ONLY** way to change scope in the system.
