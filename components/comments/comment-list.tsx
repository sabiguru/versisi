"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { CommentThread } from "./comment-thread";
import { CommentComposer } from "./comment-composer";
import { getCommentThreads } from "@/lib/comments-actions";
import { CommentThread as CommentThreadType, CommentMessage, User, ClientUser } from "@prisma/client";

type ThreadWithMessages = CommentThreadType & {
  messages: (CommentMessage & {
    createdByUser: Pick<User, "name" | "email"> | null;
    createdByClient: Pick<ClientUser, "name" | "email"> | null;
  })[];
  createdByUser: Pick<User, "name" | "email"> | null;
  createdByClient: Pick<ClientUser, "name" | "email"> | null;
};

interface CommentListProps {
  projectId: string;
  entityType: "PROPOSAL_ITEM" | "SCOPE_ITEM";
  entityId: string;
  canResolve?: boolean;
  canUseInternal?: boolean;
  showComposer?: boolean;
}

export function CommentList({
  projectId,
  entityType,
  entityId,
  canResolve = false,
  canUseInternal = true,
  showComposer = true,
}: CommentListProps) {
  const [threads, setThreads] = useState<ThreadWithMessages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCommentThreads(projectId, entityType, entityId);
      setThreads(data as ThreadWithMessages[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [projectId, entityType, entityId]);

  const handleCommentCreated = () => {
    setIsComposing(false);
    loadThreads();
  };

  const openThreads = threads.filter((t) => t.status === "OPEN");
  const resolvedThreads = threads.filter((t) => t.status === "RESOLVED");
  const displayThreads = showResolved ? threads : openThreads;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-text/50">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments
            {threads.length > 0 && (
              <span className="text-sm font-normal text-text/50">
                ({openThreads.length} open
                {resolvedThreads.length > 0 && `, ${resolvedThreads.length} resolved`})
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {resolvedThreads.length > 0 && (
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="text-sm text-accent hover:text-accent/80 font-medium"
            >
              {showResolved ? "Hide resolved" : "Show resolved"}
            </button>
          )}
          {showComposer && !isComposing && (
            <button
              onClick={() => setIsComposing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Comment
            </button>
          )}
        </div>
      </div>

      {/* New comment composer */}
      {isComposing && (
        <div className="p-4 border border-accent/30 rounded-lg bg-accent/5">
          <CommentComposer
            projectId={projectId}
            entityType={entityType}
            entityId={entityId}
            onSuccess={handleCommentCreated}
            onCancel={() => setIsComposing(false)}
            canUseInternal={canUseInternal}
          />
        </div>
      )}

      {/* Thread list */}
      {displayThreads.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-text/20 mx-auto mb-3" />
          <p className="text-text/50 text-sm">
            {threads.length === 0
              ? "No comments yet"
              : showResolved
              ? "No comments"
              : "No open comments"}
          </p>
          {showComposer && !isComposing && threads.length === 0 && (
            <button
              onClick={() => setIsComposing(true)}
              className="mt-4 text-sm text-accent hover:text-accent/80 font-medium"
            >
              Start a discussion
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayThreads.map((thread) => (
            <CommentThread
              key={thread.id}
              thread={thread}
              canResolve={canResolve}
              onUpdate={loadThreads}
            />
          ))}
        </div>
      )}
    </div>
  );
}
