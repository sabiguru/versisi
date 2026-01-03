/**
 * Canonical Diff Summary (Prompt 12)
 *
 * DETERMINISTIC diff computation between base scope and proposed scope.
 * Diffs are computed ONCE on proposal submit and NEVER recomputed.
 *
 * REQUIREMENTS:
 * - diff_summary_v1 schema
 * - Deterministic changeId hashing
 * - Deterministic ordering
 * - Persist on submit, never recompute at render
 */

import { createHash } from "crypto";
import { prisma } from "./prisma";

/**
 * Canonical Diff Summary Schema v1
 * Stored in ChangeProposal.diffSummaryJson
 */
export interface DiffSummaryV1 {
  version: "1.0";
  baseVersionId: string;
  proposedVersionId: string; // proposalId before approval
  computedAt: string; // ISO 8601
  changes: Array<{
    changeId: string; // SHA-256 hash of change details
    changeType: "ADD" | "REMOVE" | "MODIFY" | "MOVE";
    entityType: "SECTION" | "ITEM";
    sectionIndex: number; // Which section (0-based)
    itemIndex: number | null; // Which item within section (0-based, null for sections)
    before: {
      id: string | null; // Stable ID (src:/new:) or null if adding
      title: string | null;
      description: string | null;
      acceptanceCriteria: string | null;
      priority: string | null;
      orderIndex: number | null;
    } | null;
    after: {
      id: string; // Stable ID (src:/new:)
      title: string;
      description: string | null;
      acceptanceCriteria: string | null;
      priority: string | null;
      orderIndex: number;
    } | null;
    fieldChanges: Array<{
      field: string;
      oldValue: string | null;
      newValue: string | null;
    }> | null;
  }>;
  summary: {
    sectionsAdded: number;
    sectionsRemoved: number;
    sectionsModified: number;
    itemsAdded: number;
    itemsRemoved: number;
    itemsModified: number;
    itemsMoved: number;
    totalChanges: number;
  };
}

/**
 * Compute deterministic changeId for a change
 * Hash includes: changeType, entityType, before, after
 */
function computeChangeId(change: {
  changeType: string;
  entityType: string;
  sectionIndex: number;
  itemIndex: number | null;
  before: any;
  after: any;
}): string {
  // Build canonical change representation
  const canonical = {
    after: change.after,
    before: change.before,
    changeType: change.changeType,
    entityType: change.entityType,
    itemIndex: change.itemIndex,
    sectionIndex: change.sectionIndex,
  };

  // Serialize and hash
  const serialized = JSON.stringify(canonical);
  return createHash("sha256").update(serialized, "utf8").digest("hex");
}

/**
 * Generate stable ID for entity
 */
function getStableId(
  entityId: string,
  sourceScopeEntityId: string | null
): string {
  if (sourceScopeEntityId) {
    return `src:${sourceScopeEntityId}`;
  } else {
    return `new:${entityId}`;
  }
}

/**
 * Compute canonical diff between base scope version and proposal
 *
 * CRITICAL: This is called ONCE during proposal submission and result is persisted.
 * NEVER recompute diffs at render time - always read from diffSummaryJson.
 */
export async function computeCanonicalDiff(
  baseScopeVersionId: string,
  proposalId: string
): Promise<DiffSummaryV1> {
  // Fetch base scope version
  const baseVersion = await prisma.scopeVersion.findUnique({
    where: { id: baseScopeVersionId },
    include: {
      sections: {
        include: {
          items: {
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!baseVersion) {
    throw new Error(`Base scope version ${baseScopeVersionId} not found`);
  }

  // Fetch proposal
  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      sections: {
        include: {
          items: {
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!proposal) {
    throw new Error(`Proposal ${proposalId} not found`);
  }

  const changes: DiffSummaryV1["changes"] = [];
  let sectionsAdded = 0;
  let sectionsRemoved = 0;
  let sectionsModified = 0;
  let itemsAdded = 0;
  let itemsRemoved = 0;
  let itemsModified = 0;
  let itemsMoved = 0;

  // Build maps for efficient lookup
  const baseSectionsMap = new Map(
    baseVersion.sections.map((s) => [s.id, s])
  );
  const proposalSectionsMap = new Map(
    proposal.sections.map((s) => [s.sourceScopeSectionId || s.id, s])
  );

  // Track processed sections
  const processedBaseSections = new Set<string>();
  const processedProposalSections = new Set<string>();

  // Process proposal sections (to find additions and modifications)
  for (let sectionIndex = 0; sectionIndex < proposal.sections.length; sectionIndex++) {
    const proposalSection = proposal.sections[sectionIndex];
    const baseSection = proposalSection.sourceScopeSectionId
      ? baseSectionsMap.get(proposalSection.sourceScopeSectionId)
      : undefined;

    if (!baseSection) {
      // ADDED section
      const change = {
        changeType: "ADD" as const,
        entityType: "SECTION" as const,
        sectionIndex,
        itemIndex: null,
        before: null,
        after: {
          id: getStableId(proposalSection.id, proposalSection.sourceScopeSectionId),
          title: proposalSection.title,
          description: null,
          acceptanceCriteria: null,
          priority: null,
          orderIndex: proposalSection.orderIndex,
        },
        fieldChanges: null,
      };
      changes.push({ ...change, changeId: computeChangeId(change) });
      sectionsAdded++;
    } else {
      // Check if MODIFIED
      processedBaseSections.add(baseSection.id);
      const fieldChanges: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];

      if (baseSection.title !== proposalSection.title) {
        fieldChanges.push({
          field: "title",
          oldValue: baseSection.title,
          newValue: proposalSection.title,
        });
      }

      if (baseSection.orderIndex !== proposalSection.orderIndex) {
        fieldChanges.push({
          field: "orderIndex",
          oldValue: String(baseSection.orderIndex),
          newValue: String(proposalSection.orderIndex),
        });
      }

      if (fieldChanges.length > 0) {
        const change = {
          changeType: "MODIFY" as const,
          entityType: "SECTION" as const,
          sectionIndex,
          itemIndex: null,
          before: {
            id: getStableId(baseSection.id, null),
            title: baseSection.title,
            description: null,
            acceptanceCriteria: null,
            priority: null,
            orderIndex: baseSection.orderIndex,
          },
          after: {
            id: getStableId(proposalSection.id, proposalSection.sourceScopeSectionId),
            title: proposalSection.title,
            description: null,
            acceptanceCriteria: null,
            priority: null,
            orderIndex: proposalSection.orderIndex,
          },
          fieldChanges,
        };
        changes.push({ ...change, changeId: computeChangeId(change) });
        sectionsModified++;
      }
    }

    // Process items within section
    const baseItems = baseSection?.items || [];
    const proposalItems = proposalSection.items;

    const baseItemsMap = new Map(baseItems.map((i) => [i.id, i]));
    const processedBaseItems = new Set<string>();

    for (let itemIndex = 0; itemIndex < proposalItems.length; itemIndex++) {
      const proposalItem = proposalItems[itemIndex];
      const baseItem = proposalItem.sourceScopeItemId
        ? baseItemsMap.get(proposalItem.sourceScopeItemId)
        : undefined;

      if (!baseItem) {
        // ADDED item
        const change = {
          changeType: "ADD" as const,
          entityType: "ITEM" as const,
          sectionIndex,
          itemIndex,
          before: null,
          after: {
            id: getStableId(proposalItem.id, proposalItem.sourceScopeItemId),
            title: proposalItem.title,
            description: proposalItem.description,
            acceptanceCriteria: proposalItem.acceptanceCriteria,
            priority: proposalItem.priority,
            orderIndex: proposalItem.orderIndex,
          },
          fieldChanges: null,
        };
        changes.push({ ...change, changeId: computeChangeId(change) });
        itemsAdded++;
      } else {
        // Check if MODIFIED or MOVED
        processedBaseItems.add(baseItem.id);
        const fieldChanges: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];

        if (baseItem.title !== proposalItem.title) {
          fieldChanges.push({
            field: "title",
            oldValue: baseItem.title,
            newValue: proposalItem.title,
          });
        }

        if (baseItem.description !== proposalItem.description) {
          fieldChanges.push({
            field: "description",
            oldValue: baseItem.description,
            newValue: proposalItem.description,
          });
        }

        if (baseItem.acceptanceCriteria !== proposalItem.acceptanceCriteria) {
          fieldChanges.push({
            field: "acceptanceCriteria",
            oldValue: baseItem.acceptanceCriteria,
            newValue: proposalItem.acceptanceCriteria,
          });
        }

        if (baseItem.priority !== proposalItem.priority) {
          fieldChanges.push({
            field: "priority",
            oldValue: baseItem.priority,
            newValue: proposalItem.priority,
          });
        }

        if (baseItem.orderIndex !== proposalItem.orderIndex) {
          fieldChanges.push({
            field: "orderIndex",
            oldValue: String(baseItem.orderIndex),
            newValue: String(proposalItem.orderIndex),
          });
          itemsMoved++;
        }

        if (fieldChanges.length > 0) {
          const change = {
            changeType: "MODIFY" as const,
            entityType: "ITEM" as const,
            sectionIndex,
            itemIndex,
            before: {
              id: getStableId(baseItem.id, null),
              title: baseItem.title,
              description: baseItem.description,
              acceptanceCriteria: baseItem.acceptanceCriteria,
              priority: baseItem.priority,
              orderIndex: baseItem.orderIndex,
            },
            after: {
              id: getStableId(proposalItem.id, proposalItem.sourceScopeItemId),
              title: proposalItem.title,
              description: proposalItem.description,
              acceptanceCriteria: proposalItem.acceptanceCriteria,
              priority: proposalItem.priority,
              orderIndex: proposalItem.orderIndex,
            },
            fieldChanges,
          };
          changes.push({ ...change, changeId: computeChangeId(change) });
          itemsModified++;
        }
      }
    }

    // Find REMOVED items in this section
    for (const baseItem of baseItems) {
      if (!processedBaseItems.has(baseItem.id)) {
        const change = {
          changeType: "REMOVE" as const,
          entityType: "ITEM" as const,
          sectionIndex,
          itemIndex: null,
          before: {
            id: getStableId(baseItem.id, null),
            title: baseItem.title,
            description: baseItem.description,
            acceptanceCriteria: baseItem.acceptanceCriteria,
            priority: baseItem.priority,
            orderIndex: baseItem.orderIndex,
          },
          after: null,
          fieldChanges: null,
        };
        changes.push({ ...change, changeId: computeChangeId(change) });
        itemsRemoved++;
      }
    }

    processedProposalSections.add(proposalSection.id);
  }

  // Find REMOVED sections
  for (const baseSection of baseVersion.sections) {
    if (!processedBaseSections.has(baseSection.id)) {
      const baseSectionIndex = baseVersion.sections.indexOf(baseSection);
      const change = {
        changeType: "REMOVE" as const,
        entityType: "SECTION" as const,
        sectionIndex: baseSectionIndex,
        itemIndex: null,
        before: {
          id: getStableId(baseSection.id, null),
          title: baseSection.title,
          description: null,
          acceptanceCriteria: null,
          priority: null,
          orderIndex: baseSection.orderIndex,
        },
        after: null,
        fieldChanges: null,
      };
      changes.push({ ...change, changeId: computeChangeId(change) });
      sectionsRemoved++;

      // All items in removed section are also removed
      for (const baseItem of baseSection.items) {
        const itemChange = {
          changeType: "REMOVE" as const,
          entityType: "ITEM" as const,
          sectionIndex: baseSectionIndex,
          itemIndex: null,
          before: {
            id: getStableId(baseItem.id, null),
            title: baseItem.title,
            description: baseItem.description,
            acceptanceCriteria: baseItem.acceptanceCriteria,
            priority: baseItem.priority,
            orderIndex: baseItem.orderIndex,
          },
          after: null,
          fieldChanges: null,
        };
        changes.push({ ...itemChange, changeId: computeChangeId(itemChange) });
        itemsRemoved++;
      }
    }
  }

  // Build diff summary
  const diffSummary: DiffSummaryV1 = {
    version: "1.0",
    baseVersionId: baseScopeVersionId,
    proposedVersionId: proposalId,
    computedAt: new Date().toISOString(),
    changes: changes.sort((a, b) => {
      // Deterministic ordering: sectionIndex ASC, then itemIndex ASC
      if (a.sectionIndex !== b.sectionIndex) {
        return a.sectionIndex - b.sectionIndex;
      }
      if (a.itemIndex === null && b.itemIndex !== null) return -1;
      if (a.itemIndex !== null && b.itemIndex === null) return 1;
      if (a.itemIndex !== null && b.itemIndex !== null) {
        return a.itemIndex - b.itemIndex;
      }
      return 0;
    }),
    summary: {
      sectionsAdded,
      sectionsRemoved,
      sectionsModified,
      itemsAdded,
      itemsRemoved,
      itemsModified,
      itemsMoved,
      totalChanges: changes.length,
    },
  };

  return diffSummary;
}

/**
 * Persist diff summary to proposal
 * Called once during proposal submission
 */
export async function persistDiffSummary(
  proposalId: string,
  diffSummary: DiffSummaryV1
): Promise<void> {
  await prisma.changeProposal.update({
    where: { id: proposalId },
    data: {
      diffSummaryJson: diffSummary as any,
    },
  });
}

/**
 * Get diff summary from proposal
 * NEVER recomputes - always reads persisted value
 */
export async function getDiffSummary(
  proposalId: string
): Promise<DiffSummaryV1 | null> {
  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    select: { diffSummaryJson: true },
  });

  if (!proposal || !proposal.diffSummaryJson) {
    return null;
  }

  return proposal.diffSummaryJson as DiffSummaryV1;
}
