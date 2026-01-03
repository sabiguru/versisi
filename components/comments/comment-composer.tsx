"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { createCommentThread } from "@/lib/comments-actions";
import { CommentVisibility } from "@prisma/client";

interface CommentComposerProps {
  projectId: string;
  entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM";
  entityId: string;
  field?: "TITLE" | "DESCRIPTION" | "ACCEPTANCE" | "GENERAL";
  quotedText?: string;
  anchorMeta?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultVisibility?: CommentVisibility;
  canUseInternal?: boolean;
}

export function CommentComposer({
  projectId,
  entityType,
  entityId,
  field = "GENERAL",
  quotedText,
  anchorMeta,
  onSuccess,
  onCancel,
  defaultVisibility = "SHARED",
  canUseInternal = true,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<CommentVisibility>(defaultVisibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await createCommentThread({
        projectId,
        entityType,
        entityId,
        field,
        quotedText,
        anchorMeta,
        visibility,
        body: body.trim(),
      });

      setBody("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {quotedText && (
        <div className="relative">
          <blockquote className="pl-3 border-l-2 border-accent/50 text-sm text-text/70 italic pr-8">
            {quotedText}
          </blockquote>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-0 right-0 p-1 hover:bg-text/5 rounded transition-colors"
            >
              <X className="w-4 h-4 text-text/50" />
            </button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="comment-body" className="sr-only">
          Comment
        </label>
        <textarea
          id="comment-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={4}
          required
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-text bg-background disabled:opacity-50"
        />
      </div>

      {canUseInternal && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text">Visibility:</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="SHARED"
                checked={visibility === "SHARED"}
                onChange={(e) => setVisibility(e.target.value as CommentVisibility)}
                disabled={isSubmitting}
                className="w-4 h-4 text-accent focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-text">
                Shared
                <span className="text-text/50 ml-1">(visible to both parties)</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="INTERNAL"
                checked={visibility === "INTERNAL"}
                onChange={(e) => setVisibility(e.target.value as CommentVisibility)}
                disabled={isSubmitting}
                className="w-4 h-4 text-accent focus:ring-accent focus:ring-2"
              />
              <span className="text-sm text-text">
                Internal
                <span className="text-text/50 ml-1">(only your team)</span>
              </span>
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageSquarePlus className="w-4 h-4" />
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
