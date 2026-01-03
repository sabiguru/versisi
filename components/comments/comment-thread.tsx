"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Check, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { CommentThread as CommentThreadType, CommentMessage, User, ClientUser } from "@prisma/client";
import { resolveCommentThread, reopenCommentThread, addCommentMessage } from "@/lib/comments-actions";

type ThreadWithMessages = CommentThreadType & {
  messages: (CommentMessage & {
    createdByUser: Pick<User, "name" | "email"> | null;
    createdByClient: Pick<ClientUser, "name" | "email"> | null;
  })[];
  createdByUser: Pick<User, "name" | "email"> | null;
  createdByClient: Pick<ClientUser, "name" | "email"> | null;
};

interface CommentThreadProps {
  thread: ThreadWithMessages;
  canResolve?: boolean;
  onUpdate?: () => void;
}

export function CommentThread({ thread, canResolve = false, onUpdate }: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResolve = async () => {
    try {
      setIsSubmitting(true);
      await resolveCommentThread(thread.id);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to resolve thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async () => {
    try {
      setIsSubmitting(true);
      await reopenCommentThread(thread.id);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to reopen thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyBody.trim()) return;

    try {
      setIsSubmitting(true);
      await addCommentMessage({
        threadId: thread.id,
        body: replyBody,
      });
      setReplyBody("");
      setIsReplying(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to add reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthorName = (message: (typeof thread.messages)[0]) => {
    return message.createdByUser?.name || message.createdByClient?.name || "Unknown";
  };

  const getAuthorEmail = (message: (typeof thread.messages)[0]) => {
    return message.createdByUser?.email || message.createdByClient?.email || "";
  };

  const isResolved = thread.status === "RESOLVED";
  const firstMessage = thread.messages[0];

  return (
    <div className={`border rounded-lg ${isResolved ? "bg-background/50 border-text/20" : "bg-background border-text/30"}`}>
      {/* Header */}
      <div className="p-4 border-b border-text/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <MessageSquare className="w-5 h-5 text-text/70 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-text">
                  {getAuthorName(firstMessage)}
                </span>
                <span className="text-sm text-text/50">
                  {formatDistanceToNow(new Date(firstMessage.createdAt), { addSuffix: true })}
                </span>
                {thread.visibility === "INTERNAL" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                    Internal
                  </span>
                )}
                {thread.visibility === "SHARED" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600">
                    Shared
                  </span>
                )}
                {isResolved && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                    Resolved
                  </span>
                )}
              </div>

              {thread.field && thread.field !== "GENERAL" && (
                <div className="text-sm text-text/60 mt-1">
                  On: {thread.field.toLowerCase()}
                </div>
              )}

              {thread.quotedText && (
                <blockquote className="mt-2 pl-3 border-l-2 border-accent/50 text-sm text-text/70 italic">
                  {thread.quotedText}
                </blockquote>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canResolve && !isResolved && (
              <button
                onClick={handleResolve}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Resolve
              </button>
            )}
            {canResolve && isResolved && (
              <button
                onClick={handleReopen}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10 rounded-md transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reopen
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-text/5 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-text/70" />
              ) : (
                <ChevronDown className="w-5 h-5 text-text/70" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* First message */}
          <div className="prose prose-sm max-w-none text-text">
            <p className="whitespace-pre-wrap">{firstMessage.body}</p>
          </div>

          {/* Replies */}
          {thread.messages.slice(1).map((message) => (
            <div key={message.id} className="pl-6 border-l-2 border-text/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-text">
                  {getAuthorName(message)}
                </span>
                <span className="text-xs text-text/50">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-text">
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
            </div>
          ))}

          {/* Reply form */}
          {!isResolved && (
            <div className="pt-4 border-t border-text/10">
              {isReplying ? (
                <div className="space-y-3">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full px-3 py-2 border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-text bg-background"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReply}
                      disabled={isSubmitting || !replyBody.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Posting..." : "Reply"}
                    </button>
                    <button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyBody("");
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsReplying(true)}
                  className="text-sm text-accent hover:text-accent/80 font-medium"
                >
                  Reply
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
