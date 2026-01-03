"use client";

import { useState } from "react";
import { Check, FileCheck, AlertCircle } from "lucide-react";

interface SignatureFormProps {
  recipientId: string;
  recipientEmail: string;
  recipientName: string | null;
  onSign: (data: {
    recipientId: string;
    typedName: string;
    title?: string;
    attestConfirmed: boolean;
  }) => Promise<void>;
  onDecline?: (data: { recipientId: string; reason: string }) => Promise<void>;
}

export function SignatureForm({
  recipientId,
  recipientEmail,
  recipientName,
  onSign,
  onDecline,
}: SignatureFormProps) {
  const [typedName, setTypedName] = useState(recipientName || "");
  const [title, setTitle] = useState("");
  const [attestConfirmed, setAttestConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decline state
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!typedName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!attestConfirmed) {
      setError("You must confirm the attestation to sign");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSign({
        recipientId,
        typedName: typedName.trim(),
        title: title.trim() || undefined,
        attestConfirmed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign agreement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!declineReason.trim()) {
      setError("Please provide a reason for declining");
      return;
    }

    if (!onDecline) return;

    try {
      setIsSubmitting(true);
      await onDecline({
        recipientId,
        reason: declineReason.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline approval"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDeclining) {
    return (
      <form onSubmit={handleDecline} className="space-y-6">
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Decline Approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please provide a reason for declining this approval request. The
                proposal will be marked as rejected.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="decline-reason"
            className="block text-sm font-medium text-text mb-2"
          >
            Reason for Declining
          </label>
          <textarea
            id="decline-reason"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Explain why you are declining this approval..."
            rows={4}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-text bg-background disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !declineReason.trim()}
            className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Declining..." : "Confirm Decline"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDeclining(false);
              setDeclineReason("");
              setError(null);
            }}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-text/70 hover:bg-text/5 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSign} className="space-y-6">
      {/* Attestation Statement */}
      <div className="rounded-md bg-accent/10 border border-accent/30 p-6">
        <h3 className="font-heading text-lg font-semibold text-text mb-3 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-accent" />
          Attestation Statement
        </h3>
        <div className="prose prose-sm max-w-none text-text/80 space-y-3">
          <p>
            By signing below, I hereby acknowledge and agree to the following:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              I have reviewed the proposed scope changes and understand the
              implications.
            </li>
            <li>
              I confirm that the information presented is accurate to the best
              of my knowledge.
            </li>
            <li>
              I agree to the terms and accept the proposed scope version as
              legally binding.
            </li>
            <li>
              This electronic signature has the same legal effect as a
              handwritten signature.
            </li>
          </ul>
        </div>
      </div>

      {/* Signature Fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="typed-name"
            className="block text-sm font-medium text-text mb-2"
          >
            Full Name (Type to Sign) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="typed-name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Enter your full legal name"
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text bg-background disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-text/50">
            Your typed name serves as your electronic signature
          </p>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-text mb-2"
          >
            Title / Role (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Project Manager, CTO, etc."
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text bg-background disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text/70 mb-1">
            Email Address
          </label>
          <div className="px-4 py-2.5 border border-text/20 rounded-md bg-text/5 text-text/60 text-sm">
            {recipientEmail}
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="border-t border-text/10 pt-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={attestConfirmed}
            onChange={(e) => setAttestConfirmed(e.target.checked)}
            disabled={isSubmitting}
            required
            className="mt-1 w-5 h-5 text-accent focus:ring-accent focus:ring-2 rounded border-text/30 disabled:opacity-50 cursor-pointer"
          />
          <span className="text-sm text-text group-hover:text-text/80 select-none">
            I confirm that I have read and agree to the attestation statement
            above. I understand that my electronic signature is legally binding.
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !typedName.trim() || !attestConfirmed}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-5 h-5" />
          {isSubmitting ? "Signing..." : "Sign Agreement"}
        </button>

        {onDecline && (
          <button
            type="button"
            onClick={() => setIsDeclining(true)}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-text/70 hover:bg-text/5 rounded-md transition-colors disabled:opacity-50"
          >
            Decline
          </button>
        )}
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-text/50 border-t border-text/10 pt-4">
        <p>
          Your IP address and browser information will be recorded as part of
          the audit trail for legal verification purposes.
        </p>
      </div>
    </form>
  );
}
