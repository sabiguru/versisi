# RBAC Quick Reference

## Import

```typescript
import {
  requireProjectMember,
  requireDevLeader,
  requireClientLeader,
  requireWorkspaceAdmin,
  enforceProjectLeadersBeforeApproval,
  PermissionError,
} from "@/lib/rbac";
```

## Common Patterns

### Server Action Template

```typescript
"use server";

async function myAction(projectId: string, data: any) {
  // 1. Get user
  const userId = await requireUserId();

  // 2. Check permission
  await requireDevLeader(projectId, userId);

  // 3. Perform action
  return prisma.project.update({ ... });
}
```

### Conditional UI

```typescript
const userId = await requireUserId();
const canEdit = await isDevLeader(projectId, userId);

{canEdit && <EditButton />}
```

### Before Approval

```typescript
// Validate project has required leaders
await enforceProjectLeadersBeforeApproval(projectId);
```

## Quick Decision Tree

**Who can do what?**

| Action | Required Permission |
|--------|-------------------|
| Update project settings | `requireDevLeader` |
| Send approval request | `requireDevLeader` + `enforceProjectLeadersBeforeApproval` |
| Sign approval (internal) | `requireDevLeader` |
| Sign approval (client) | `requireClientLeader` |
| Create proposal | `requireDevLeader` (typically) |
| Add workspace member | `requireWorkspaceAdmin` |
| View project | `requireProjectMember` |
| Comment on scope | `requireProjectMember` |

## Error Handling

```typescript
try {
  await requireDevLeader(projectId, userId);
} catch (error) {
  if (error instanceof PermissionError) {
    return { error: "Permission denied" };
  }
  throw error;
}
```

## Remember

✅ ALWAYS check permissions explicitly
✅ NEVER infer roles from user properties
✅ ALWAYS validate party + role together
✅ ALWAYS enforce leader requirements before approval
