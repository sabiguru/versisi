import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, Mail, Calendar, Shield, Key, Bell, Database } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();

  // Fetch user's project memberships count
  const projectCount = await prisma.projectMembership.count({
    where: { userId: user.id },
  });

  // Fetch user's workspace memberships
  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Settings
        </h1>
        <p className="mt-2 text-text/70">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg border border-text/10 p-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Profile</span>
                </a>
              </li>
              <li>
                <a
                  href="#account"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text hover:bg-gray-50 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Account</span>
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text hover:bg-gray-50 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Security</span>
                </a>
              </li>
              <li>
                <a
                  href="#workspaces"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text hover:bg-gray-50 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Workspaces</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <section id="profile" className="bg-white rounded-lg border border-text/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-text">
                Profile Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text/70 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
                    <p className="text-text">{user.email}</p>
                  </div>
                  {user.emailVerified && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      Verified
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/70 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Display Name
                  </label>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
                    <p className="text-text">{user.name || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Member Since
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg border border-text/10">
                  <p className="text-text">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-text/10">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-text border border-text/20 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled
                >
                  Edit Profile (Coming Soon)
                </button>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section id="account" className="bg-white rounded-lg border border-text/10 p-6">
            <h2 className="font-heading text-xl font-semibold text-text mb-6">
              Account Overview
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    PROJECTS
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {projectCount}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-xs font-medium text-purple-700 mb-1">
                    WORKSPACES
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {workspaceMemberships.length}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-text/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">Account Status</p>
                    <p className="text-xs text-text/60 mt-1">
                      Your account is active and in good standing
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className="bg-white rounded-lg border border-text/10 p-6">
            <h2 className="font-heading text-xl font-semibold text-text mb-6">
              Security & Authentication
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-text mb-2">
                  Authentication Methods
                </p>
                <p className="text-xs text-text/60">
                  This account uses passwordless authentication via email OTP and social login providers (Google, GitHub, GitLab).
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-text">
                    Connected Accounts
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    Manage social login providers (Google, GitHub, GitLab)
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-text border border-text/20 rounded-lg hover:bg-white transition-colors"
                  disabled
                >
                  Manage (Coming Soon)
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-text">
                    Email Verification
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    {user.emailVerified
                      ? "Your email is verified"
                      : "Verify your email for additional security"}
                  </p>
                </div>
                {!user.emailVerified && (
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-text border border-text/20 rounded-lg hover:bg-white transition-colors"
                    disabled
                  >
                    Verify (Coming Soon)
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-text">
                    Session Management
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    View and manage active sessions
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-text border border-text/20 rounded-lg hover:bg-white transition-colors"
                  disabled
                >
                  Manage (Coming Soon)
                </button>
              </div>
            </div>
          </section>

          {/* Workspaces Section */}
          <section id="workspaces" className="bg-white rounded-lg border border-text/10 p-6">
            <h2 className="font-heading text-xl font-semibold text-text mb-6">
              Workspaces
            </h2>

            {workspaceMemberships.length > 0 ? (
              <div className="space-y-3">
                {workspaceMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between p-4 border border-text/10 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-text">
                        {membership.workspace.name}
                      </p>
                      <p className="text-xs text-text/60 mt-1">
                        Role: {membership.role}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {membership.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-text/30 mx-auto mb-3" />
                <p className="text-text/60">No workspaces yet</p>
                <p className="text-xs text-text/50 mt-1">
                  Workspaces help you organize projects and teams
                </p>
              </div>
            )}
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-lg border border-red-200 p-6">
            <h2 className="font-heading text-xl font-semibold text-red-700 mb-4">
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-medium text-text">
                    Delete Account
                  </p>
                  <p className="text-xs text-text/60 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                  disabled
                >
                  Delete (Coming Soon)
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
