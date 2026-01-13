import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProposalButton } from "@/components/proposals/create-proposal-button";
import { PortalLinkGenerator } from "./portal-link-generator";
import { Download } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await requireUserId();
  const { projectId } = await params;

  // Get project with memberships to check access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      clientOrg: true,
      memberships: {
        include: {
          user: true,
          clientUser: true,
        },
      },
      scopeVersions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      proposals: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
          approvalRequests: {
            include: {
              recipients: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    redirect("/app/projects");
  }

  type Membership = NonNullable<typeof project>["memberships"][number];
  type Proposal = NonNullable<typeof project>["proposals"][number];

  // Check user has access and get their role
  const userMembership = project.memberships.find((m: Membership) => m.userId === userId);
  if (!userMembership) {
    redirect("/app/projects");
  }

  const userRole = userMembership.role; // LEADER | MEMBER | VIEWER
  const userParty = userMembership.party; // DEV | CLIENT

  const currentVersion = project.scopeVersions[0];
  const draftProposals = project.proposals.filter(
    (p: Proposal) => p.status === "DRAFT"
  );
  const pendingProposals = project.proposals.filter(
    (p: Proposal) => p.status === "AWAITING_APPROVAL"
  );
  const approvedProposals = project.proposals.filter(
    (p: Proposal) => p.status === "APPROVED"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href="/app/projects"
              className="text-sm text-accent hover:underline"
            >
              ← Back to Projects
            </Link>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-3xl font-semibold text-text">
                {project.name}
              </h1>
              <p className="mt-2 text-text/70">{project.clientSummary}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-text/60">
                {project.clientOrg && (
                  <span className="rounded-md border border-text/10 bg-surface px-2 py-1">
                    {project.clientOrg.name}
                  </span>
                )}
                <span className="rounded-md border border-text/10 bg-surface px-2 py-1 capitalize">
                  {project.status.toLowerCase().replace("_", " ")}
                </span>
                {currentVersion && (
                  <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-1 text-accent">
                    Current: v{currentVersion.major}.{currentVersion.minor}
                  </span>
                )}
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                  Your Role: {userRole === "LEADER" ? "Leader" : userRole === "MEMBER" ? "Member" : "Viewer"} ({userParty === "DEV" ? "Developer" : "Client"})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/app/projects/${projectId}/audit`}
                className="rounded-md border border-text/20 bg-white px-4 py-2 text-sm font-medium text-text hover:bg-gray-50 transition-colors"
              >
                Audit Log
              </Link>
              {userRole === "LEADER" && (
                <>
                  <Link
                    href={`/app/projects/${projectId}/team`}
                    className="rounded-md border border-text/20 bg-white px-4 py-2 text-sm font-medium text-text hover:bg-gray-50 transition-colors"
                  >
                    Manage Team
                  </Link>
                  <Link
                    href={`/app/projects/${projectId}/edit`}
                    className="rounded-md border border-text/20 bg-white px-4 py-2 text-sm font-medium text-text hover:bg-gray-50 transition-colors"
                  >
                    Edit Project
                  </Link>
                </>
              )}
              {!currentVersion ? (
                <div className="flex flex-col items-end gap-1">
                  <CreateProposalButton projectId={projectId} />
                  <span className="text-xs text-text/50">Start by defining scope</span>
                </div>
              ) : (
                <CreateProposalButton projectId={projectId} />
              )}
            </div>
          </div>
        </div>

        {/* Current Version or Getting Started */}
        {currentVersion ? (
          <div className="mb-8 rounded-lg border border-text/10 bg-white p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-text">
              Current Scope Version
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Version:</span>
                <span className="rounded-md bg-accent/10 px-2 py-1 text-accent">
                  v{currentVersion.major}.{currentVersion.minor}
                </span>
              </div>
              <div>
                <span className="font-medium">Change Note:</span>{" "}
                {currentVersion.changeNote}
              </div>
              <div>
                <span className="font-medium">Rationale:</span>{" "}
                {currentVersion.rationale}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/app/projects/${projectId}/versions/${currentVersion.id}`}
                    className="text-accent hover:underline"
                  >
                    View full version →
                  </Link>
                  <Link
                    href={`/app/projects/${projectId}/versions`}
                    className="text-accent hover:underline"
                  >
                    View all versions →
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/api/versions/${currentVersion.id}/export/pdf`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </Link>
                  <Link
                    href={`/api/versions/${currentVersion.id}/export/docx`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="w-3 h-3" />
                    DOCX
                  </Link>
                  <Link
                    href={`/api/versions/${currentVersion.id}/export/xlsx`}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Download className="w-3 h-3" />
                    XLSX
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-accent/20 bg-accent/5 p-6">
            <h2 className="mb-3 font-heading text-xl font-semibold text-text">
              Getting Started
            </h2>
            <p className="text-sm text-text/70 mb-4">
              This project doesn't have any scope defined yet. Create your first proposal to define the project scope, add features, and outline deliverables.
            </p>
            <div className="space-y-2 text-sm text-text/60">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  1
                </span>
                <div>
                  <strong className="text-text">Create a proposal</strong> - Click "Create Proposal" above to start
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  2
                </span>
                <div>
                  <strong className="text-text">Add scope sections</strong> - Organize your features into logical sections
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  3
                </span>
                <div>
                  <strong className="text-text">Define scope items</strong> - Add features with descriptions and acceptance criteria
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  4
                </span>
                <div>
                  <strong className="text-text">Submit for approval</strong> - Send to client for review and signatures
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portal Link Generator */}
        {userRole === "LEADER" && (
          <div className="mb-8">
            <PortalLinkGenerator
              projectId={projectId}
              portalPublicKey={project.portalPublicKey}
              portalEnabled={project.portalEnabled}
            />
          </div>
        )}

        {/* Draft Proposals */}
        {draftProposals.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-heading text-xl font-semibold text-text">
              Draft Proposals
            </h2>
            <div className="space-y-3">
              {draftProposals.map((proposal: Proposal) => (
                <Link
                  key={proposal.id}
                  href={`/app/projects/${projectId}/proposals/${proposal.id}`}
                  className="block rounded-lg border border-text/10 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-text">{proposal.title}</h3>
                      <p className="mt-1 text-sm text-text/60">
                        {proposal.changeNote}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-text/50">
                        <span>
                          Proposed: v{proposal.proposedMajor}.
                          {proposal.proposedMinor}
                        </span>
                        <span>•</span>
                        <span>
                          By: {proposal.createdBy?.name || proposal.createdBy?.email || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-md border border-text/20 bg-text/5 px-2 py-1 text-xs text-text/60">
                      Draft
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Proposals */}
        {pendingProposals.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-heading text-xl font-semibold text-text">
              Pending Approval
            </h2>
            <div className="space-y-3">
              {pendingProposals.map((proposal: Proposal) => {
                const request = proposal.approvalRequests[0];
                type ApprovalRecipient = NonNullable<typeof request>["recipients"][number];
                const totalApprovals = request?.recipients.filter(
                  (a: ApprovalRecipient) => a.status === "SIGNED"
                ).length || 0;
                const totalRecipients = request?.recipients.length || 0;

                return (
                  <Link
                    key={proposal.id}
                    href={`/app/projects/${projectId}/proposals/${proposal.id}`}
                    className="block rounded-lg border border-warning/20 bg-warning/5 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-text">
                          {proposal.title}
                        </h3>
                        <p className="mt-1 text-sm text-text/60">
                          {proposal.changeNote}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-text/50">
                          <span>
                            Proposed: v{proposal.proposedMajor}.
                            {proposal.proposedMinor}
                          </span>
                          <span>•</span>
                          <span>
                            Approvals: {totalApprovals}/{totalRecipients}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-md border border-warning/40 bg-warning/10 px-2 py-1 text-xs text-warning">
                        Pending
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Approved Proposals */}
        {approvedProposals.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 font-heading text-xl font-semibold text-text">
              Approved Changes
            </h2>
            <div className="space-y-3">
              {approvedProposals.map((proposal: Proposal) => (
                <Link
                  key={proposal.id}
                  href={`/app/projects/${projectId}/proposals/${proposal.id}`}
                  className="block rounded-lg border border-accent/20 bg-accent/5 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-text">{proposal.title}</h3>
                      <p className="mt-1 text-sm text-text/60">
                        {proposal.changeNote}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-text/50">
                        <span>
                          Version: v{proposal.proposedMajor}.
                          {proposal.proposedMinor}
                        </span>
                        <span>•</span>
                        <span>
                          By: {proposal.createdBy?.name || proposal.createdBy?.email || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent">
                      Approved
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {draftProposals.length === 0 &&
          pendingProposals.length === 0 &&
          approvedProposals.length === 0 && (
            <div className="rounded-lg border border-text/10 bg-white p-12 text-center">
              <p className="text-text/60">No proposals yet</p>
              <p className="mt-2 text-sm text-text/50">
                Create your first proposal to get started
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
