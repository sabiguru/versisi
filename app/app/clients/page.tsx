import { requireUser } from "@/lib/session";

export default async function ClientsPage() {
  const user = await requireUser();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Clients
        </h1>
        <p className="mt-2 text-text/70">
          Manage client organizations and contacts
        </p>
      </div>

      <div className="rounded-lg border border-text/10 bg-white p-8">
        <p className="text-center text-text/60">
          No clients yet. Create your first project to add clients.
        </p>
      </div>
    </div>
  );
}
