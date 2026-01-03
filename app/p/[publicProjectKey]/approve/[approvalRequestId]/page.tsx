import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PortalApprovalContent } from "./portal-approval-content";
import { generateCanonicalSnapshot } from "@/lib/canonical-snapshot";

interface PortalApprovalProps {
  params: Promise<{ publicProjectKey: string; approvalRequestId: string }>;
  searchParams: Promise<{ recipient?: string }>;
}

export default async function PortalApprovalPage({
  params,
  searchParams,
}: PortalApprovalProps) {
  const { publicProjectKey, approvalRequestId } = await params;
  const { recipient: recipientId } = await searchParams;

  // Get project by portal public key
  const project = await prisma.project.findUnique({
    where: { portalPublicKey: publicProjectKey },
  });

  if (!project || !project.portalEnabled) {
    notFound();
  }

  // Get approval request with all details
  const approvalRequest = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
    include: {
      proposal: {
        include: {
          sections: {
            include: {
              items: {
                orderBy: { orderIndex: "asc" },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
          baseScopeVersion: true,
          project: true,
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

  if (!approvalRequest || approvalRequest.projectId !== project.id) {
    notFound();
  }

  // Get specific recipient if ID provided
  let recipientData = null;
  if (recipientId) {
    recipientData = approvalRequest.recipients.find((r) => r.id === recipientId);
    if (!recipientData) {
      notFound();
    }
  }

  // Generate canonical snapshot
  const snapshot = await generateCanonicalSnapshot(approvalRequest.proposalId);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-text/10 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
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
            <span>
              Version: v{approvalRequest.proposal.proposedMajor}.
              {approvalRequest.proposal.proposedMinor}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <PortalApprovalContent
          approvalRequestId={approvalRequest.id}
          recipientId={recipientId || null}
          recipientData={
            recipientData
              ? {
                  id: recipientData.id,
                  email: recipientData.email,
                  name: recipientData.name,
                  status: recipientData.status,
                }
              : null
          }
          snapshot={snapshot}
          allRecipients={approvalRequest.recipients.map((r) => ({
            id: r.id,
            email: r.email,
            name: r.name,
            party: r.party,
            status: r.status,
            signedAt: r.signedAt,
            declinedAt: r.declinedAt,
          }))}
        />
      </div>
    </div>
  );
}
