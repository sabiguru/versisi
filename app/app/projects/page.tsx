import { requireUser } from "@/lib/session";
import Link from "next/link";

export default async function ProjectsPage() {
  const user = await requireUser();

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

      <div className="rounded-lg border border-text/10 bg-white p-8">
        <p className="text-center text-text/60">
          No projects yet. Create your first project to get started.
        </p>
      </div>
    </div>
  );
}
