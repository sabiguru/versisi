import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Users, Settings, LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/app" className="text-xl font-bold text-gray-900">
              Versisi
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/app/projects"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="font-medium">Projects</span>
              </Link>

              <Link
                href="/app/clients"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Clients</span>
              </Link>

              <Link
                href="/app/settings"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </p>
                  <p className="text-gray-500 text-xs">{session.user?.email}</p>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
