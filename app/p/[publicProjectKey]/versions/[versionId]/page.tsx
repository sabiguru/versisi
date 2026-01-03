import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PortalVersionProps {
  params: Promise<{ publicProjectKey: string; versionId: string }>;
}

export default async function PortalVersionPage({
  params,
}: PortalVersionProps) {
  const { publicProjectKey, versionId } = await params;

  // Get project by portal public key
  const project = await prisma.project.findUnique({
    where: { portalPublicKey: publicProjectKey },
  });

  if (!project || !project.portalEnabled) {
    notFound();
  }

  // Get version
  const version = await prisma.scopeVersion.findUnique({
    where: { id: versionId },
    include: {
      sections: {
        include: {
          items: true,
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!version || version.projectId !== project.id) {
    notFound();
  }

  // Only show approved versions in portal
  if (!version.approvedAt) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-text/10 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <h1 className="font-heading text-3xl font-semibold text-text">
            Version {version.major}.{version.minor}
          </h1>
          <p className="mt-2 text-text/70">{version.changeNote}</p>
          <p className="mt-2 text-sm text-text/60">
            Approved on {new Date(version.approvedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">
          {version.sections.length > 0 ? (
            version.sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg border border-text/10 bg-white p-6"
              >
                <h2 className="mb-4 font-heading text-xl font-semibold text-text">
                  {section.title}
                </h2>
                {section.items.length > 0 ? (
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="border-l-2 border-accent pl-4"
                      >
                        <h3 className="font-medium text-text">{item.title}</h3>
                        <p className="mt-1 text-sm text-text/70">
                          {item.description}
                        </p>
                        {item.acceptanceCriteria && (
                          <p className="mt-2 text-sm text-text/60">
                            Acceptance: {item.acceptanceCriteria}
                          </p>
                        )}
                        <span className="mt-2 inline-block rounded-full bg-text/5 px-2 py-1 text-xs font-medium text-text/70">
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text/60">No items</p>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-text/10 bg-white p-6">
              <p className="text-center text-text/60">No sections defined</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
