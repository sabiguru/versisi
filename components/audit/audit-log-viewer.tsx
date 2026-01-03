"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { History, Filter, User, FileText, CheckCircle, XCircle, MessageSquare, GitBranch } from "lucide-react";

interface AuditEvent {
  id: string;
  action: string;
  createdAt: Date;
  targetType: string | null;
  targetId: string | null;
  metadata: any;
  user: { name: string | null; email: string } | null;
  clientUser: { name: string | null; email: string } | null;
}

interface AuditLogViewerProps {
  events: AuditEvent[];
  total: number;
}

function getEventIcon(action: string) {
  switch (action) {
    case "PROJECT_CREATED":
      return <GitBranch className="w-4 h-4 text-purple-600" />;
    case "PROPOSAL_CREATED":
    case "PROPOSAL_SUBMITTED":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "APPROVAL_SIGNED":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "APPROVAL_DECLINED":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "SCOPE_VERSION_CREATED":
      return <GitBranch className="w-4 h-4 text-accent" />;
    case "COMMENT_CREATED":
    case "COMMENT_RESOLVED":
      return <MessageSquare className="w-4 h-4 text-orange-600" />;
    default:
      return <History className="w-4 h-4 text-text/40" />;
  }
}

function getEventColor(action: string): string {
  switch (action) {
    case "PROJECT_CREATED":
      return "bg-purple-50 border-purple-200";
    case "PROPOSAL_CREATED":
    case "PROPOSAL_SUBMITTED":
      return "bg-blue-50 border-blue-200";
    case "APPROVAL_SIGNED":
      return "bg-green-50 border-green-200";
    case "APPROVAL_DECLINED":
      return "bg-red-50 border-red-200";
    case "SCOPE_VERSION_CREATED":
      return "bg-accent/10 border-accent/30";
    case "COMMENT_CREATED":
    case "COMMENT_RESOLVED":
      return "bg-orange-50 border-orange-200";
    default:
      return "bg-background border-text/10";
  }
}

function formatEventDescription(event: AuditEvent): string {
  const actor = event.user?.name || event.clientUser?.name || event.user?.email || event.clientUser?.email || "System";

  switch (event.action) {
    case "PROJECT_CREATED":
      return `${actor} created the project`;

    case "PROPOSAL_CREATED":
      return `${actor} created proposal "${event.metadata?.proposalTitle || "Untitled"}"`;

    case "PROPOSAL_SUBMITTED":
      return `${actor} submitted proposal "${event.metadata?.proposalTitle || ""}" for approval`;

    case "APPROVAL_VIEWED":
      return `${actor} (${event.metadata?.party}) viewed approval request`;

    case "APPROVAL_SIGNED":
      return `${actor} (${event.metadata?.party}) signed approval as "${event.metadata?.typedName}"`;

    case "APPROVAL_DECLINED":
      return `${actor} (${event.metadata?.party}) declined approval`;

    case "SCOPE_VERSION_CREATED":
      return `Version ${event.metadata?.version} was created (all approvals signed)`;

    case "COMMENT_CREATED":
      return `${actor} created a comment`;

    case "COMMENT_REPLIED":
      return `${actor} replied to a comment`;

    case "COMMENT_RESOLVED":
      return `${actor} resolved a comment thread`;

    case "COMMENT_REOPENED":
      return `${actor} reopened a comment thread`;

    case "PROPOSAL_DIFF_RECOMPUTED":
      return `${actor} manually recomputed proposal diff (admin action)`;

    default:
      return `${actor} performed ${event.action.toLowerCase().replace(/_/g, " ")}`;
  }
}

export function AuditLogViewer({ events, total }: AuditLogViewerProps) {
  const [filterAction, setFilterAction] = useState<string>("");

  const filteredEvents = filterAction
    ? events.filter((e) => e.action === filterAction)
    : events;

  const actionTypes = Array.from(new Set(events.map((e) => e.action))).sort();

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-text/70" />
          <h3 className="font-heading text-lg font-semibold text-text">
            Audit Log
            <span className="text-sm font-normal text-text/50 ml-2">
              ({total} events total)
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text/50" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-sm border border-text/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text bg-background"
          >
            <option value="">All Events</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-text/10" />

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-text/50">
              No events found
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-text/20">
                  {getEventIcon(event.action)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className={`p-4 rounded-lg border ${getEventColor(event.action)}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-text">
                          {formatEventDescription(event)}
                        </div>
                        <div className="text-sm text-text/60 mt-1">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })} •{" "}
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {event.user && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-text/20">
                            <User className="w-3 h-3 text-text/50" />
                            <span className="text-xs text-text/70">Internal</span>
                          </div>
                        )}
                        {event.clientUser && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-text/20">
                            <User className="w-3 h-3 text-text/50" />
                            <span className="text-xs text-text/70">Client</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-text/60 hover:text-text select-none">
                          View metadata
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-white border border-text/10 overflow-x-auto text-text/70">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Target info */}
                    {event.targetType && event.targetId && (
                      <div className="mt-2 text-xs text-text/50">
                        Target: {event.targetType} ({event.targetId.substring(0, 8)}...)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-text/50 border-t border-text/10 pt-4">
        <p className="font-medium">Audit Log Properties:</p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li>Append-only (no deletes or updates)</li>
          <li>Chronological order (oldest to newest)</li>
          <li>Immutable record of all significant events</li>
          <li>Full traceability for compliance and debugging</li>
        </ul>
      </div>
    </div>
  );
}
