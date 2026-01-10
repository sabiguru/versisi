import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Home,
  Briefcase,
  FileCheck,
  Bell,
  HelpCircle
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
            <Logo href="/app" className="w-[60px] sm:w-[72px] md:w-[88px] lg:w-[108px]" />

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link
                href="/app"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                href="/app/projects"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Projects</span>
              </Link>

              <Link
                href="/app/clients"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Clients</span>
              </Link>

              <Link
                href="/app/workspaces"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Workspaces</span>
              </Link>

              <Link
                href="/app/approvals"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Approvals</span>
              </Link>

              {/* Right Side Menu */}
              <div className="flex items-center gap-1 ml-4 pl-4 border-l border-gray-200">
                <Link
                  href="/app/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {/* Notification badge - can be conditionally shown */}
                  {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                </Link>

                <Link
                  href="/app/settings"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>

                <Link
                  href="/help"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Help & Documentation"
                  target="_blank"
                >
                  <HelpCircle className="w-4 h-4" />
                </Link>

                {/* User Menu Dropdown */}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <div className="text-xs hidden md:block">
                    <p className="font-medium text-gray-900 truncate max-w-[120px]">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </p>
                    <p className="text-gray-500 truncate max-w-[120px]">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/api/auth/signout"
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
