import { requireUser } from "@/lib/session";

export default async function AppDashboardPage() {
  const user = await requireUser();

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-semibold text-text">
        Welcome, {user.name || user.email}
      </h1>
      <p className="mt-2 text-text/70">
        This is your protected dashboard. Only authenticated internal users can
        see this page.
      </p>

      <div className="mt-8 rounded-lg border border-text/10 bg-white p-6">
        <h2 className="mb-4 font-heading text-xl font-semibold text-text">
          Your Account
        </h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-text/70">Email</dt>
            <dd className="text-text">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-text/70">Name</dt>
            <dd className="text-text">{user.name || "Not set"}</dd>
          </div>
          <div>
            <dt className="font-medium text-text/70">User ID</dt>
            <dd className="font-mono text-xs text-text/60">{user.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
