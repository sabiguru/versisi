"use client";

import { useState } from "react";
import { createClientOrg, updateClientOrg } from "./actions";

interface ClientOrg {
  id: string;
  name: string;
}

interface ClientFormProps {
  clientOrg?: ClientOrg;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ clientOrg, onSuccess, onCancel }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = clientOrg
      ? await updateClientOrg(clientOrg.id, formData)
      : await createClientOrg(formData);

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Failed to save client organization");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={clientOrg?.name || ""}
          className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="e.g., Acme Corporation"
        />
        <p className="mt-1 text-xs text-text/60">
          Name of the client organization you're working with
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : clientOrg ? "Update Client" : "Create Client"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-text border border-text/20 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
