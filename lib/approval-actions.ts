/**
 * Approval & Signature Actions
 *
 * Server actions for explicit signoff with complete audit trail.
 * NO soft approval, NO auto-approval - every signature requires explicit action.
 */

import { prisma } from "./prisma";
import { z } from "zod";
import {
  generateCanonicalSnapshot,
  computeSnapshotHash,
  computeSignatureHash,
} from "./canonical-snapshot";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SignApprovalSchema = z.object({
  recipientId: z.string().uuid(),
  typedName: z.string().min(1, "Typed name is required"),
  title: z.string().optional(),
  attestConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm the attestation",
  }),
  ipAddress: z.string().min(1),
  userAgent: z.string().min(1),
});

const DeclineApprovalSchema = z.object({
  recipientId: z.string().uuid(),
  reason: z.string().min(1, "Reason for declining is required"),
});

// ============================================================================
// APPROVAL SIGNING
// ============================================================================

/**
 * Sign an approval request (explicit signoff)
 * Generates canonical snapshot, computes hashes, stores IP + userAgent
 *
 * MUST NOT auto-approve - requires explicit user action
 */
export async function signApprovalRequest(data: {
  recipientId: string;
  typedName: string;
  title?: string;
  attestConfirmed: boolean;
  ipAddress: string;
  userAgent: string;
}) {
  // Validate input
  const validated = SignApprovalSchema.parse(data);

  // Get recipient with approval request and proposal
  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: validated.recipientId },
    include: {
      approvalRequest: {
        include: {
          proposal: true,
        },
      },
      signature: true,
    },
  });

  if (!recipient) {
    throw new Error("Approval recipient not found");
  }

  if (recipient.status === "SIGNED") {
    throw new Error("Already signed");
  }

  if (recipient.status === "DECLINED") {
    throw new Error("Cannot sign after declining");
  }

  if (recipient.signature) {
    throw new Error("Signature already exists");
  }

  const now = new Date();

  // Generate canonical snapshot
  const snapshot = await generateCanonicalSnapshot(
    recipient.approvalRequest.proposalId
  );

  // Compute hashes
  const snapshotHash = computeSnapshotHash(snapshot);
  const signatureHash = computeSignatureHash(
    snapshotHash,
    recipient.email,
    validated.typedName,
    now
  );

  // Store signature and update recipient status in transaction
  await prisma.$transaction([
    // Create signature
    prisma.signature.create({
      data: {
        approvalRecipientId: recipient.id,
        typedName: validated.typedName,
        title: validated.title,
        ipAddress: validated.ipAddress,
        userAgent: validated.userAgent,
        signedAt: now,
        snapshotHash,
        signatureHash,
        agreementSnapshotJson: snapshot as any,
      },
    }),

    // Update recipient status
    prisma.approvalRecipient.update({
      where: { id: recipient.id },
      data: {
        status: "SIGNED",
        signedAt: now,
      },
    }),

    // Log audit event
    prisma.auditEvent.create({
      data: {
        projectId: recipient.approvalRequest.projectId,
        action: "APPROVAL_SIGNED",
        actorType: recipient.userId ? "USER" : "CLIENT_USER",
        actorUserId: recipient.userId,
        actorClientUserId: recipient.clientUserId,
        entityType: "APPROVAL_REQUEST",
        entityId: recipient.approvalRequestId,
        metadata: {
          recipientId: recipient.id,
          party: recipient.party,
          typedName: validated.typedName,
          snapshotHash,
          signatureHash,
        },
      },
    }),
  ]);

  // Check if all recipients have signed (approval completion logic)
  await checkApprovalCompletion(recipient.approvalRequestId);

  return { success: true };
}

/**
 * Decline an approval request
 * NO soft approval - explicit decline with reason required
 */
export async function declineApprovalRequest(data: {
  recipientId: string;
  reason: string;
}) {
  // Validate input
  const validated = DeclineApprovalSchema.parse(data);

  // Get recipient
  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: validated.recipientId },
    include: {
      approvalRequest: true,
    },
  });

  if (!recipient) {
    throw new Error("Approval recipient not found");
  }

  if (recipient.status === "SIGNED") {
    throw new Error("Cannot decline after signing");
  }

  if (recipient.status === "DECLINED") {
    throw new Error("Already declined");
  }

  const now = new Date();

  // Update recipient status and log audit event
  await prisma.$transaction([
    prisma.approvalRecipient.update({
      where: { id: recipient.id },
      data: {
        status: "DECLINED",
        declinedAt: now,
        declineReason: validated.reason,
      },
    }),

    prisma.auditEvent.create({
      data: {
        projectId: recipient.approvalRequest.projectId,
        action: "APPROVAL_DECLINED",
        actorType: recipient.userId ? "USER" : "CLIENT_USER",
        actorUserId: recipient.userId,
        actorClientUserId: recipient.clientUserId,
        entityType: "APPROVAL_REQUEST",
        entityId: recipient.approvalRequestId,
        metadata: {
          recipientId: recipient.id,
          party: recipient.party,
          reason: validated.reason,
        },
      },
    }),
  ]);

  // Mark approval request as rejected
  await prisma.approvalRequest.update({
    where: { id: recipient.approvalRequestId },
    data: { status: "DECLINED" },
  });

  // Mark proposal as rejected
  await prisma.changeProposal.update({
    where: { id: recipient.approvalRequest.proposalId },
    data: { status: "REJECTED" },
  });

  return { success: true };
}

/**
 * Mark approval as viewed (tracking only, not approval)
 */
export async function markApprovalViewed(recipientId: string) {
  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: recipientId },
    include: { approvalRequest: true },
  });

  if (!recipient) {
    throw new Error("Approval recipient not found");
  }

  if (recipient.viewedAt) {
    return { success: true }; // Already viewed
  }

  await prisma.$transaction([
    prisma.approvalRecipient.update({
      where: { id: recipientId },
      data: { viewedAt: new Date() },
    }),

    prisma.auditEvent.create({
      data: {
        projectId: recipient.approvalRequest.projectId,
        action: "APPROVAL_VIEWED",
        actorType: recipient.userId ? "USER" : "CLIENT_USER",
        actorUserId: recipient.userId,
        actorClientUserId: recipient.clientUserId,
        entityType: "APPROVAL_REQUEST",
        entityId: recipient.approvalRequestId,
        metadata: {
          recipientId: recipient.id,
          party: recipient.party,
        },
      },
    }),
  ]);

  return { success: true };
}

// ============================================================================
// APPROVAL COMPLETION LOGIC
// ============================================================================

/**
 * Check if approval is complete and create ScopeVersion if all signed
 * Approval requires ALL recipients to sign (no partial approval)
 */
async function checkApprovalCompletion(approvalRequestId: string) {
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      recipients: true,
      proposal: {
        include: {
          baseScopeVersion: true,
          sections: {
            include: { items: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!approvalRequest) return;

  // Check if ALL recipients have signed
  const allSigned = approvalRequest.recipients.every(
    (r) => r.status === "SIGNED"
  );

  if (!allSigned) return; // Not yet complete

  // Check if any recipient declined
  const anyDeclined = approvalRequest.recipients.some(
    (r) => r.status === "DECLINED"
  );

  if (anyDeclined) {
    // Should already be marked as REJECTED, but ensure it
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: { status: "DECLINED" },
    });
    return;
  }

  // ALL recipients signed - create ScopeVersion from proposal
  const now = new Date();

  await prisma.$transaction([
    // Mark approval as approved
    prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: { status: "APPROVED" },
    }),

    // Mark proposal as approved
    prisma.changeProposal.update({
      where: { id: approvalRequest.proposalId },
      data: { status: "APPROVED" },
    }),

    // Create new ScopeVersion from proposal
    prisma.scopeVersion.create({
      data: {
        projectId: approvalRequest.proposal.projectId,
        major: approvalRequest.proposal.proposedMajor,
        minor: approvalRequest.proposal.proposedMinor,
        changeNote: approvalRequest.proposal.changeNote,
        basedOnScopeVersionId: approvalRequest.proposal.baseScopeVersionId,
        approvedByProposalId: approvalRequest.proposalId,
        approvedAt: now,
        sections: {
          create: approvalRequest.proposal.sections.map((section) => ({
            title: section.title,
            orderIndex: section.orderIndex,
            items: {
              create: section.items.map((item) => ({
                title: item.title,
                description: item.description,
                acceptanceCriteria: item.acceptanceCriteria,
                priority: item.priority,
                orderIndex: item.orderIndex,
              })),
            },
          })),
        },
      },
    }),

    // Log audit event
    prisma.auditEvent.create({
      data: {
        projectId: approvalRequest.projectId,
        action: "SCOPE_VERSION_CREATED",
        actorType: "SYSTEM",
        entityType: "APPROVAL_REQUEST",
        entityId: approvalRequestId,
        metadata: {
          proposalId: approvalRequest.proposalId,
          version: `${approvalRequest.proposal.proposedMajor}.${approvalRequest.proposal.proposedMinor}`,
          allRecipientsSigned: true,
        },
      },
    }),
  ]);
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get approval request by ID with all details
 */
export async function getApprovalRequest(approvalRequestId: string) {
  return await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      proposal: {
        include: {
          baseScopeVersion: true,
          sections: {
            include: { items: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      recipients: {
        include: {
          signature: true,
        },
        orderBy: [{ party: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

/**
 * Get approval recipient by ID with signature
 */
export async function getApprovalRecipient(recipientId: string) {
  return await prisma.approvalRecipient.findUnique({
    where: { id: recipientId },
    include: {
      approvalRequest: {
        include: {
          proposal: {
            include: {
              project: true,
              baseScopeVersion: true,
              sections: {
                include: { items: true },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      },
      signature: true,
    },
  });
}

// ============================================================================
// CANCEL APPROVAL REQUEST
// ============================================================================

export async function cancelApprovalRequest(approvalRequestId: string) {
  const user = await requireUser();

  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      proposal: true,
      project: true,
    },
  });

  if (!approvalRequest) {
    throw new Error("Approval request not found");
  }

  // Can only cancel if PENDING or VIEWED
  if (approvalRequest.status !== "PENDING") {
    throw new Error(`Cannot cancel approval request with status: ${approvalRequest.status}`);
  }

  // Update status
  await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: { status: "CANCELLED" },
  });

  // Update all pending recipients
  await prisma.approvalRecipient.updateMany({
    where: {
      approvalRequestId,
      status: { in: ["PENDING", "VIEWED"] },
    },
    data: { status: "DECLINED" }, // Mark as declined when cancelled
  });

  await prisma.auditEvent.create({
    data: {
      projectId: approvalRequest.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "CANCEL_APPROVAL",
      entityType: "APPROVAL_REQUEST",
      entityId: approvalRequestId,
      metadata: {
        proposalId: approvalRequest.proposalId,
      },
    },
  });

  revalidatePath(`/app/projects/${approvalRequest.projectId}`);
  revalidatePath(`/app/projects/${approvalRequest.projectId}/approvals/${approvalRequestId}`);

  return { success: true };
}

// ============================================================================
// RESEND APPROVAL REMINDER
// ============================================================================

export async function resendApprovalReminder(approvalRecipientId: string) {
  const user = await requireUser();

  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
    include: {
      approvalRequest: {
        include: {
          project: true,
          proposal: true,
        },
      },
    },
  });

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  if (recipient.status !== "PENDING" && recipient.status !== "VIEWED") {
    throw new Error("Can only send reminders to pending recipients");
  }

  // TODO: Send reminder email here
  // For now, just log the audit event

  await prisma.auditEvent.create({
    data: {
      projectId: recipient.approvalRequest.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "SEND_REMINDER",
      entityType: "APPROVAL_RECIPIENT",
      entityId: approvalRecipientId,
      metadata: {
        recipientEmail: recipient.email,
        approvalRequestId: recipient.approvalRequestId,
      },
    },
  });

  return { success: true, message: "Reminder sent (email integration pending)" };
}
