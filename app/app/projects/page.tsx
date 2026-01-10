import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderKanban, Users, Calendar, FileText } from "lucide-react";

export default async function ProjectsPage() {
  const user = await requireUser();

  // Fetch user's projects
  const projects = await prisma.project.findMany({
    where: {
      memberships: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      workspace: {
        select: {
          name: true,
        },
      },
      clientOrg: {
        select: {
          name: true,
        },
      },
      memberships: {
        select: {
          id: true,
        },
      },
      scopeVersions: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text">
            Projects
          </h1>
          <p className="mt-2 text-text/70">
            Manage your scope agreement projects
          </p>
        </div>
        <Link
          href="/app/projects/new"
          className="rounded-md bg-accent px-4 py-2 font-medium !text-white transition-colors hover:bg-accent/90"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-text/10 bg-white p-8">
          <p className="text-center text-text/60">
            No projects yet. Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/app/projects/${project.id}`}
              className="block bg-white rounded-lg border border-text/10 p-6 hover:border-accent/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-semibold text-text truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-text/60 mt-0.5">
                    {project.status === "DRAFT" && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Draft
                      </span>
                    )}
                    {project.status === "ACTIVE" && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Active
                      </span>
                    )}
                    {project.status === "RELEASED" && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Released
                      </span>
                    )}
                    {project.status === "ARCHIVED" && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        Archived
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-sm text-text/70 line-clamp-2 mb-4">
                {project.clientSummary}
              </p>

              <div className="space-y-2 text-xs text-text/60">
                {project.clientOrg && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.clientOrg.name}</span>
                  </div>
                )}
                {project.workspace && (
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>{project.workspace.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{project.scopeVersions.length} version{project.scopeVersions.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Updated {new Date(project.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
