import { requireUser } from "@/lib/session";
import { requireProjectMember } from "@/lib/rbac";
import { notFound } from "next/navigation";
import { getProjectAuditLog } from "@/lib/audit-log";
import { AuditLogViewer } from "@/components/audit/audit-log-viewer";
import { prisma } from "@/lib/prisma";

interface AuditPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function AuditPage({ params }: AuditPageProps) {
  const user = await requireUser();
  const { projectId } = await params;

  // Get project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    notFound();
  }

  // Enforce permission
  await requireProjectMember(projectId, user.id);

  // Get audit events
  const { events, total } = await getProjectAuditLog(projectId, { limit: 100 });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Audit Log
        </h1>
        <p className="mt-2 text-text/70">
          Complete append-only history of all actions in this project
        </p>
      </div>

      <div className="rounded-lg border border-text/10 bg-white p-6">
        <AuditLogViewer events={events as any} total={total} />
      </div>
    </div>
  );
}
