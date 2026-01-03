"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { requireProjectMember } from "@/lib/rbac";
import { z } from "zod";
import { PartyType, CommentVisibility, CommentThreadStatus } from "@prisma/client";

// ============================================================================
// COMMENT SYSTEM - ANNOTATIONS ONLY
// ============================================================================

// Comments are ANNOTATIONS that never alter scope
// Comments do NOT propagate to new versions
// Comments are anchored to specific items (Proposal or Scope)

const createThreadSchema = z.object({
  projectId: z.string().uuid(),
  entityType: z.enum(["PROPOSAL_ITEM", "SCOPE_ITEM"]),
  entityId: z.string().uuid(),
  field: z.enum(["TITLE", "DESCRIPTION", "ACCEPTANCE", "GENERAL"]).optional(),
  quotedText: z.string().optional(),
  visibility: z.enum(["SHARED", "INTERNAL"]),
  body: z.string().min(1, "Comment body required"),
});

const addMessageSchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().min(1, "Message body required"),
});

/**
 * Create a new comment thread
 * Anchored to a specific ProposalItem or ScopeItem
 */
export async function createCommentThread(data: {
  projectId: string;
  entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM";
  entityId: string;
  field?: "TITLE" | "DESCRIPTION" | "ACCEPTANCE" | "GENERAL";
  quotedText?: string;
  anchorMeta?: any;
  visibility: CommentVisibility;
  body: string;
}) {
  const userId = await requireUserId();

  // Validate input
  const validated = createThreadSchema.parse(data);

  // Enforce permission - must be project member
  await requireProjectMember(validated.projectId, userId);

  // Get user's party
  const membership = await prisma.projectMembership.findFirst({
    where: {
      projectId: validated.projectId,
      userId,
    },
  });

  if (!membership) {
    throw new Error("User not a project member");
  }

  // Create thread
  const thread = await prisma.commentThread.create({
    data: {
      projectId: validated.projectId,
      party: membership.party,
      visibility: validated.visibility,
      status: "OPEN",
      entityType: validated.entityType,
      entityId: validated.entityId,
      field: validated.field || "GENERAL",
      quotedText: validated.quotedText,
      anchorMeta: data.anchorMeta,
      createdByUserId: userId,
    },
  });

  // Create first message
  await prisma.commentMessage.create({
    data: {
      threadId: thread.id,
      body: validated.body,
      createdByUserId: userId,
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: validated.projectId,
      actorType: "USER",
      actorUserId: userId,
      action: "COMMENT_CREATED",
      entityType: "COMMENT_THREAD",
      entityId: thread.id,
      metadata: {
        entityType: validated.entityType,
        entityId: validated.entityId,
        visibility: validated.visibility,
      },
    },
  });

  return thread;
}

/**
 * Add a message to existing thread
 */
export async function addCommentMessage(data: {
  threadId: string;
  body: string;
}) {
  const userId = await requireUserId();

  // Validate input
  const validated = addMessageSchema.parse(data);

  // Get thread
  const thread = await prisma.commentThread.findUnique({
    where: { id: validated.threadId },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  // Enforce permission - must be project member
  await requireProjectMember(thread.projectId, userId);

  // Create message
  const message = await prisma.commentMessage.create({
    data: {
      threadId: validated.threadId,
      body: validated.body,
      createdByUserId: userId,
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: thread.projectId,
      actorType: "USER",
      actorUserId: userId,
      action: "COMMENT_REPLIED",
      entityType: "COMMENT_MESSAGE",
      entityId: message.id,
      metadata: {
        threadId: thread.id,
      },
    },
  });

  return message;
}

/**
 * Resolve a comment thread
 */
export async function resolveCommentThread(threadId: string) {
  const userId = await requireUserId();

  // Get thread
  const thread = await prisma.commentThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  // Enforce permission - must be project member
  await requireProjectMember(thread.projectId, userId);

  // Update thread
  await prisma.commentThread.update({
    where: { id: threadId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedByUserId: userId,
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: thread.projectId,
      actorType: "USER",
      actorUserId: userId,
      action: "COMMENT_RESOLVED",
      entityType: "COMMENT_THREAD",
      entityId: thread.id,
    },
  });

  return { success: true };
}

/**
 * Reopen a resolved comment thread
 */
export async function reopenCommentThread(threadId: string) {
  const userId = await requireUserId();

  // Get thread
  const thread = await prisma.commentThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  // Enforce permission - must be project member
  await requireProjectMember(thread.projectId, userId);

  // Update thread
  await prisma.commentThread.update({
    where: { id: threadId },
    data: {
      status: "OPEN",
      resolvedAt: null,
      resolvedByUserId: null,
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: thread.projectId,
      actorType: "USER",
      actorUserId: userId,
      action: "COMMENT_REOPENED",
      entityType: "COMMENT_THREAD",
      entityId: thread.id,
    },
  });

  return { success: true };
}

/**
 * Get comment threads for an entity
 */
export async function getCommentThreads(
  projectId: string,
  entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM",
  entityId: string
) {
  const userId = await requireUserId();

  // Enforce permission - must be project member
  await requireProjectMember(projectId, userId);

  // Get user's party to filter visibility
  const membership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
    },
  });

  // Get threads
  const threads = await prisma.commentThread.findMany({
    where: {
      projectId,
      entityType,
      entityId,
      OR: [
        { visibility: "SHARED" }, // Everyone sees shared
        { visibility: "INTERNAL", party: membership?.party }, // Only same party sees internal
      ],
    },
    include: {
      messages: {
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
          createdByClient: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      createdByUser: {
        select: { name: true, email: true },
      },
      createdByClient: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return threads;
}

/**
 * Get comment count for an entity
 */
export async function getCommentCount(
  projectId: string,
  entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM",
  entityId: string
) {
  const userId = await requireUserId();

  // Enforce permission - must be project member
  await requireProjectMember(projectId, userId);

  // Get user's party to filter visibility
  const membership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
    },
  });

  const count = await prisma.commentThread.count({
    where: {
      projectId,
      entityType,
      entityId,
      OR: [
        { visibility: "SHARED" },
        { visibility: "INTERNAL", party: membership?.party },
      ],
    },
  });

  return count;
}

/**
 * Create comment thread for client user
 * Uses clientUserId instead of userId
 */
export async function createCommentThreadAsClient(
  clientUserId: string,
  data: {
    projectId: string;
    entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM";
    entityId: string;
    field?: "TITLE" | "DESCRIPTION" | "ACCEPTANCE" | "GENERAL";
    quotedText?: string;
    body: string;
  }
) {
  // Get client membership
  const membership = await prisma.projectMembership.findFirst({
    where: {
      projectId: data.projectId,
      clientUserId,
    },
  });

  if (!membership) {
    throw new Error("Client user not a project member");
  }

  // Create thread (always SHARED for clients)
  const thread = await prisma.commentThread.create({
    data: {
      projectId: data.projectId,
      party: membership.party,
      visibility: "SHARED", // Clients can only create shared comments
      status: "OPEN",
      entityType: data.entityType,
      entityId: data.entityId,
      field: data.field || "GENERAL",
      quotedText: data.quotedText,
      createdByClientUserId: clientUserId,
    },
  });

  // Create first message
  await prisma.commentMessage.create({
    data: {
      threadId: thread.id,
      body: data.body,
      createdByClientUserId: clientUserId,
    },
  });

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: data.projectId,
      actorType: "CLIENT_USER",
      actorClientUserId: clientUserId,
      action: "COMMENT_CREATED",
      entityType: "COMMENT_THREAD",
      entityId: thread.id,
      metadata: {
        entityType: data.entityType,
        entityId: data.entityId,
      },
    },
  });

  return thread;
}
