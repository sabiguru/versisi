/**
 * Proposal Snapshot Viewer
 *
 * Displays canonical snapshot of proposal for review before signing
 */

import { CanonicalSnapshot } from "@/lib/canonical-snapshot";
import { FileText, GitBranch, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

interface ProposalSnapshotProps {
  snapshot: CanonicalSnapshot;
}

export function ProposalSnapshot({ snapshot }: ProposalSnapshotProps) {
  return (
    <div className="space-y-6">
      {/* Proposal Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-md bg-background border border-text/10">
          <div className="text-sm text-text/60 mb-1">Proposed Version</div>
          <div className="text-2xl font-heading font-semibold text-accent">
            v{snapshot.proposal.proposedVersion}
          </div>
        </div>
        <div className="p-4 rounded-md bg-background border border-text/10">
          <div className="text-sm text-text/60 mb-1">Base Version</div>
          <div className="text-2xl font-heading font-semibold text-text">
            v{snapshot.proposal.baseVersion}
          </div>
        </div>
      </div>

      {/* Change Summary */}
      <div className="rounded-lg border border-text/10 bg-white p-6">
        <h3 className="font-heading text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Change Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-text/70">Title:</span>{" "}
            <span className="text-text">{snapshot.proposal.title}</span>
          </div>
          <div>
            <span className="font-medium text-text/70">Change Note:</span>{" "}
            <span className="text-text">{snapshot.proposal.changeNote}</span>
          </div>
          <div>
            <span className="font-medium text-text/70">Rationale:</span>{" "}
            <span className="text-text">{snapshot.proposal.rationale}</span>
          </div>
          <div>
            <span className="font-medium text-text/70">Requested By:</span>{" "}
            <span className="text-text uppercase">
              {snapshot.proposal.requestedByParty}
            </span>
          </div>
        </div>
      </div>

      {/* Impact Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md border border-text/10 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-text/70">
              Timeline Impact
            </span>
          </div>
          <div className="text-lg font-semibold text-text capitalize">
            {snapshot.proposal.impactTimeline.toLowerCase()}
          </div>
        </div>
        <div className="p-4 rounded-md border border-text/10 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-text/70">
              Cost Impact
            </span>
          </div>
          <div className="text-lg font-semibold text-text capitalize">
            {snapshot.proposal.impactCost.toLowerCase()}
          </div>
        </div>
        <div className="p-4 rounded-md border border-text/10 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-text/70">Risk Level</span>
          </div>
          <div className="text-lg font-semibold text-text capitalize">
            {snapshot.proposal.risk.toLowerCase()}
          </div>
        </div>
      </div>

      {/* Scope Sections */}
      <div className="rounded-lg border border-text/10 bg-white p-6">
        <h3 className="font-heading text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Proposed Scope
        </h3>
        {snapshot.sections.length > 0 ? (
          <div className="space-y-6">
            {snapshot.sections.map((section) => (
              <div key={section.id} className="border-l-4 border-accent/30 pl-4">
                <h4 className="font-heading text-base font-semibold text-text mb-3">
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-md bg-background border border-text/5"
                    >
                      <div className="font-medium text-sm text-text mb-1">
                        {item.title}
                      </div>
                      <div className="text-sm text-text/70 mb-2">
                        {item.description}
                      </div>
                      {item.acceptanceCriteria && (
                        <div className="text-xs text-text/60 border-t border-text/10 pt-2">
                          <span className="font-medium">Acceptance:</span>{" "}
                          {item.acceptanceCriteria}
                        </div>
                      )}
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-text/10 text-text/70 capitalize">
                        {item.priority.toLowerCase()} Priority
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text/60">No sections defined</p>
        )}
      </div>

      {/* Snapshot Metadata */}
      <div className="text-xs text-text/50 border-t border-text/10 pt-4">
        <p>
          Snapshot generated at: {snapshot.metadata.snapshotGeneratedAt}
        </p>
        <p className="mt-1">
          Project: {snapshot.metadata.projectName} (ID:{" "}
          {snapshot.metadata.projectId})
        </p>
        <p className="mt-1">Format version: {snapshot.metadata.snapshotVersion}</p>
      </div>
    </div>
  );
}
