import { requireUser } from "@/lib/session";
import { requireProjectMember } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApprovalActionsClient } from "./approval-actions-client";

interface ApprovalPageProps {
  params: Promise<{ projectId: string; approvalRequestId: string }>;
}

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const user = await requireUser();
  const { projectId, approvalRequestId } = await params;

  // Get approval request
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      project: true,
      proposal: true,
      recipients: {
        include: {
          signature: true,
        },
      },
    },
  });

  type Recipient = NonNullable<typeof approvalRequest>["recipients"][number];

  if (!approvalRequest || approvalRequest.projectId !== projectId) {
    notFound();
  }

  // Enforce permission
  await requireProjectMember(projectId, user.id);

  // Check if user is a leader
  const userMembership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId: user.id,
      role: "LEADER",
    },
  });
  const isLeader = !!userMembership;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Approval Request
        </h1>
        <p className="mt-2 text-text/70">
          {approvalRequest.proposal.title}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-text/60">
          <span>
            Status:{" "}
            <span className="font-medium text-text">
              {approvalRequest.status}
            </span>
          </span>
          {approvalRequest.sentAt && (
            <span>
              Sent:{" "}
              {new Date(approvalRequest.sentAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <ApprovalActionsClient
          approvalRequestId={approvalRequestId}
          projectId={projectId}
          status={approvalRequest.status}
          isLeader={isLeader}
        />

        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-text">
            Recipients
          </h2>
          {approvalRequest.recipients.length > 0 ? (
            <div className="space-y-3">
              {approvalRequest.recipients.map((recipient: Recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between border-b border-text/10 pb-3"
                >
                  <div>
                    <p className="font-medium text-text">
                      {recipient.name || recipient.email}
                    </p>
                    <p className="text-sm text-text/60">
                      {recipient.party} · {recipient.status}
                    </p>
                  </div>
                  {recipient.signature && (
                    <span className="text-sm font-medium text-accent">
                      ✓ Signed
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text/60">No recipients</p>
          )}
        </div>
      </div>
    </div>
  );
}
