/**
 * Proposal Submission Actions
 *
 * Server actions for submitting proposals and computing diffs
 */

import { prisma } from "./prisma";
import { requireUserId } from "./session";
import { requireProjectMember } from "./rbac";
import { computeCanonicalDiff, persistDiffSummary } from "./canonical-diff";

/**
 * Submit proposal for approval
 * - Computes canonical diff (ONCE)
 * - Persists diff to diffSummaryJson
 * - Marks proposal as AWAITING_APPROVAL
 * - Creates ApprovalRequest with recipients
 * - Logs audit event
 *
 * CRITICAL: Diff is computed ONCE here and NEVER recomputed
 */
export async function submitProposalForApproval(proposalId: string): Promise<{
  success: boolean;
  approvalRequestId?: string;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    // Get proposal
    const proposal = await prisma.changeProposal.findUnique({
      where: { id: proposalId },
      include: {
        project: true,
        baseScopeVersion: true,
      },
    });

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    // Check permission
    await requireProjectMember(proposal.projectId, userId);

    // Verify proposal is in DRAFT status
    if (proposal.status !== "DRAFT") {
      return { success: false, error: `Proposal status is ${proposal.status}, cannot submit` };
    }

    // Compute canonical diff (ONCE - never recomputed)
    // Skip for v1.0 proposals (no base version to diff against)
    if (proposal.baseScopeVersion.major > 0 || proposal.baseScopeVersion.minor > 0) {
      const diffSummary = await computeCanonicalDiff(
        proposal.baseScopeVersionId,
        proposalId
      );

      // Persist diff
      await persistDiffSummary(proposalId, diffSummary);
    }

    // Update proposal status
    await prisma.changeProposal.update({
      where: { id: proposalId },
      data: {
        status: "AWAITING_APPROVAL",
        submittedAt: new Date(),
      },
    });

    // Create approval request if one doesn't exist
    let approvalRequest = await prisma.approvalRequest.findFirst({
      where: { proposalId },
    });

    if (!approvalRequest) {
      approvalRequest = await prisma.approvalRequest.create({
        data: {
          projectId: proposal.projectId,
          proposalId,
          status: "PENDING",
          createdByUserId: userId,
        },
      });

      // Add all project leaders as recipients
      const leaders = await prisma.projectMembership.findMany({
        where: {
          projectId: proposal.projectId,
          role: "LEADER",
        },
        include: {
          user: true,
          clientUser: true,
        },
      });

      for (const leader of leaders) {
        await prisma.approvalRecipient.create({
          data: {
            approvalRequestId: approvalRequest.id,
            party: leader.party,
            userId: leader.userId,
            clientUserId: leader.clientUserId,
            email: leader.user?.email || leader.clientUser?.email || "",
            name: leader.user?.name || leader.clientUser?.name,
            status: "PENDING",
          },
        });
      }
    }

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        projectId: proposal.projectId,
        action: "PROPOSAL_SUBMITTED",
        userId,
        targetType: "PROPOSAL",
        targetId: proposalId,
        metadata: {
          proposalTitle: proposal.title,
          proposedVersion: `${proposal.proposedMajor}.${proposal.proposedMinor}`,
          approvalRequestId: approvalRequest.id,
        },
      },
    });

    return {
      success: true,
      approvalRequestId: approvalRequest.id,
    };
  } catch (error) {
    console.error("Submit proposal error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit proposal",
    };
  }
}

/**
 * Recompute diff for a proposal (ONLY for admin/debugging)
 * Normal workflow should NEVER call this - diff is computed once on submit
 */
export async function recomputeProposalDiff(proposalId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    const proposal = await prisma.changeProposal.findUnique({
      where: { id: proposalId },
      include: { baseScopeVersion: true },
    });

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    await requireProjectMember(proposal.projectId, userId);

    // Skip v1.0 proposals
    if (proposal.baseScopeVersion.major === 0 && proposal.baseScopeVersion.minor === 0) {
      return { success: false, error: "Cannot compute diff for v1.0 proposal" };
    }

    const diffSummary = await computeCanonicalDiff(
      proposal.baseScopeVersionId,
      proposalId
    );

    await persistDiffSummary(proposalId, diffSummary);

    // Log admin action
    await prisma.auditEvent.create({
      data: {
        projectId: proposal.projectId,
        action: "PROPOSAL_DIFF_RECOMPUTED",
        userId,
        targetType: "PROPOSAL",
        targetId: proposalId,
        metadata: {
          warning: "Manual recomputation - should only be used for debugging",
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Recompute diff error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to recompute diff",
    };
  }
}
