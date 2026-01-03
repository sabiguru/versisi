import { requireUser } from "@/lib/session";
import { requireProjectMember } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CommentList } from "@/components/comments/comment-list";

interface VersionPageProps {
  params: Promise<{ projectId: string; versionId: string }>;
}

export default async function VersionPage({ params }: VersionPageProps) {
  const user = await requireUser();
  const { projectId, versionId } = await params;

  // Get version
  const version = await prisma.scopeVersion.findUnique({
    where: { id: versionId },
    include: {
      project: true,
      sections: {
        include: {
          items: true,
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!version || version.projectId !== projectId) {
    notFound();
  }

  type Section = NonNullable<typeof version>["sections"][number];

  // Enforce permission
  await requireProjectMember(projectId, user.id);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Version {version.major}.{version.minor}
        </h1>
        <p className="mt-2 text-text/70">{version.changeNote}</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-text">
            Scope Sections
          </h2>
          {version.sections.length > 0 ? (
            <div className="space-y-4">
              {version.sections.map((section: Section) => (
                <div key={section.id} className="border-b border-text/10 pb-4">
                  <h3 className="font-medium text-text">{section.title}</h3>
                  <p className="mt-1 text-sm text-text/60">
                    {section.items.length} items
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text/60">No sections defined</p>
          )}
        </div>

        {version.approvedAt && (
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
            <p className="text-sm font-medium text-accent">
              ✓ Approved on{" "}
              {new Date(version.approvedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Comments Section */}
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <CommentList
            projectId={projectId}
            entityType="SCOPE_ITEM"
            entityId={versionId}
            canResolve={true}
            canUseInternal={true}
            showComposer={!version.approvedAt}
          />
        </div>
      </div>
    </div>
  );
}
