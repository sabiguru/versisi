import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Settings
        </h1>
        <p className="mt-2 text-text/70">Manage your workspace settings</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-text">
            Profile
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-text/70">Name</dt>
              <dd className="text-text">{user.name || "Not set"}</dd>
            </div>
            <div>
              <dt className="font-medium text-text/70">Email</dt>
              <dd className="text-text">{user.email}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h2 className="mb-4 font-heading text-xl font-semibold text-text">
            Workspace
          </h2>
          <p className="text-sm text-text/60">
            Workspace settings will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}
