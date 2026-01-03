/**
 * Approval Email Helpers
 *
 * Functions to send approval-related emails
 */

import { sendEmail, sendBatchEmails } from "./send";
import {
  approvalRequestEmail,
  approvalReminderEmail,
  approvalSignedEmail,
  approvalDeclinedEmail,
} from "./templates";
import { generateApprovalSigningUrl } from "@/lib/portal-tokens";

/**
 * Send approval request emails to all recipients
 */
export async function sendApprovalRequestEmails(approvalRequestId: string) {
  const { prisma } = await import("@/lib/prisma");

  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      proposal: {
        include: {
          project: true,
        },
      },
      recipients: true,
    },
  });

  if (!approvalRequest) {
    throw new Error("Approval request not found");
  }

  const { proposal } = approvalRequest;
  const expiresIn = approvalRequest.dueAt
    ? `${Math.ceil((new Date(approvalRequest.dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
    : "no expiry";

  // Send email to each recipient
  const emails = await Promise.all(
    approvalRequest.recipients.map(async (recipient) => {
      const approveUrl = await generateApprovalSigningUrl(recipient.id);

      if (!approveUrl) {
        console.error(`Failed to generate signing URL for recipient ${recipient.id}`);
        return null;
      }

      const template = approvalRequestEmail({
        projectName: proposal.project.name,
        proposalTitle: proposal.title,
        proposalVersion: `v${proposal.proposedMajor}.${proposal.proposedMinor}`,
        changeNote: proposal.changeNote,
        approveUrl,
        expiresIn,
      });

      return {
        to: recipient.email,
        ...template,
      };
    })
  );

  const validEmails = emails.filter((e) => e !== null) as Array<Awaited<
    ReturnType<typeof approvalRequestEmail>
  > &
    { to: string }>;

  return sendBatchEmails(validEmails);
}

/**
 * Send reminder email to a specific recipient
 */
export async function sendApprovalReminderEmail(approvalRecipientId: string) {
  const { prisma } = await import("@/lib/prisma");

  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
    include: {
      approvalRequest: {
        include: {
          proposal: {
            include: {
              project: true,
            },
          },
        },
      },
    },
  });

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  const approveUrl = await generateApprovalSigningUrl(recipient.id);
  if (!approveUrl) {
    throw new Error("Failed to generate signing URL");
  }

  const { proposal } = recipient.approvalRequest;
  const expiresIn = recipient.approvalRequest.dueAt
    ? `${Math.ceil((new Date(recipient.approvalRequest.dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
    : "no expiry";

  const template = approvalReminderEmail({
    projectName: proposal.project.name,
    proposalTitle: proposal.title,
    approveUrl,
    expiresIn,
  });

  return sendEmail({
    to: recipient.email,
    ...template,
  });
}

/**
 * Notify all project leaders that someone signed
 */
export async function sendApprovalSignedNotification(
  approvalRecipientId: string
) {
  const { prisma } = await import("@/lib/prisma");

  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
    include: {
      signature: true,
      approvalRequest: {
        include: {
          proposal: {
            include: {
              project: {
                include: {
                  memberships: {
                    where: { role: "LEADER" },
                    include: {
                      user: true,
                      clientUser: true,
                    },
                  },
                },
              },
            },
          },
          recipients: true,
        },
      },
    },
  });

  if (!recipient || !recipient.signature) {
    return { succeeded: 0, failed: 0, total: 0 };
  }

  const { proposal, recipients } = recipient.approvalRequest;
  const remainingSignatures = recipients.filter(
    (r) => r.status === "PENDING" || r.status === "VIEWED"
  ).length;

  // Get all leader emails
  const leaderEmails = proposal.project.memberships
    .map((m) => m.user?.email || m.clientUser?.email)
    .filter((email): email is string => !!email);

  const template = approvalSignedEmail({
    projectName: proposal.project.name,
    proposalTitle: proposal.title,
    signerName: recipient.name || recipient.email,
    signerParty: recipient.party,
    remainingSignatures,
  });

  const emails = leaderEmails.map((email) => ({
    to: email,
    ...template,
  }));

  return sendBatchEmails(emails);
}

/**
 * Notify all project leaders that someone declined
 */
export async function sendApprovalDeclinedNotification(
  approvalRecipientId: string
) {
  const { prisma } = await import("@/lib/prisma");

  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
    include: {
      approvalRequest: {
        include: {
          proposal: {
            include: {
              project: {
                include: {
                  memberships: {
                    where: { role: "LEADER" },
                    include: {
                      user: true,
                      clientUser: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!recipient || !recipient.declineReason) {
    return { succeeded: 0, failed: 0, total: 0 };
  }

  const { proposal } = recipient.approvalRequest;

  // Get all leader emails
  const leaderEmails = proposal.project.memberships
    .map((m) => m.user?.email || m.clientUser?.email)
    .filter((email): email is string => !!email);

  const template = approvalDeclinedEmail({
    projectName: proposal.project.name,
    proposalTitle: proposal.title,
    declinerName: recipient.name || recipient.email,
    declinerParty: recipient.party,
    reason: recipient.declineReason,
  });

  const emails = leaderEmails.map((email) => ({
    to: email,
    ...template,
  }));

  return sendBatchEmails(emails);
}
