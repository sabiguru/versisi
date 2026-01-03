import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
            <p className="text-sm text-text/60">No pending approvals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
