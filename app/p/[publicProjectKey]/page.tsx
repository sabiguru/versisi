import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PortalHomeProps {
  params: Promise<{ publicProjectKey: string }>;
}

export default async function PortalHomePage({ params }: PortalHomeProps) {
  const { publicProjectKey } = await params;

  // Get project by portal public key
  const project = await prisma.project.findUnique({
    where: { portalPublicKey: publicProjectKey },
    include: {
      clientOrg: true,
      scopeVersions: {
        where: { approvedAt: { not: null } },
        orderBy: { approvedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project || !project.portalEnabled) {
    notFound();
  }

  const currentVersion = project.scopeVersions[0];

  // Get pending approval requests for this project
  const pendingApprovals = await prisma.approvalRequest.findMany({
    where: {
      projectId: project.id,
      status: { in: ["PENDING", "VIEWED"] },
    },
    include: {
      proposal: true,
      recipients: {
        where: {
          party: "CLIENT",
          status: { in: ["PENDING", "VIEWED"] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  type ApprovalRequest = typeof pendingApprovals[number];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-text/10 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="font-heading text-3xl font-semibold text-text">
            {project.name}
          </h1>
          <p className="mt-2 text-text/70">{project.clientSummary}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          {currentVersion ? (
            <div className="rounded-lg border border-text/10 bg-white p-6">
              <h2 className="mb-4 font-heading text-xl font-semibold text-text">
                Current Scope
              </h2>
              <p className="text-sm text-text/60">
                Version {currentVersion.major}.{currentVersion.minor}
              </p>
              <p className="mt-2 text-text">{currentVersion.changeNote}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-text/10 bg-white p-6">
              <p className="text-center text-text/60">
                No approved scope version yet
              </p>
            </div>
          )}

          <div className="rounded-lg border border-text/10 bg-white p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-text">
              Pending Approvals
            </h2>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((approval: ApprovalRequest) => (
                  <div
                    key={approval.id}
                    className="rounded-lg border border-orange-200 bg-orange-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-text">
                          {approval.proposal.title}
                        </h3>
                        <p className="mt-1 text-sm text-text/70">
                          Version {approval.proposal.proposedMajor}.{approval.proposal.proposedMinor}
                        </p>
                        <p className="mt-2 text-sm text-text/60">
                          {approval.recipients.length} client recipient(s) pending signature
                        </p>
                        {approval.sentAt && (
                          <p className="mt-1 text-xs text-text/50">
                            Sent: {new Date(approval.sentAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/p/${publicProjectKey}/approve/${approval.id}`}
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
                      >
                        Review & Sign
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text/60">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
