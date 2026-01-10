"use client";

import { useState } from "react";
import { ClientForm } from "./client-form";
import { deleteClientOrg } from "./actions";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

interface ClientOrg {
  id: string;
  name: string;
  _count: {
    projects: number;
    clientUsers: number;
  };
}

interface ClientsPageClientProps {
  clientOrgs: ClientOrg[];
}

export function ClientsPageClient({ clientOrgs: initialClientOrgs }: ClientsPageClientProps) {
  const [clientOrgs, setClientOrgs] = useState(initialClientOrgs);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrg | null>(null);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingClient(null);
    window.location.reload(); // Reload to get fresh data
  };

  const handleDelete = async (clientOrg: ClientOrg) => {
    if (
      !confirm(
        `Are you sure you want to delete "${clientOrg.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await deleteClientOrg(clientOrg.id);

    if (result.success) {
      setClientOrgs(clientOrgs.filter((c) => c.id !== clientOrg.id));
    } else {
      alert(result.error || "Failed to delete client organization");
    }
  };

  const handleEdit = (clientOrg: ClientOrg) => {
    setEditingClient(clientOrg);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-text">Clients</h1>
          <p className="mt-2 text-text/70">Manage client organizations and contacts</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client Organization
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-text/10 bg-white p-6">
          <h2 className="mb-6 font-heading text-xl font-semibold text-text">
            {editingClient ? "Edit Client Organization" : "New Client Organization"}
          </h2>
          <ClientForm
            clientOrg={editingClient || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {clientOrgs.length === 0 ? (
        <div className="rounded-lg border border-text/10 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-text/30 mb-4" />
          <p className="text-text/60 mb-2">No client organizations yet</p>
          <p className="text-sm text-text/50">
            Create your first client organization to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clientOrgs.map((clientOrg) => (
            <div
              key={clientOrg.id}
              className="rounded-lg border border-text/10 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-accent" />
                    <h3 className="font-heading text-lg font-semibold text-text">
                      {clientOrg.name}
                    </h3>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-text/50">
                    <span>{clientOrg._count.projects} project(s)</span>
                    <span>•</span>
                    <span>{clientOrg._count.clientUsers} user(s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(clientOrg)}
                    className="p-2 text-text/60 hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(clientOrg)}
                    className="p-2 text-text/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
