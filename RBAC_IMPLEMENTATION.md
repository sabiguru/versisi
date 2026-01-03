# RBAC Implementation - Prompt 5 Complete

## Overview

Explicit role-based access control with **zero implicit permissions** and **zero role inference**. Every permission check is explicit and enforced.

## Key Principles (ENFORCED)

1. **NO implicit permissions** - Every action requires explicit permission check
2. **NO role inference** - Roles are checked explicitly from database
3. **Explicit party checks** - DEV vs CLIENT party is always verified
4. **Guard pattern** - All server actions start with permission guards

## Required Helpers (ALL IMPLEMENTED)

✅ **Core Permission Helpers:**
- `requireProjectMember(projectId, userId)` - Throws if not a member
- `requireDevLeader(projectId, userId)` - Throws if not DEV leader
- `requireClientLeader(projectId, clientUserId)` - Throws if not CLIENT leader
- `requireWorkspaceAdmin(workspaceId, userId)` - Throws if not admin

✅ **Additional Helpers:**
- `requireWorkspaceOwner(workspaceId, userId)` - Throws if not owner
- `getProjectMembership(projectId, userId)` - Returns membership or null
- `getWorkspaceMembership(workspaceId, userId)` - Returns membership or null

## Project Leader Rules (ENFORCED)

### Minimum Requirements

**Rule 1:** Project MUST have ≥1 DEV leader before approval
**Rule 2:** Project MUST have ≥1 CLIENT leader before approval

Enforced via:
```typescript
await enforceProjectLeadersBeforeApproval(projectId);
// Throws PermissionError if requirements not met
```

### Validation Functions

```typescript
// Check if project has required leaders
await validateProjectLeaders(projectId);

// Get leaders by party
const devLeaders = await getDevLeaders(projectId);
const clientLeaders = await getClientLeaders(projectId);

// Check leader existence
const hasDevLeader = await hasDevLeader(projectId);
const hasClientLeader = await hasClientLeader(projectId);
```

## Default Approval Requirements

**DEV side:** 1 leader signature required (mode: ANY)
**CLIENT side:** 1 leader signature required (mode: ANY)

```typescript
const defaultRules = getDefaultApprovalRules();
// {
//   client: { required: 1, mode: "ANY" },
//   dev: { required: 1, mode: "ANY" }
// }
```

## Permission Checking Patterns

### Pattern 1: Require Permission (Throws)

```typescript
async function updateProject(projectId: string) {
  const userId = await requireUserId();

  // Throws PermissionError if not DEV leader
  await requireDevLeader(projectId, userId);

  // Perform action
}
```

### Pattern 2: Check Permission (Boolean)

```typescript
async function getProjectData(projectId: string) {
  const userId = await requireUserId();

  // Check without throwing
  const canEdit = await isDevLeader(projectId, userId);
  const canApprove = await isProjectLeader(projectId, userId);

  return { canEdit, canApprove };
}
```

### Pattern 3: Guard Functions

```typescript
async function dangerousAction(projectId: string) {
  const userId = await requireUserId();

  // Guard at the top of server action
  await guardDevLeader(projectId, userId);

  // Rest of logic
}
```

## Role Hierarchy

### Workspace Roles
- `OWNER` - Full control (admin + billing)
- `ADMIN` - Can manage members and projects
- `MEMBER` - Can be added to projects

```typescript
// Check if user is admin (OWNER or ADMIN)
await isWorkspaceAdmin(workspaceId, userId); // Returns boolean
await requireWorkspaceAdmin(workspaceId, userId); // Throws if not
```

### Project Roles (per party)
- `LEADER` - Can approve, invite their party members
- `MEMBER` - Can comment, view, propose changes (config dependent)
- `VIEWER` - Read-only access

```typescript
// MUST check both party AND role
const membership = await requireProjectMember(projectId, userId);

if (membership.party === "DEV" && membership.role === "LEADER") {
  // User is DEV leader
}
```

## Party System

Every project member belongs to exactly ONE party:
- `DEV` - Developer/agency/builder side
- `CLIENT` - Client/stakeholder/buyer side

```typescript
// Check party membership
await isDevMember(projectId, userId);
await isClientMember(projectId, userId);

// DEV leader check (party + role)
await isDevLeader(projectId, userId);
await requireDevLeader(projectId, userId);

// CLIENT leader check (client users)
await isClientLeader(projectId, clientUserId);
await requireClientLeader(projectId, clientUserId);
```

## Approval Validation

### Before Sending Approval

```typescript
// 1. Check project has required leaders
await enforceProjectLeadersBeforeApproval(projectId);

// 2. Validate approval rules are achievable
const rules = {
  dev: { required: 1, mode: "ANY" },
  client: { required: 1, mode: "ANY" }
};
await validateApprovalRules(projectId, rules);
```

### Checking if Requirements Met

```typescript
const rules = {
  dev: { required: 1, mode: "ANY" },
  client: { required: 1, mode: "ANY" }
};

const isMet = await areApprovalRequirementsMet(approvalRequestId, rules);
// Returns true if enough signatures collected
```

## Permission Errors

```typescript
import { PermissionError, NotFoundError } from "@/lib/rbac";

try {
  await requireDevLeader(projectId, userId);
} catch (error) {
  if (error instanceof PermissionError) {
    // User doesn't have permission
    return { error: "Insufficient permissions" };
  }
  throw error;
}
```

## Usage in Server Actions

### Example 1: Project Settings Update

```typescript
"use server";

async function updateProjectSettings(projectId: string, data: any) {
  const userId = await requireUserId();

  // EXPLICIT permission check
  await requireDevLeader(projectId, userId);

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}
```

### Example 2: Send Approval Request

```typescript
"use server";

async function sendApproval(projectId: string, proposalId: string) {
  const userId = await requireUserId();

  // 1. Must be DEV leader
  await requireDevLeader(projectId, userId);

  // 2. Validate project has required leaders
  await enforceProjectLeadersBeforeApproval(projectId);

  // 3. Send approval
  // ...
}
```

### Example 3: Workspace Member Management

```typescript
"use server";

async function addWorkspaceMember(workspaceId: string, email: string) {
  const userId = await requireUserId();

  // Must be workspace admin
  await requireWorkspaceAdmin(workspaceId, userId);

  // Add member logic
}
```

## Client User Permissions

Client users use separate permission checks:

```typescript
// For client users (not internal User table)
await requireClientLeader(projectId, clientUserId);

// Check client membership
const membership = await getClientProjectMembership(projectId, clientUserId);

// Client leader check
const isLeader = await isClientLeader(projectId, clientUserId);
```

## Complete Function Reference

### Membership Checks
- `getProjectMembership(projectId, userId)` → Membership | null
- `getClientProjectMembership(projectId, clientUserId)` → Membership | null
- `isProjectMember(projectId, userId)` → boolean
- `requireProjectMember(projectId, userId)` → Membership (throws)

### Role Checks
- `hasProjectRole(projectId, userId, role)` → boolean
- `isProjectLeader(projectId, userId)` → boolean
- `isDevMember(projectId, userId)` → boolean
- `isClientMember(projectId, userId)` → boolean
- `isDevLeader(projectId, userId)` → boolean
- `isClientLeader(projectId, clientUserId)` → boolean
- `requireDevLeader(projectId, userId)` → Membership (throws)
- `requireClientLeader(projectId, clientUserId)` → Membership (throws)

### Workspace Checks
- `getWorkspaceMembership(workspaceId, userId)` → Membership | null
- `isWorkspaceMember(workspaceId, userId)` → boolean
- `hasWorkspaceRole(workspaceId, userId, role)` → boolean
- `isWorkspaceAdmin(workspaceId, userId)` → boolean
- `requireWorkspaceAdmin(workspaceId, userId)` → Membership (throws)
- `requireWorkspaceOwner(workspaceId, userId)` → Membership (throws)

### Project Leader Validation
- `getDevLeaders(projectId)` → Membership[]
- `getClientLeaders(projectId)` → Membership[]
- `hasDevLeader(projectId)` → boolean
- `hasClientLeader(projectId)` → boolean
- `validateProjectLeaders(projectId)` → void (throws)
- `enforceProjectLeadersBeforeApproval(projectId)` → void (throws)

### Approval Validation
- `getDefaultApprovalRules()` → ApprovalRules
- `validateApprovalRules(projectId, rules)` → void (throws)
- `areApprovalRequirementsMet(approvalRequestId, rules)` → boolean

### Guard Functions
- `guardProjectMember(projectId, userId)` → void (throws)
- `guardDevLeader(projectId, userId)` → void (throws)
- `guardWorkspaceAdmin(workspaceId, userId)` → void (throws)

## Anti-Patterns (DO NOT DO)

### ❌ Implicit Permissions
```typescript
// BAD - No permission check
async function updateProject(projectId: string) {
  const userId = await requireUserId();
  // Missing permission check!
  return prisma.project.update(...);
}
```

### ❌ Role Inference
```typescript
// BAD - Inferring from user properties
const user = await prisma.user.findUnique({ where: { id: userId } });
if (user.email.includes("admin")) {
  // Don't infer roles!
}
```

### ❌ Incomplete Party Check
```typescript
// BAD - Checking role without party
const membership = await getProjectMembership(projectId, userId);
if (membership.role === "LEADER") {
  // Which party? DEV or CLIENT?
}

// GOOD - Explicit party + role check
if (membership.party === "DEV" && membership.role === "LEADER") {
  // Clear: DEV leader
}
```

### ❌ Assuming Permissions
```typescript
// BAD - Assuming creator has permissions
if (project.createdByUserId === userId) {
  // Don't assume creator is still a member/leader!
}

// GOOD - Explicit check
await requireDevLeader(projectId, userId);
```

## Files Created

- [lib/rbac.ts](lib/rbac.ts) - Core RBAC implementation (600+ lines)
- [lib/rbac-examples.ts](lib/rbac-examples.ts) - Usage examples
- [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) - This documentation

## Testing Checklist

✅ Permission checks throw when unauthorized
✅ Permission checks pass when authorized
✅ Party checks are enforced (DEV vs CLIENT)
✅ Role checks are enforced (LEADER vs MEMBER vs VIEWER)
✅ Project leader validation enforces ≥1 DEV + ≥1 CLIENT leader
✅ Approval rules validation works correctly
✅ Client user permission checks work separately from User checks

## Prompt 5 Status: ✅ COMPLETE

All required helpers implemented:
- ✅ `requireProjectMember`
- ✅ `requireDevLeader`
- ✅ `requireClientLeader`
- ✅ `requireWorkspaceAdmin`

All rules enforced:
- ✅ Project must have ≥1 DEV leader and ≥1 CLIENT leader before approval
- ✅ Default approval requires 1 DEV + 1 CLIENT leader signature

All constraints followed:
- ✅ NO implicit permissions
- ✅ NO role inference
- ✅ All checks are EXPLICIT

Ready for **Prompt 6 - Routes** when you are!
