"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { User } from "lucide-react";

interface EditProfileFormProps {
  currentName: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditProfileForm({
  currentName,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Failed to update profile");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-text/70 mb-2"
        >
          <User className="w-4 h-4 inline mr-2" />
          Display Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={currentName || ""}
          required
          maxLength={100}
          className="w-full px-4 py-2 rounded-lg border border-text/20 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Enter your name"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-text border border-text/20 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
