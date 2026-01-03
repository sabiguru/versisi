import { prisma } from "@/lib/prisma";
import { PartyType, ProjectRole, WorkspaceMemberRole } from "@prisma/client";

// ============================================================================
// RBAC - EXPLICIT PERMISSION ENFORCEMENT
// ============================================================================

// NO implicit permissions
// NO role inference
// EVERY permission check is EXPLICIT

// ============================================================================
// PERMISSION ERRORS
// ============================================================================

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// ============================================================================
// PROJECT MEMBERSHIP CHECKS
// ============================================================================

/**
 * Get project membership for a user
 * Returns null if not a member
 */
export async function getProjectMembership(
  projectId: string,
  userId: string
) {
  return await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
    },
    include: {
      project: true,
      user: true,
    },
  });
}

/**
 * Get project membership for a client user
 * Returns null if not a member
 */
export async function getClientProjectMembership(
  projectId: string,
  clientUserId: string
) {
  return await prisma.projectMembership.findFirst({
    where: {
      projectId,
      clientUserId,
    },
    include: {
      project: true,
      clientUser: true,
    },
  });
}

/**
 * Check if user is a member of the project
 * Does NOT throw, returns boolean
 */
export async function isProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return !!membership;
}

/**
 * Require that user is a member of the project
 * Throws PermissionError if not a member
 */
export async function requireProjectMember(projectId: string, userId: string) {
  const membership = await getProjectMembership(projectId, userId);

  if (!membership) {
    throw new PermissionError(
      `User ${userId} is not a member of project ${projectId}`
    );
  }

  return membership;
}

// ============================================================================
// PROJECT ROLE CHECKS
// ============================================================================

/**
 * Check if user has a specific role in a project
 */
export async function hasProjectRole(
  projectId: string,
  userId: string,
  role: ProjectRole
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.role === role;
}

/**
 * Check if user is a leader in a project (any party)
 */
export async function isProjectLeader(
  projectId: string,
  userId: string
): Promise<boolean> {
  return await hasProjectRole(projectId, userId, "LEADER");
}

/**
 * Check if user is a DEV party member
 */
export async function isDevMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.party === "DEV";
}

/**
 * Check if user is a CLIENT party member
 */
export async function isClientMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.party === "CLIENT";
}

/**
 * Check if user is a DEV leader
 */
export async function isDevLeader(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.party === "DEV" && membership?.role === "LEADER";
}

/**
 * Check if client user is a CLIENT leader
 */
export async function isClientLeader(
  projectId: string,
  clientUserId: string
): Promise<boolean> {
  const membership = await getClientProjectMembership(projectId, clientUserId);
  return membership?.party === "CLIENT" && membership?.role === "LEADER";
}

/**
 * Require that user is a DEV leader
 * Throws PermissionError if not
 */
export async function requireDevLeader(projectId: string, userId: string) {
  const membership = await getProjectMembership(projectId, userId);

  if (!membership) {
    throw new PermissionError(
      `User ${userId} is not a member of project ${projectId}`
    );
  }

  if (membership.party !== "DEV") {
    throw new PermissionError(
      `User ${userId} is not on the DEV party for project ${projectId}`
    );
  }

  if (membership.role !== "LEADER") {
    throw new PermissionError(
      `User ${userId} is not a LEADER in project ${projectId}`
    );
  }

  return membership;
}

/**
 * Require that client user is a CLIENT leader
 * Throws PermissionError if not
 */
export async function requireClientLeader(
  projectId: string,
  clientUserId: string
) {
  const membership = await getClientProjectMembership(projectId, clientUserId);

  if (!membership) {
    throw new PermissionError(
      `Client user ${clientUserId} is not a member of project ${projectId}`
    );
  }

  if (membership.party !== "CLIENT") {
    throw new PermissionError(
      `Client user ${clientUserId} is not on the CLIENT party for project ${projectId}`
    );
  }

  if (membership.role !== "LEADER") {
    throw new PermissionError(
      `Client user ${clientUserId} is not a LEADER in project ${projectId}`
    );
  }

  return membership;
}

// ============================================================================
// WORKSPACE ROLE CHECKS
// ============================================================================

/**
 * Get workspace membership for a user
 * Returns null if not a member
 */
export async function getWorkspaceMembership(
  workspaceId: string,
  userId: string
) {
  return await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
    include: {
      workspace: true,
      user: true,
    },
  });
}

/**
 * Check if user is a member of the workspace
 */
export async function isWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const membership = await getWorkspaceMembership(workspaceId, userId);
  return !!membership;
}

/**
 * Check if user has a specific workspace role
 */
export async function hasWorkspaceRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceMemberRole
): Promise<boolean> {
  const membership = await getWorkspaceMembership(workspaceId, userId);
  return membership?.role === role;
}

/**
 * Check if user is a workspace admin (OWNER or ADMIN)
 */
export async function isWorkspaceAdmin(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const membership = await getWorkspaceMembership(workspaceId, userId);
  return membership?.role === "OWNER" || membership?.role === "ADMIN";
}

/**
 * Require that user is a workspace admin
 * Throws PermissionError if not
 */
export async function requireWorkspaceAdmin(
  workspaceId: string,
  userId: string
) {
  const membership = await getWorkspaceMembership(workspaceId, userId);

  if (!membership) {
    throw new PermissionError(
      `User ${userId} is not a member of workspace ${workspaceId}`
    );
  }

  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    throw new PermissionError(
      `User ${userId} is not an admin of workspace ${workspaceId}`
    );
  }

  return membership;
}

/**
 * Require that user is a workspace owner
 * Throws PermissionError if not
 */
export async function requireWorkspaceOwner(
  workspaceId: string,
  userId: string
) {
  const membership = await getWorkspaceMembership(workspaceId, userId);

  if (!membership) {
    throw new PermissionError(
      `User ${userId} is not a member of workspace ${workspaceId}`
    );
  }

  if (membership.role !== "OWNER") {
    throw new PermissionError(
      `User ${userId} is not the owner of workspace ${workspaceId}`
    );
  }

  return membership;
}

// ============================================================================
// PROJECT LEADER VALIDATION RULES
// ============================================================================

/**
 * Get all DEV leaders for a project
 */
export async function getDevLeaders(projectId: string) {
  return await prisma.projectMembership.findMany({
    where: {
      projectId,
      party: "DEV",
      role: "LEADER",
    },
    include: {
      user: true,
    },
  });
}

/**
 * Get all CLIENT leaders for a project
 */
export async function getClientLeaders(projectId: string) {
  return await prisma.projectMembership.findMany({
    where: {
      projectId,
      party: "CLIENT",
      role: "LEADER",
    },
    include: {
      clientUser: true,
    },
  });
}

/**
 * Check if project has at least one DEV leader
 */
export async function hasDevLeader(projectId: string): Promise<boolean> {
  const count = await prisma.projectMembership.count({
    where: {
      projectId,
      party: "DEV",
      role: "LEADER",
    },
  });
  return count >= 1;
}

/**
 * Check if project has at least one CLIENT leader
 */
export async function hasClientLeader(projectId: string): Promise<boolean> {
  const count = await prisma.projectMembership.count({
    where: {
      projectId,
      party: "CLIENT",
      role: "LEADER",
    },
  });
  return count >= 1;
}

/**
 * Validate that project has required leaders (at least 1 DEV, 1 CLIENT)
 * Throws PermissionError if validation fails
 */
export async function validateProjectLeaders(projectId: string): Promise<void> {
  const hasDevLeaderCheck = await hasDevLeader(projectId);
  const hasClientLeaderCheck = await hasClientLeader(projectId);

  if (!hasDevLeaderCheck) {
    throw new PermissionError(
      `Project ${projectId} must have at least 1 DEV leader`
    );
  }

  if (!hasClientLeaderCheck) {
    throw new PermissionError(
      `Project ${projectId} must have at least 1 CLIENT leader`
    );
  }
}

/**
 * Enforce project leader requirements before approval
 * MUST be called before sending approval requests
 */
export async function enforceProjectLeadersBeforeApproval(
  projectId: string
): Promise<void> {
  await validateProjectLeaders(projectId);
}

// ============================================================================
// APPROVAL REQUIREMENT VALIDATION
// ============================================================================

export interface ApprovalRules {
  client: {
    required: number; // Number of signatures required
    mode: "ANY" | "ALL"; // ANY = first N, ALL = all leaders
  };
  dev: {
    required: number;
    mode: "ANY" | "ALL";
  };
}

/**
 * Get default approval rules
 * Default: 1 DEV leader + 1 CLIENT leader required
 */
export function getDefaultApprovalRules(): ApprovalRules {
  return {
    client: {
      required: 1,
      mode: "ANY",
    },
    dev: {
      required: 1,
      mode: "ANY",
    },
  };
}

/**
 * Validate approval rules against project leaders
 * Ensures project has enough leaders to satisfy rules
 */
export async function validateApprovalRules(
  projectId: string,
  rules: ApprovalRules
): Promise<void> {
  const devLeaders = await getDevLeaders(projectId);
  const clientLeaders = await getClientLeaders(projectId);

  // Check DEV side
  if (rules.dev.mode === "ALL" && devLeaders.length < rules.dev.required) {
    throw new PermissionError(
      `Project requires ${rules.dev.required} DEV leader signatures but only has ${devLeaders.length} DEV leaders`
    );
  }

  if (rules.dev.mode === "ANY" && devLeaders.length < rules.dev.required) {
    throw new PermissionError(
      `Project requires ${rules.dev.required} DEV leader signatures but only has ${devLeaders.length} DEV leaders`
    );
  }

  // Check CLIENT side
  if (
    rules.client.mode === "ALL" &&
    clientLeaders.length < rules.client.required
  ) {
    throw new PermissionError(
      `Project requires ${rules.client.required} CLIENT leader signatures but only has ${clientLeaders.length} CLIENT leaders`
    );
  }

  if (
    rules.client.mode === "ANY" &&
    clientLeaders.length < rules.client.required
  ) {
    throw new PermissionError(
      `Project requires ${rules.client.required} CLIENT leader signatures but only has ${clientLeaders.length} CLIENT leaders`
    );
  }
}

/**
 * Check if approval requirements are met
 * Counts signatures from approved recipients
 */
export async function areApprovalRequirementsMet(
  approvalRequestId: string,
  rules: ApprovalRules
): Promise<boolean> {
  const recipients = await prisma.approvalRecipient.findMany({
    where: {
      approvalRequestId,
      status: "SIGNED",
    },
  });

  const devSignatures = recipients.filter((r) => r.party === "DEV").length;
  const clientSignatures = recipients.filter((r) => r.party === "CLIENT")
    .length;

  // Check DEV requirements
  const devRequirementMet = devSignatures >= rules.dev.required;

  // Check CLIENT requirements
  const clientRequirementMet = clientSignatures >= rules.client.required;

  return devRequirementMet && clientRequirementMet;
}

// ============================================================================
// PERMISSION GUARDS (use in server actions)
// ============================================================================

/**
 * Guard: User must be project member
 * Use at the start of server actions that require project access
 */
export async function guardProjectMember(projectId: string, userId: string) {
  await requireProjectMember(projectId, userId);
}

/**
 * Guard: User must be DEV leader
 * Use for actions only DEV leaders can perform
 */
export async function guardDevLeader(projectId: string, userId: string) {
  await requireDevLeader(projectId, userId);
}

/**
 * Guard: User must be workspace admin
 * Use for workspace management actions
 */
export async function guardWorkspaceAdmin(workspaceId: string, userId: string) {
  await requireWorkspaceAdmin(workspaceId, userId);
}
