"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelApprovalRequest } from "@/lib/approval-actions";
import { XCircle } from "lucide-react";

interface ApprovalActionsClientProps {
  approvalRequestId: string;
  projectId: string;
  status: string;
  isLeader: boolean;
}

export function ApprovalActionsClient({
  approvalRequestId,
  projectId,
  status,
  isLeader,
}: ApprovalActionsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const canCancel = isLeader && ["PENDING", "VIEWED"].includes(status);

  const handleCancel = async () => {
    if (
      !confirm(
        "Cancel this approval request? All pending signatures will be declined."
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelApprovalRequest(approvalRequestId);
      router.push(`/app/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to cancel");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCancel) return null;

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h3 className="text-sm font-medium text-orange-900 mb-2">
        Approval Actions
      </h3>
      <p className="text-sm text-orange-700 mb-3">
        As a project leader, you can cancel this approval request if needed.
      </p>
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" />
        {isLoading ? "Cancelling..." : "Cancel Approval Request"}
      </button>
    </div>
  );
}
