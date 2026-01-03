"use client";

import { useState } from "react";
import { ScopeItemPriority } from "@prisma/client";
import {
  addProposalSection,
  updateProposalSection,
  deleteProposalSection,
  addProposalItem,
  updateProposalItem,
  deleteProposalItem,
  copyFromBaseVersion,
} from "@/lib/proposal-actions";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react";

type ProposalSection = {
  id: string;
  title: string;
  orderIndex: number;
  items: ProposalItem[];
};

type ProposalItem = {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string | null;
  priority: ScopeItemPriority;
  orderIndex: number;
};

type ProposalEditorProps = {
  proposalId: string;
  sections: ProposalSection[];
  isBaseEmpty: boolean;
};

export function ProposalEditor({
  proposalId,
  sections: initialSections,
  isBaseEmpty,
}: ProposalEditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleCopyFromBase = async () => {
    setIsLoading(true);
    try {
      await copyFromBaseVersion(proposalId);
      window.location.reload(); // Reload to show copied content
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to copy from base version");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async () => {
    const title = prompt("Section title:");
    if (!title) return;

    setIsLoading(true);
    try {
      await addProposalSection(proposalId, { title });
      window.location.reload(); // Simple reload for now
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add section");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its items?")) return;

    setIsLoading(true);
    try {
      await deleteProposalSection(sectionId);
      setSections(sections.filter((s) => s.id !== sectionId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete section");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (sectionId: string) => {
    const title = prompt("Item title:");
    if (!title) return;

    const description = prompt("Item description:") || "";

    setIsLoading(true);
    try {
      await addProposalItem(sectionId, {
        title,
        description,
        priority: "MUST",
      });
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, sectionId: string) => {
    if (!confirm("Delete this item?")) return;

    setIsLoading(true);
    try {
      await deleteProposalItem(itemId);
      setSections(
        sections.map((s) =>
          s.id === sectionId
            ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
            : s
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold text-gray-900">
          Scope Items
        </h2>
        <div className="flex gap-3">
          {!isBaseEmpty && sections.length === 0 && (
            <button
              onClick={handleCopyFromBase}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Copy from Current Version
            </button>
          )}
          <button
            onClick={handleAddSection}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No sections yet. Add your first section to get started.</p>
          {!isBaseEmpty && (
            <button
              onClick={handleCopyFromBase}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-accent hover:text-accent/90"
            >
              Or copy from current version
            </button>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(section.id);

          return (
            <div
              key={section.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {sectionIndex + 1}. {section.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {section.items.length} item{section.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddItem(section.id)}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs font-medium text-accent hover:text-accent/90 disabled:opacity-50"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={isLoading}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section Items */}
              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {section.items.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No items in this section. Click "Add Item" to create one.
                    </div>
                  ) : (
                    section.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="px-4 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {sectionIndex + 1}.{itemIndex + 1} {item.title}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                                    item.priority === "MUST"
                                      ? "bg-red-100 text-red-700"
                                      : item.priority === "SHOULD"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.priority}
                                </span>
                                <button
                                  onClick={() => handleDeleteItem(item.id, section.id)}
                                  disabled={isLoading}
                                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            {item.acceptanceCriteria && (
                              <div className="mt-2 pl-4 border-l-2 border-accent/30">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Acceptance Criteria:
                                </p>
                                <p className="text-xs text-gray-600">
                                  {item.acceptanceCriteria}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
