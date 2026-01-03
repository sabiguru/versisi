import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import { ProposalHeader } from "@/components/proposals/proposal-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProposalEditPage({
  params,
}: {
  params: Promise<{ projectId: string; proposalId: string }>;
}) {
  const user = await requireUser();
  const { projectId, proposalId } = await params;

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      project: true,
      baseScopeVersion: {
        include: {
          sections: {
            include: { items: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      sections: {
        include: { items: { orderBy: { orderIndex: "asc" } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!proposal) {
    notFound();
  }

  type Section = NonNullable<typeof proposal>["sections"][number];
  type Item = Section["items"][number];

  const isBaseEmpty = proposal.baseScopeVersion.sections.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href={`/app/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">
            {proposal.title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Proposal for v{proposal.proposedMajor}.{proposal.proposedMinor}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <ProposalEditor
              proposalId={proposal.id}
              sections={proposal.sections.map((s: Section) => ({
                id: s.id,
                title: s.title,
                orderIndex: s.orderIndex,
                items: s.items.map((i: Item) => ({
                  id: i.id,
                  title: i.title,
                  description: i.description,
                  acceptanceCriteria: i.acceptanceCriteria,
                  priority: i.priority,
                  orderIndex: i.orderIndex,
                })),
              }))}
              isBaseEmpty={isBaseEmpty}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProposalHeader
              proposalId={proposal.id}
              projectId={proposal.projectId}
              status={proposal.status}
              title={proposal.title}
              changeNote={proposal.changeNote}
              rationale={proposal.rationale}
              impactTimeline={proposal.impactTimeline}
              impactCost={proposal.impactCost}
              risk={proposal.risk}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
