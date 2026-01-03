"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignatureForm } from "@/components/approvals/signature-form";
import { ProposalSnapshot } from "@/components/approvals/proposal-snapshot";
import { CanonicalSnapshot } from "@/lib/canonical-snapshot";
import { Check, X, Eye } from "lucide-react";

interface PortalApprovalContentProps {
  approvalRequestId: string;
  recipientId: string | null;
  recipientData: {
    id: string;
    email: string;
    name: string | null;
    status: string;
  } | null;
  snapshot: CanonicalSnapshot;
  allRecipients: Array<{
    id: string;
    email: string;
    name: string | null;
    party: string;
    status: string;
    signedAt: Date | null;
    declinedAt: Date | null;
  }>;
}

export function PortalApprovalContent({
  approvalRequestId,
  recipientId,
  recipientData,
  snapshot,
  allRecipients,
}: PortalApprovalContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);

  const handleSign = async (data: {
    recipientId: string;
    typedName: string;
    title?: string;
    attestConfirmed: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/approvals/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign");
      }

      // Refresh page to show updated status
      router.refresh();
    } catch (error) {
      throw error; // Let SignatureForm handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async (data: {
    recipientId: string;
    reason: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/approvals/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to decline");
      }

      // Refresh page to show updated status
      router.refresh();
    } catch (error) {
      throw error; // Let SignatureForm handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show recipient selector if no recipientId provided
  if (!recipientId || !recipientData) {
    return (
      <div className="rounded-lg border border-text/10 bg-white p-6">
        <h2 className="mb-4 font-heading text-xl font-semibold text-text">
          Select Your Identity
        </h2>
        <p className="text-sm text-text/60 mb-6">
          Please select your email address to view and sign this approval
          request.
        </p>
        <div className="space-y-2">
          {allRecipients.map((recipient) => (
            <a
              key={recipient.id}
              href={`?recipient=${recipient.id}`}
              className="block p-4 border border-text/10 rounded-md hover:bg-background transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text">
                    {recipient.name || recipient.email}
                  </div>
                  <div className="text-sm text-text/60">{recipient.email}</div>
                </div>
                <div className="text-sm">
                  {recipient.status === "SIGNED" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                      <Check className="w-3 h-3" />
                      Signed
                    </span>
                  )}
                  {recipient.status === "DECLINED" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600">
                      <X className="w-3 h-3" />
                      Declined
                    </span>
                  )}
                  {recipient.status === "PENDING" && (
                    <span className="text-accent font-medium">
                      View &rarr;
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Already signed
  if (recipientData.status === "SIGNED") {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-50 p-6">
        <div className="flex items-start gap-3">
          <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-xl font-semibold text-green-800 mb-2">
              Signature Complete
            </h2>
            <p className="text-sm text-green-700">
              You have already signed this approval request. Thank you for your
              confirmation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Declined
  if (recipientData.status === "DECLINED") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-xl font-semibold text-red-800 mb-2">
              Approval Declined
            </h2>
            <p className="text-sm text-red-700">
              You have declined this approval request. The proposal has been
              marked as rejected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pending - show signing interface
  return (
    <div className="space-y-6">
      {/* Snapshot Viewer Toggle */}
      <div className="rounded-lg border border-text/10 bg-white p-4">
        <button
          onClick={() => setShowSnapshot(!showSnapshot)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-semibold text-text">
              {showSnapshot ? "Hide" : "View"} Complete Snapshot
            </span>
          </div>
          <span className="text-sm text-accent">
            {showSnapshot ? "Collapse" : "Expand"}
          </span>
        </button>
      </div>

      {/* Full Snapshot */}
      {showSnapshot && (
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <ProposalSnapshot snapshot={snapshot} />
        </div>
      )}

      {/* Signature Section */}
      <div className="rounded-lg border border-accent/20 bg-white p-6">
        <h2 className="mb-6 font-heading text-xl font-semibold text-text">
          Sign Agreement
        </h2>
        <SignatureForm
          recipientId={recipientData.id}
          recipientEmail={recipientData.email}
          recipientName={recipientData.name}
          onSign={handleSign}
          onDecline={handleDecline}
        />
      </div>

      {/* Other Recipients Status */}
      {allRecipients.length > 1 && (
        <div className="rounded-lg border border-text/10 bg-white p-6">
          <h3 className="font-heading text-lg font-semibold text-text mb-4">
            Approval Status
          </h3>
          <div className="space-y-3">
            {allRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 rounded-md bg-background border border-text/5"
              >
                <div>
                  <div className="font-medium text-sm text-text">
                    {recipient.name || recipient.email}
                  </div>
                  <div className="text-xs text-text/60 uppercase">
                    {recipient.party} Party
                  </div>
                </div>
                <div>
                  {recipient.status === "SIGNED" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                      <Check className="w-3 h-3" />
                      Signed
                    </span>
                  )}
                  {recipient.status === "DECLINED" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600">
                      <X className="w-3 h-3" />
                      Declined
                    </span>
                  )}
                  {recipient.status === "PENDING" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
