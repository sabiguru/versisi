import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TeamPageClient } from "./page-client";

export default async function ProjectTeamPage({
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
        include: {
          user: { select: { id: true, name: true, email: true } },
          clientUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ party: "asc" }, { role: "asc" }],
      },
    },
  });

  if (!project) {
    redirect("/app/projects");
  }

  type Membership = NonNullable<typeof project>["memberships"][number];

  // Check user has access
  const userMembership = project.memberships.find((m: Membership) => m.userId === userId);
  if (!userMembership) {
    redirect("/app/projects");
  }

  const isLeader = userMembership.role === "LEADER";

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
            Team Management
          </h1>
          <p className="mt-2 text-text/70">
            Manage team members and their roles for {project.name}
          </p>
        </div>

        <TeamPageClient
          projectId={projectId}
          memberships={project.memberships.map((m: Membership) => ({
            id: m.id,
            party: m.party,
            role: m.role,
            userId: m.userId,
            clientUserId: m.clientUserId,
            user: m.user
              ? { id: m.user.id, name: m.user.name, email: m.user.email }
              : null,
            clientUser: m.clientUser
              ? { id: m.clientUser.id, name: m.clientUser.name, email: m.clientUser.email }
              : null,
          }))}
          isLeader={isLeader}
        />
      </div>
    </div>
  );
}
