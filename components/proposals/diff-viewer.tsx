/**
 * Diff Viewer Component
 *
 * Displays persisted canonical diff summary.
 * NEVER recomputes diffs - always reads from diffSummaryJson.
 */

import { DiffSummaryV1 } from "@/lib/canonical-diff";
import { Plus, Minus, Edit, Move, FileText } from "lucide-react";

interface DiffViewerProps {
  diffSummary: DiffSummaryV1;
}

export function DiffViewer({ diffSummary }: DiffViewerProps) {
  const { changes, summary } = diffSummary;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-md border border-green-200 bg-green-50">
          <div className="text-sm text-green-700 mb-1">Added</div>
          <div className="text-2xl font-semibold text-green-800">
            {summary.sectionsAdded + summary.itemsAdded}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {summary.sectionsAdded} sections, {summary.itemsAdded} items
          </div>
        </div>

        <div className="p-4 rounded-md border border-red-200 bg-red-50">
          <div className="text-sm text-red-700 mb-1">Removed</div>
          <div className="text-2xl font-semibold text-red-800">
            {summary.sectionsRemoved + summary.itemsRemoved}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {summary.sectionsRemoved} sections, {summary.itemsRemoved} items
          </div>
        </div>

        <div className="p-4 rounded-md border border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-700 mb-1">Modified</div>
          <div className="text-2xl font-semibold text-blue-800">
            {summary.sectionsModified + summary.itemsModified}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {summary.sectionsModified} sections, {summary.itemsModified} items
          </div>
        </div>

        <div className="p-4 rounded-md border border-purple-200 bg-purple-50">
          <div className="text-sm text-purple-700 mb-1">Moved</div>
          <div className="text-2xl font-semibold text-purple-800">
            {summary.itemsMoved}
          </div>
          <div className="text-xs text-purple-600 mt-1">items reordered</div>
        </div>
      </div>

      {/* Detailed Changes */}
      <div className="rounded-lg border border-text/10 bg-white">
        <div className="p-6 border-b border-text/10">
          <h3 className="font-heading text-lg font-semibold text-text flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detailed Changes ({summary.totalChanges})
          </h3>
          <p className="text-sm text-text/60 mt-1">
            Computed at: {new Date(diffSummary.computedAt).toLocaleString()}
          </p>
        </div>

        {changes.length === 0 ? (
          <div className="p-6 text-center text-text/50">No changes detected</div>
        ) : (
          <div className="divide-y divide-text/10">
            {changes.map((change, index) => (
              <div key={change.changeId} className="p-6">
                {/* Change Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {change.changeType === "ADD" && (
                      <div className="p-2 rounded-full bg-green-100">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                    {change.changeType === "REMOVE" && (
                      <div className="p-2 rounded-full bg-red-100">
                        <Minus className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    {change.changeType === "MODIFY" && (
                      <div className="p-2 rounded-full bg-blue-100">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    {change.changeType === "MOVE" && (
                      <div className="p-2 rounded-full bg-purple-100">
                        <Move className="w-4 h-4 text-purple-600" />
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-text">
                        {change.changeType} {change.entityType.toLowerCase()}
                      </div>
                      <div className="text-sm text-text/60">
                        Section {change.sectionIndex + 1}
                        {change.itemIndex !== null && `, Item ${change.itemIndex + 1}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-text/40">
                    {change.changeId.substring(0, 8)}
                  </div>
                </div>

                {/* Before/After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  {change.before && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4">
                      <div className="text-xs font-medium text-red-700 mb-2 uppercase">
                        Before
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-red-800">ID:</span>{" "}
                          <span className="font-mono text-red-600">{change.before.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-red-800">Title:</span>{" "}
                          <span className="text-red-700">{change.before.title}</span>
                        </div>
                        {change.before.description && (
                          <div>
                            <span className="font-medium text-red-800">Description:</span>{" "}
                            <span className="text-red-700">{change.before.description}</span>
                          </div>
                        )}
                        {change.before.priority && (
                          <div>
                            <span className="font-medium text-red-800">Priority:</span>{" "}
                            <span className="text-red-700 capitalize">
                              {change.before.priority.toLowerCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* After */}
                  {change.after && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-4">
                      <div className="text-xs font-medium text-green-700 mb-2 uppercase">
                        After
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-green-800">ID:</span>{" "}
                          <span className="font-mono text-green-600">{change.after.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Title:</span>{" "}
                          <span className="text-green-700">{change.after.title}</span>
                        </div>
                        {change.after.description && (
                          <div>
                            <span className="font-medium text-green-800">Description:</span>{" "}
                            <span className="text-green-700">{change.after.description}</span>
                          </div>
                        )}
                        {change.after.priority && (
                          <div>
                            <span className="font-medium text-green-800">Priority:</span>{" "}
                            <span className="text-green-700 capitalize">
                              {change.after.priority.toLowerCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Field Changes */}
                {change.fieldChanges && change.fieldChanges.length > 0 && (
                  <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="text-xs font-medium text-blue-700 mb-2 uppercase">
                      Field Changes
                    </div>
                    <div className="space-y-2">
                      {change.fieldChanges.map((fieldChange, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-blue-800 capitalize">
                            {fieldChange.field}:
                          </span>{" "}
                          <span className="text-red-600 line-through">
                            {fieldChange.oldValue || "null"}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-600 font-medium">
                            {fieldChange.newValue || "null"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="text-xs text-text/50 border-t border-text/10 pt-4">
        <p>
          Diff Version: {diffSummary.version} | Base Version: {diffSummary.baseVersionId} | Proposed:{" "}
          {diffSummary.proposedVersionId}
        </p>
        <p className="mt-1 font-medium text-text/60">
          ⚠️ This diff was computed once at submission and is never recomputed. It represents the
          exact state at the time of submission.
        </p>
      </div>
    </div>
  );
}
