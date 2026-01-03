"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDraftProposal } from "@/lib/proposal-actions";

export function CreateProposalButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [rationale, setRationale] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !changeNote.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      // Get the latest scope version to use as base
      const response = await fetch(`/api/projects/${projectId}/current-version`);
      const data = await response.json();
      
      if (!data.versionId) {
        alert("No base version found");
        return;
      }

      const proposalId = await createDraftProposal({
        projectId,
        baseScopeVersionId: data.versionId,
        title: title.trim(),
        changeNote: changeNote.trim(),
        rationale: rationale.trim() || "Proposed scope change",
        requestedByParty: "DEV", // TODO: get from user's membership
      });

      router.push(`/app/projects/${projectId}/proposals/${proposalId}`);
    } catch (error: any) {
      alert(error.message || "Failed to create proposal");
      setIsCreating(false);
    }
  };

  if (!showDialog) {
    return (
      <button
        onClick={() => setShowDialog(true)}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium !text-white hover:bg-accent/90"
      >
        Create Proposal
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 font-heading text-xl font-semibold text-text">
          Create New Proposal
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text/70">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-text/20 px-3 py-2 text-sm"
              placeholder="e.g., Add user authentication"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text/70">
              Change Note *
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              className="mt-1 w-full rounded-md border border-text/20 px-3 py-2 text-sm"
              placeholder="Brief summary of changes"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text/70">
              Rationale (optional)
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="mt-1 w-full rounded-md border border-text/20 px-3 py-2 text-sm"
              placeholder="Why is this change needed?"
              rows={3}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowDialog(false)}
            className="flex-1 rounded-md border border-text/20 px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium !text-white hover:bg-accent/90 disabled:opacity-50"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
