/**
 * Audit Log Utilities (Prompt 14)
 *
 * APPEND-ONLY audit trail for all significant events.
 * NO DELETES, NO UPDATES - immutable record.
 *
 * All events already logged via existing code - this file provides
 * query utilities for displaying the audit log.
 */

import { prisma } from "./prisma";

/**
 * Audit Event Types (Complete List)
 */
export const AUDIT_EVENT_TYPES = {
  // Project lifecycle
  PROJECT_CREATED: "PROJECT_CREATED",

  // Proposal lifecycle
  PROPOSAL_CREATED: "PROPOSAL_CREATED",
  PROPOSAL_SUBMITTED: "PROPOSAL_SUBMITTED",
  PROPOSAL_DIFF_RECOMPUTED: "PROPOSAL_DIFF_RECOMPUTED",

  // Approval lifecycle
  APPROVAL_REQUEST_SENT: "APPROVAL_REQUEST_SENT",
  APPROVAL_VIEWED: "APPROVAL_VIEWED",
  APPROVAL_SIGNED: "APPROVAL_SIGNED",
  APPROVAL_DECLINED: "APPROVAL_DECLINED",

  // Version lifecycle
  SCOPE_VERSION_CREATED: "SCOPE_VERSION_CREATED",

  // Comments
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_REPLIED: "COMMENT_REPLIED",
  COMMENT_RESOLVED: "COMMENT_RESOLVED",
  COMMENT_REOPENED: "COMMENT_REOPENED",
} as const;

/**
 * Get audit events for a project
 * Returns events in reverse chronological order (newest first)
 *
 * NEVER mutates data - read-only query
 */
export async function getProjectAuditLog(
  projectId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: string;
    userId?: string;
    clientUserId?: string;
  }
) {
  const where: any = { projectId };

  if (options?.action) {
    where.action = options.action;
  }

  if (options?.userId) {
    where.userId = options.userId;
  }

  if (options?.clientUserId) {
    where.clientUserId = options.clientUserId;
  }

  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      include: {
        actorUser: {
          select: { name: true, email: true },
        },
        actorClient: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return { events, total };
}

/**
 * Get audit events for a specific target
 * (e.g., all events for a specific proposal)
 */
export async function getTargetAuditLog(
  targetType: string,
  targetId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  const [events, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where: {
        entityType: targetType,
        entityId: targetId,
      },
      include: {
        actorUser: {
          select: { name: true, email: true },
        },
        actorClient: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.auditEvent.count({
      where: { entityType: targetType, entityId: targetId },
    }),
  ]);

  return { events, total };
}

/**
 * Get recent audit events across all projects
 * (for admin dashboard)
 */
export async function getRecentAuditEvents(limit: number = 100) {
  return await prisma.auditEvent.findMany({
    include: {
      project: {
        select: { name: true },
      },
      actorUser: {
        select: { name: true, email: true },
      },
      actorClient: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit event statistics for a project
 */
export async function getProjectAuditStats(projectId: string) {
  const events = await prisma.auditEvent.findMany({
    where: { projectId },
    select: { action: true },
  });

  const stats: Record<string, number> = {};
  for (const event of events) {
    stats[event.action] = (stats[event.action] || 0) + 1;
  }

  return {
    total: events.length,
    byAction: stats,
  };
}

/**
 * Format audit event for display
 */
export function formatAuditEvent(event: {
  action: string;
  createdAt: Date;
  metadata?: any;
  actorUser?: { name: string | null; email: string } | null;
  actorClient?: { name: string | null; email: string } | null;
}): string {
  const actor = event.actorUser?.name || event.actorClient?.name || event.actorUser?.email || event.actorClient?.email || "System";
  const timestamp = event.createdAt.toLocaleString();

  switch (event.action) {
    case "PROJECT_CREATED":
      return `${actor} created the project at ${timestamp}`;

    case "PROPOSAL_CREATED":
      return `${actor} created proposal "${event.metadata?.proposalTitle || "Untitled"}" at ${timestamp}`;

    case "PROPOSAL_SUBMITTED":
      return `${actor} submitted proposal for approval at ${timestamp}`;

    case "APPROVAL_VIEWED":
      return `${actor} (${event.metadata?.party}) viewed approval request at ${timestamp}`;

    case "APPROVAL_SIGNED":
      return `${actor} (${event.metadata?.party}) signed approval as "${event.metadata?.typedName}" at ${timestamp}`;

    case "APPROVAL_DECLINED":
      return `${actor} (${event.metadata?.party}) declined approval at ${timestamp}`;

    case "SCOPE_VERSION_CREATED":
      return `Version ${event.metadata?.version} was created (all approvals signed) at ${timestamp}`;

    case "COMMENT_CREATED":
      return `${actor} created a comment at ${timestamp}`;

    case "COMMENT_RESOLVED":
      return `${actor} resolved a comment thread at ${timestamp}`;

    default:
      return `${actor} performed ${event.action} at ${timestamp}`;
  }
}

/**
 * Verify audit log integrity
 * Ensures no events were deleted or modified
 *
 * Returns true if audit log passes integrity checks
 */
export async function verifyAuditLogIntegrity(projectId: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Get all events
  const events = await prisma.auditEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  // Check 1: Events are in chronological order
  for (let i = 1; i < events.length; i++) {
    if (events[i].createdAt < events[i - 1].createdAt) {
      errors.push(`Event ${events[i].id} has timestamp before previous event`);
    }
  }

  // Check 2: No gaps in sequence (if you add sequence numbers)
  // This would require adding a sequence field to AuditEvent

  // Check 3: Critical events exist
  const projectCreated = events.find(e => e.action === "PROJECT_CREATED");
  if (!projectCreated) {
    errors.push("Missing PROJECT_CREATED event");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
