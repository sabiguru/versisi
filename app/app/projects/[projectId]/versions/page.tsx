import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, FileText, User, ChevronRight } from "lucide-react";

export default async function ProjectVersionsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const userId = await requireUserId();
  const { projectId } = await params;

  // Get project with memberships
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      memberships: {
        where: { userId },
      },
      scopeVersions: {
        where: { approvedAt: { not: null } },
        orderBy: [{ major: "desc" }, { minor: "desc" }],
        include: {
          createdBy: { select: { name: true, email: true } },
          _count: { select: { sections: true } },
        },
      },
    },
  });

  if (!project || project.memberships.length === 0) {
    redirect("/app/projects");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <Link
            href={`/app/projects/${projectId}`}
            className="text-sm text-accent hover:underline"
          >
            ← Back to Project
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold text-text">
            Scope Version History
          </h1>
          <p className="mt-2 text-text/70">
            All approved scope versions for {project.name}
          </p>
        </div>

        {project.scopeVersions.length === 0 ? (
          <div className="rounded-lg border border-text/10 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-text/30 mb-4" />
            <p className="text-text/60 mb-2">No approved versions yet</p>
            <p className="text-sm text-text/50">
              Create and submit a proposal to establish your first scope version
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {project.scopeVersions.map((version, index) => {
              const isLatest = index === 0;

              return (
                <Link
                  key={version.id}
                  href={`/app/projects/${projectId}/versions/${version.id}`}
                  className="block rounded-lg border border-text/10 bg-white p-6 transition-all hover:shadow-md hover:border-accent/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-heading text-2xl font-semibold text-accent">
                          v{version.major}.{version.minor}
                        </span>
                        {isLatest && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Current
                          </span>
                        )}
                      </div>

                      <h3 className="font-medium text-text mb-2">
                        {version.changeNote}
                      </h3>

                      <p className="text-sm text-text/60 mb-4">
                        {version.rationale}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-text/50">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Approved {new Date(version.approvedAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {version.createdBy.name || version.createdBy.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{version._count.sections} sections</span>
                        </div>
                      </div>

                      {version.impactTimeline !== "NONE" && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <span className="rounded bg-orange-100 px-2 py-1 text-orange-700">
                            Impact: {version.impactTimeline}
                          </span>
                          {version.impactCost !== "NONE" && (
                            <span className="rounded bg-orange-100 px-2 py-1 text-orange-700">
                              Cost: {version.impactCost}
                            </span>
                          )}
                          {version.risk !== "LOW" && (
                            <span className="rounded bg-red-100 px-2 py-1 text-red-700">
                              Risk: {version.risk}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-text/40 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
