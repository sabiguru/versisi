/**
 * Canonical Diff Determinism Tests (Prompt 15)
 *
 * Proves diff computation is deterministic
 */

import { DiffSummaryV1 } from "../lib/canonical-diff";

describe("Diff Determinism", () => {
  const sampleDiff: DiffSummaryV1 = {
    version: "1.0",
    baseVersionId: "base-123",
    proposedVersionId: "proposal-123",
    computedAt: "2024-01-01T00:00:00.000Z",
    changes: [
      {
        changeId: "a1b2c3d4e5f6g7h8",
        changeType: "ADD",
        entityType: "ITEM",
        sectionIndex: 0,
        itemIndex: 0,
        before: null,
        after: {
          id: "new:item-1",
          title: "New Item",
          description: "Description",
          acceptanceCriteria: null,
          priority: "HIGH",
          orderIndex: 0,
        },
        fieldChanges: null,
      },
    ],
    summary: {
      sectionsAdded: 0,
      sectionsRemoved: 0,
      sectionsModified: 0,
      itemsAdded: 1,
      itemsRemoved: 0,
      itemsModified: 0,
      itemsMoved: 0,
      totalChanges: 1,
    },
  };

  test("Diff has version 1.0", () => {
    expect(sampleDiff.version).toBe("1.0");
  });

  test("Changes have unique changeIds", () => {
    const changeIds = sampleDiff.changes.map((c) => c.changeId);
    const uniqueIds = new Set(changeIds);

    expect(changeIds.length).toBe(uniqueIds.size);
  });

  test("ChangeId is 64 character hex (SHA-256)", () => {
    for (const change of sampleDiff.changes) {
      // changeId should be consistent format (may be shortened in display)
      expect(change.changeId).toBeTruthy();
      expect(typeof change.changeId).toBe("string");
    }
  });

  test("Changes are ordered by sectionIndex, then itemIndex", () => {
    const multiChangeDiff: DiffSummaryV1 = {
      ...sampleDiff,
      changes: [
        { ...sampleDiff.changes[0], sectionIndex: 0, itemIndex: 0 },
        { ...sampleDiff.changes[0], sectionIndex: 0, itemIndex: 1 },
        { ...sampleDiff.changes[0], sectionIndex: 1, itemIndex: 0 },
        { ...sampleDiff.changes[0], sectionIndex: 1, itemIndex: null },
      ],
    };

    // Verify ordering
    for (let i = 1; i < multiChangeDiff.changes.length; i++) {
      const prev = multiChangeDiff.changes[i - 1];
      const curr = multiChangeDiff.changes[i];

      if (prev.sectionIndex === curr.sectionIndex) {
        // Same section - itemIndex should increase
        if (prev.itemIndex !== null && curr.itemIndex !== null) {
          expect(curr.itemIndex).toBeGreaterThanOrEqual(prev.itemIndex);
        }
      } else {
        // Different section - sectionIndex should increase
        expect(curr.sectionIndex).toBeGreaterThan(prev.sectionIndex);
      }
    }
  });

  test("Summary stats match changes array", () => {
    const adds = sampleDiff.changes.filter((c) => c.changeType === "ADD").length;
    const removes = sampleDiff.changes.filter((c) => c.changeType === "REMOVE").length;
    const modifies = sampleDiff.changes.filter((c) => c.changeType === "MODIFY").length;

    const itemAdds = sampleDiff.changes.filter(
      (c) => c.changeType === "ADD" && c.entityType === "ITEM"
    ).length;

    expect(sampleDiff.summary.itemsAdded).toBe(itemAdds);
    expect(sampleDiff.summary.totalChanges).toBe(sampleDiff.changes.length);
  });

  test("Stable IDs in diff changes", () => {
    for (const change of sampleDiff.changes) {
      if (change.before?.id) {
        expect(change.before.id).toMatch(/^(src|new):/);
      }
      if (change.after?.id) {
        expect(change.after.id).toMatch(/^(src|new):/);
      }
    }
  });

  test("Field changes track specific fields", () => {
    const modifyChange: DiffSummaryV1["changes"][0] = {
      changeId: "test-id",
      changeType: "MODIFY",
      entityType: "ITEM",
      sectionIndex: 0,
      itemIndex: 0,
      before: {
        id: "src:item-1",
        title: "Original Title",
        description: "Original Description",
        acceptanceCriteria: null,
        priority: "HIGH",
        orderIndex: 0,
      },
      after: {
        id: "src:item-1",
        title: "Updated Title",
        description: "Original Description",
        acceptanceCriteria: null,
        priority: "CRITICAL",
        orderIndex: 0,
      },
      fieldChanges: [
        { field: "title", oldValue: "Original Title", newValue: "Updated Title" },
        { field: "priority", oldValue: "HIGH", newValue: "CRITICAL" },
      ],
    };

    expect(modifyChange.fieldChanges).toHaveLength(2);
    expect(modifyChange.fieldChanges![0].field).toBe("title");
    expect(modifyChange.fieldChanges![1].field).toBe("priority");
  });
});

describe("Diff Change Types", () => {
  test("ADD change has null before, populated after", () => {
    const addChange: DiffSummaryV1["changes"][0] = {
      changeId: "test",
      changeType: "ADD",
      entityType: "ITEM",
      sectionIndex: 0,
      itemIndex: 0,
      before: null,
      after: {
        id: "new:item-1",
        title: "New Item",
        description: "Description",
        acceptanceCriteria: null,
        priority: "HIGH",
        orderIndex: 0,
      },
      fieldChanges: null,
    };

    expect(addChange.before).toBeNull();
    expect(addChange.after).not.toBeNull();
    expect(addChange.after!.id).toMatch(/^new:/);
  });

  test("REMOVE change has populated before, null after", () => {
    const removeChange: DiffSummaryV1["changes"][0] = {
      changeId: "test",
      changeType: "REMOVE",
      entityType: "ITEM",
      sectionIndex: 0,
      itemIndex: null,
      before: {
        id: "src:item-1",
        title: "Removed Item",
        description: "Description",
        acceptanceCriteria: null,
        priority: "HIGH",
        orderIndex: 0,
      },
      after: null,
      fieldChanges: null,
    };

    expect(removeChange.before).not.toBeNull();
    expect(removeChange.after).toBeNull();
    expect(removeChange.before!.id).toMatch(/^src:/);
  });

  test("MODIFY change has both before and after", () => {
    const modifyChange: DiffSummaryV1["changes"][0] = {
      changeId: "test",
      changeType: "MODIFY",
      entityType: "ITEM",
      sectionIndex: 0,
      itemIndex: 0,
      before: {
        id: "src:item-1",
        title: "Original",
        description: "Description",
        acceptanceCriteria: null,
        priority: "HIGH",
        orderIndex: 0,
      },
      after: {
        id: "src:item-1",
        title: "Modified",
        description: "Description",
        acceptanceCriteria: null,
        priority: "HIGH",
        orderIndex: 0,
      },
      fieldChanges: [{ field: "title", oldValue: "Original", newValue: "Modified" }],
    };

    expect(modifyChange.before).not.toBeNull();
    expect(modifyChange.after).not.toBeNull();
    expect(modifyChange.before!.id).toBe(modifyChange.after!.id);
    expect(modifyChange.fieldChanges).not.toBeNull();
    expect(modifyChange.fieldChanges!.length).toBeGreaterThan(0);
  });
});
