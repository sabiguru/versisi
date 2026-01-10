import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import { EditProjectForm } from "./edit-project-form";

export default async function EditProjectPage({
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
      workspace: true,
      memberships: {
        where: { userId },
      },
    },
  });

  if (!project || project.memberships.length === 0) {
    redirect("/app/projects");
  }

  // Get available clients and workspaces for dropdowns
  const [clientOrgs, workspaces] = await Promise.all([
    prisma.clientOrg.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <EditProjectForm
          project={project}
          clientOrgs={clientOrgs}
          workspaces={workspaces}
        />
      </div>
    </div>
  );
}
