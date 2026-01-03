# Prompt 9 - Comments System (COMPLETE)

## Implementation Summary

The comment system has been fully implemented as **annotations only** - comments never modify scope and are anchored to specific items.

---

## Files Created

### 1. Server Actions (`lib/comments-actions.ts`)

All comment operations with RBAC enforcement and audit logging:

- **createCommentThread** - Creates new thread anchored to ProposalItem or ScopeItem
- **addCommentMessage** - Adds threaded reply
- **resolveCommentThread** - Marks thread as resolved
- **reopenCommentThread** - Reopens resolved thread
- **getCommentThreads** - Fetches threads with visibility filtering
- **getCommentCount** - Counts visible threads
- **createCommentThreadAsClient** - Special function for client users (always SHARED)

### 2. UI Components

#### `components/comments/comment-thread.tsx`
- Displays individual thread with all messages
- Expandable/collapsible UI
- Inline reply functionality
- Resolve/reopen controls (if user has permission)
- Visibility badges (SHARED/INTERNAL)
- Quoted text display
- Timestamp formatting (relative, e.g., "2 hours ago")

#### `components/comments/comment-composer.tsx`
- Form to create new comment threads
- Visibility selector (SHARED vs INTERNAL)
- Optional quoted text display
- Validation and error handling
- Disabled state during submission

#### `components/comments/comment-list.tsx`
- Lists all threads for an entity
- Filters by visibility (based on user's party)
- Show/hide resolved threads toggle
- Empty state messaging
- Loading state
- Refresh on updates

---

## Integration Points

### Proposal Page (`app/app/projects/[projectId]/proposals/[proposalId]/page.tsx`)
- Comments section added at bottom
- Full functionality: create, reply, resolve
- Internal comments allowed (visibility filtering by party)

### Version View Page (`app/app/projects/[projectId]/versions/[versionId]/page.tsx`)
- Comments section added at bottom
- New comment composer hidden if version is approved (read-only)
- Existing threads still visible and can be resolved

---

## Key Features Implemented

### ✅ Threaded Comments
- First message creates thread
- Additional messages are threaded replies
- All replies shown in chronological order

### ✅ Anchoring
- Comments anchored to:
  - ProposalItem (entityType: "PROPOSAL_ITEM")
  - ScopeItem (entityType: "SCOPE_ITEM")
- Optional field specification (TITLE, DESCRIPTION, ACCEPTANCE, GENERAL)
- Optional quoted text for highlighting context

### ✅ Visibility Controls
- **SHARED**: Visible to both DEV and CLIENT parties
- **INTERNAL**: Only visible to same party as creator
- Client users can only create SHARED comments
- Visibility filtering enforced at database query level

### ✅ Resolve/Reopen
- Project members can resolve threads
- Resolved threads shown separately (toggle to show/hide)
- Threads can be reopened if needed
- Visual indication of resolved status

### ✅ Audit Logging
All comment actions logged:
- COMMENT_CREATED
- COMMENT_REPLIED
- COMMENT_RESOLVED
- COMMENT_REOPENED

### ✅ RBAC Enforcement
- All actions require project membership
- Visibility filtering based on party
- Client users restricted to SHARED visibility

---

## Architecture Patterns

### Server Actions
All mutations via server actions (Next.js App Router pattern):
- Input validation with Zod schemas
- RBAC guards at start of every action
- Prisma transactions where needed
- Audit event creation
- Type-safe return values

### Client Components
All UI components are client components (`"use client"`):
- Form state management with React hooks
- Optimistic UI updates avoided (explicit refresh)
- Loading/submitting states
- Error handling and display

### Data Flow
1. User interacts with UI component
2. Component calls server action
3. Server action validates, checks permissions, mutates DB
4. Component refreshes data via re-fetch
5. UI updates to show new state

---

## Constraints Enforced

### ❌ Comments Never Modify Scope
- Comments are annotations only
- No mechanism to convert comment to scope change
- Comments stored in separate tables (CommentThread, CommentMessage)
- No foreign keys to scope content fields

### ❌ Comments Do Not Propagate
- Comments anchored to specific version/proposal instance
- New versions do not inherit comments from base
- Comments remain with the item they were created on

### ❌ No Implicit Permissions
- Every action checks requireProjectMember
- Visibility filtered by party membership
- No shortcuts or bypass mechanisms

---

## Dependencies Added

- **date-fns** - For timestamp formatting (`formatDistanceToNow`)

---

## Next Steps

Prompt 9 is **COMPLETE**. Ready to proceed with:

- **Prompt 10**: Approvals & Signatures (legal clarity)
- **Prompt 11**: Canonical Snapshot & Hashing
- **Prompt 12**: Canonical Diff Summary
- **Prompt 13**: Exports (PDF/DOCX/XLSX)
- **Prompt 14**: Audit Log UI
- **Prompt 15**: Testing

---

## Testing Checklist

When testing comments:

- [ ] Create comment on proposal item
- [ ] Create comment on scope item
- [ ] Verify SHARED visibility shows to both parties
- [ ] Verify INTERNAL visibility shows only to same party
- [ ] Reply to existing thread
- [ ] Resolve thread
- [ ] Reopen resolved thread
- [ ] Verify quoted text displays correctly
- [ ] Verify field anchoring displays
- [ ] Verify approved versions hide new comment composer
- [ ] Verify audit events logged correctly
- [ ] Verify client users can only create SHARED comments
