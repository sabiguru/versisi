/**
 * RBAC Usage Examples
 *
 * This file contains examples of how to use the RBAC system.
 * DO NOT import this file - it's for documentation only.
 */

import { requireProjectMember, requireDevLeader, requireClientLeader, requireWorkspaceAdmin } from "@/lib/rbac";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// ============================================================================
// EXAMPLE 1: Protecting a Server Action
// ============================================================================

/**
 * Example: Update project settings
 * Only DEV leaders can update project settings
 */
async function updateProjectSettings(
  projectId: string,
  settings: { name?: string; description?: string }
) {
  "use server";

  // 1. Get current user
  const userId = await requireUserId();

  // 2. Enforce permission - MUST be DEV leader
  await requireDevLeader(projectId, userId);

  // 3. Perform action
  // ... update logic here
}

// ============================================================================
// EXAMPLE 2: Checking Permissions Without Throwing
// ============================================================================

/**
 * Example: Show/hide UI based on permissions
 */
async function getProjectPageData(projectId: string) {
  "use server";

  const userId = await requireUserId();

  // Check permissions without throwing
  const { isDevLeader, isProjectLeader } = await import("@/lib/rbac");

  const canEditSettings = await isDevLeader(projectId, userId);
  const canApprove = await isProjectLeader(projectId, userId);

  return {
    canEditSettings,
    canApprove,
    // ... other data
  };
}

// ============================================================================
// EXAMPLE 3: Validating Project Before Approval
// ============================================================================

/**
 * Example: Send approval request
 * Must validate project has required leaders first
 */
async function sendApprovalRequest(projectId: string, proposalId: string) {
  "use server";

  const userId = await requireUserId();

  // 1. Must be DEV leader to send approval
  await requireDevLeader(projectId, userId);

  // 2. Validate project has required leaders
  const { enforceProjectLeadersBeforeApproval } = await import("@/lib/rbac");
  await enforceProjectLeadersBeforeApproval(projectId);
  // Throws if project doesn't have ≥1 DEV leader AND ≥1 CLIENT leader

  // 3. Send approval
  // ... send logic here
}

// ============================================================================
// EXAMPLE 4: Workspace Management
// ============================================================================

/**
 * Example: Add member to workspace
 * Only workspace admins can add members
 */
async function addWorkspaceMember(
  workspaceId: string,
  newMemberEmail: string,
  role: "ADMIN" | "MEMBER"
) {
  "use server";

  const userId = await requireUserId();

  // Enforce: Must be workspace admin
  await requireWorkspaceAdmin(workspaceId, userId);

  // Add member logic...
}

// ============================================================================
// EXAMPLE 5: Client User Permissions
// ============================================================================

/**
 * Example: Sign approval (client side)
 * Client users use different permission checks
 */
async function signApprovalAsClient(
  approvalRequestId: string,
  clientUserId: string,
  signature: { typedName: string; title?: string }
) {
  "use server";

  // Get approval request
  const { prisma } = await import("@/lib/prisma");
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: { project: true },
  });

  if (!approvalRequest) {
    throw new Error("Approval request not found");
  }

  // Enforce: Client user must be a CLIENT leader
  await requireClientLeader(approvalRequest.projectId, clientUserId);

  // Sign logic...
}

// ============================================================================
// EXAMPLE 6: Conditional Actions Based on Party
// ============================================================================

/**
 * Example: Different actions for DEV vs CLIENT party
 */
async function createProposal(projectId: string, data: any) {
  "use server";

  const userId = await requireUserId();

  // Require project membership
  const membership = await requireProjectMember(projectId, userId);

  // Different logic based on party
  if (membership.party === "DEV") {
    // DEV party can create proposals freely
    // ... create logic
  } else if (membership.party === "CLIENT") {
    // CLIENT party might have restrictions
    throw new Error("Client users cannot create proposals directly");
  }
}

// ============================================================================
// EXAMPLE 7: Approval Rules Validation
// ============================================================================

/**
 * Example: Update project approval rules
 * Validate rules are achievable with current leaders
 */
async function updateApprovalRules(
  projectId: string,
  rules: {
    client: { required: number; mode: "ANY" | "ALL" };
    dev: { required: number; mode: "ANY" | "ALL" };
  }
) {
  "use server";

  const userId = await requireUserId();

  // Must be DEV leader
  await requireDevLeader(projectId, userId);

  // Validate new rules are achievable
  const { validateApprovalRules } = await import("@/lib/rbac");
  await validateApprovalRules(projectId, rules);
  // Throws if project doesn't have enough leaders to satisfy rules

  // Update rules...
}

// ============================================================================
// EXAMPLE 8: Error Handling
// ============================================================================

/**
 * Example: Proper error handling for permissions
 */
async function handlePermissionErrors(projectId: string, userId: string) {
  "use server";

  const { PermissionError, requireDevLeader } = await import("@/lib/rbac");

  try {
    await requireDevLeader(projectId, userId);
    // ... perform action
  } catch (error) {
    if (error instanceof PermissionError) {
      // User doesn't have permission
      return { error: "You must be a DEV leader to perform this action" };
    }
    throw error; // Re-throw other errors
  }
}

// ============================================================================
// ANTI-PATTERNS (DO NOT DO THIS)
// ============================================================================

// ❌ BAD: Implicit permission check
async function badExample1(projectId: string) {
  const userId = await requireUserId();
  // Missing explicit permission check!
  // ... perform action
}

// ❌ BAD: Role inference
async function badExample2(projectId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Don't infer permissions from user properties!
  // if (user?.email.includes("admin")) { ... }
}

// ❌ BAD: Checking role without party
async function badExample3(projectId: string, userId: string) {
  const membership = await requireProjectMember(projectId, userId);
  // Don't assume LEADER means DEV leader!
  // if (membership.role === "LEADER") { ... }
  // MUST check: membership.party === "DEV" && membership.role === "LEADER"
}

// ✅ GOOD: Explicit permission check
async function goodExample(projectId: string) {
  const userId = await requireUserId();
  await requireDevLeader(projectId, userId); // Explicit!
  // ... perform action
}
