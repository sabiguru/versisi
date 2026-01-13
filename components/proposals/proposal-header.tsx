"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProposalDetails, submitProposalForApproval, withdrawProposal } from "@/lib/proposal-actions";
import { ProposalStatus, ImpactLevel, RiskLevel } from "@prisma/client";
import { Send, Save } from "lucide-react";

type ProposalHeaderProps = {
  proposalId: string;
  projectId: string;
  status: ProposalStatus;
  title: string;
  changeNote: string;
  rationale: string;
  impactTimeline: ImpactLevel;
  impactCost: ImpactLevel;
  risk: RiskLevel;
};

export function ProposalHeader({
  proposalId,
  projectId,
  status,
  title: initialTitle,
  changeNote: initialChangeNote,
  rationale: initialRationale,
  impactTimeline: initialImpactTimeline,
  impactCost: initialImpactCost,
  risk: initialRisk,
}: ProposalHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [changeNote, setChangeNote] = useState(initialChangeNote);
  const [rationale, setRationale] = useState(initialRationale);
  const [impactTimeline, setImpactTimeline] = useState(initialImpactTimeline);
  const [impactCost, setImpactCost] = useState(initialImpactCost);
  const [risk, setRisk] = useState(initialRisk);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProposalDetails(proposalId, {
        title,
        changeNote,
        rationale,
        impactTimeline,
        impactCost,
        risk,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Submit this proposal for approval? You won't be able to edit it after submission.")) {
      return;
    }

    setIsLoading(true);
    try {
      await submitProposalForApproval(proposalId);
      router.push(`/app/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this proposal? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      await withdrawProposal(proposalId);
      router.push(`/app/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to withdraw");
    } finally {
      setIsLoading(false);
    }
  };

  const isDraft = status === "DRAFT";
  const canWithdraw = ["DRAFT", "INTERNAL_REVIEW", "AWAITING_APPROVAL"].includes(status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <div className="space-y-6">
        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              status === "DRAFT"
                ? "bg-gray-100 text-gray-700"
                : status === "AWAITING_APPROVAL"
                ? "bg-yellow-100 text-yellow-700"
                : status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Title
          </label>
          {isEditing && isDraft ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
            />
          ) : (
            <p className="text-sm text-gray-900">{title}</p>
          )}
        </div>

        {/* Change Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Summary
          </label>
          {isEditing && isDraft ? (
            <textarea
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
            />
          ) : (
            <p className="text-sm text-gray-600">{changeNote}</p>
          )}
        </div>

        {/* Rationale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rationale
          </label>
          {isEditing && isDraft ? (
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
            />
          ) : (
            <p className="text-sm text-gray-600">{rationale}</p>
          )}
        </div>

        {/* Impact & Risk */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeline Impact
            </label>
            {isEditing && isDraft ? (
              <select
                value={impactTimeline}
                onChange={(e) => setImpactTimeline(e.target.value as ImpactLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
              >
                <option value="NONE">None</option>
                <option value="MINOR">Minor</option>
                <option value="MAJOR">Major</option>
              </select>
            ) : (
              <p className="text-sm text-gray-600">{impactTimeline}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Impact
            </label>
            {isEditing && isDraft ? (
              <select
                value={impactCost}
                onChange={(e) => setImpactCost(e.target.value as ImpactLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
              >
                <option value="NONE">None</option>
                <option value="MINOR">Minor</option>
                <option value="MAJOR">Major</option>
              </select>
            ) : (
              <p className="text-sm text-gray-600">{impactCost}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            {isEditing && isDraft ? (
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-accent focus:border-accent"
              >
                <option value="LOW">Low</option>
                <option value="MED">Medium</option>
                <option value="HIGH">High</option>
              </select>
            ) : (
              <p className="text-sm text-gray-600">{risk}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isDraft && (
          <div className="space-y-2 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Edit Details
                </button>
              </>
            )}
          </div>
        )}

        {/* Withdraw Button */}
        {canWithdraw && (
          <div className="pt-2">
            <button
              onClick={handleWithdraw}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              Withdraw Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
