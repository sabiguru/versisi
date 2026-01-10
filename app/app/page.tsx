import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderKanban, Users, FileCheck, Settings, Plus, BarChart3 } from "lucide-react";

export default async function AppDashboardPage() {
  const user = await requireUser();

  // Fetch user's stats
  const [projectCount, clientCount, pendingApprovals] = await Promise.all([
    prisma.project.count({
      where: {
        memberships: {
          some: {
            userId: user.id,
          },
        },
      },
    }),
    prisma.clientOrg.count(),
    prisma.approvalRequest.count({
      where: {
        status: "PENDING",
        project: {
          memberships: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    }),
  ]);

  // Fetch recent projects
  const recentProjects = await prisma.project.findMany({
    where: {
      memberships: {
        some: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="font-heading text-3xl font-semibold text-gray-900">
            Welcome back, {user.name || user.email?.split("@")[0]}
          </h1>
          <p className="mt-1 text-gray-600">
            Here&apos;s what&apos;s happening with your projects
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/app/projects"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-accent/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{projectCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/app/clients"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-accent/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{clientCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/app/projects/new"
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">New Project</span>
                </Link>

                <Link
                  href="/app/projects"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <FolderKanban className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">View All Projects</span>
                </Link>

                <Link
                  href="/app/clients"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Manage Clients</span>
                </Link>

                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/app/projects" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Link
                    href="/app/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first project
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/app/projects/${project.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-accent/50 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FolderKanban className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : project.status === "DRAFT"
                            ? "bg-gray-100 text-gray-700"
                            : project.status === "RELEASED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {project.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
