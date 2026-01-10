"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProject } from "./actions";

interface Project {
  id: string;
  name: string;
  clientSummary: string;
  internalDescription: string | null;
  clientOrgId: string | null;
  workspaceId: string | null;
  status: string;
}

interface ClientOrg {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface EditProjectFormProps {
  project: Project;
  clientOrgs: ClientOrg[];
  workspaces: Workspace[];
}

export function EditProjectForm({
  project,
  clientOrgs,
  workspaces,
}: EditProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProject(project.id, formData);

    setIsSubmitting(false);

    if (result.success) {
      router.push(`/app/projects/${project.id}`);
      router.refresh();
    } else {
      setError(result.error || "Failed to update project");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/app/projects/${project.id}`}
          className="text-sm text-accent hover:underline"
        >
          ← Back to Project
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Edit Project
        </h1>
        <p className="mt-2 text-text/70">
          Update your project details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-text mb-6">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text mb-2"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={project.name}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g., Website Redesign 2024"
              />
            </div>

            <div>
              <label
                htmlFor="clientSummary"
                className="block text-sm font-medium text-text mb-2"
              >
                Client Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="clientSummary"
                name="clientSummary"
                required
                defaultValue={project.clientSummary}
                rows={3}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Brief description visible to client..."
              />
              <p className="mt-1 text-xs text-text/60">
                This summary will be visible to the client
              </p>
            </div>

            <div>
              <label
                htmlFor="internalDescription"
                className="block text-sm font-medium text-text mb-2"
              >
                Internal Description
              </label>
              <textarea
                id="internalDescription"
                name="internalDescription"
                defaultValue={project.internalDescription || ""}
                rows={3}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Internal notes (not visible to client)..."
              />
              <p className="mt-1 text-xs text-text/60">
                For internal team use only - not visible to client
              </p>
            </div>

            <div>
              <label
                htmlFor="clientOrgId"
                className="block text-sm font-medium text-text mb-2"
              >
                Client Organization
              </label>
              <select
                id="clientOrgId"
                name="clientOrgId"
                defaultValue={project.clientOrgId || ""}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">No client organization</option>
                {clientOrgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="workspaceId"
                className="block text-sm font-medium text-text mb-2"
              >
                Workspace
              </label>
              <select
                id="workspaceId"
                name="workspaceId"
                defaultValue={project.workspaceId || ""}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">No workspace</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-text mb-2"
              >
                Project Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={project.status}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="RELEASED">Released</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/app/projects/${project.id}`}
            className="px-6 py-2 text-sm font-medium text-text border border-text/20 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
