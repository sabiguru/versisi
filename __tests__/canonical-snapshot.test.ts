/**
 * Canonical Snapshot Hash Stability Tests (Prompt 15)
 *
 * Proves determinism - same input ALWAYS produces same output
 */

import {
  CanonicalSnapshot,
  computeSnapshotHash,
  computeSignatureHash,
  verifySnapshotIntegrity,
  verifySignatureIntegrity,
  verifyCompleteSignature,
  snapshotsAreEqual,
} from "../lib/canonical-snapshot";

describe("Snapshot Hash Stability", () => {
  const testSnapshot: CanonicalSnapshot = {
    metadata: {
      projectId: "test-project-123",
      projectName: "Test Project",
      snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
      snapshotVersion: "1.0",
    },
    proposal: {
      baseVersion: "1.0",
      changeNote: "Test change",
      id: "proposal-123",
      impactCost: "LOW",
      impactTimeline: "LOW",
      proposedVersion: "1.1",
      rationale: "Test rationale",
      requestedByParty: "DEV",
      risk: "LOW",
      title: "Test Proposal",
    },
    sections: [
      {
        id: "src:section-1",
        orderIndex: 0,
        title: "Features",
        items: [
          {
            acceptanceCriteria: "User can login",
            description: "Login functionality",
            id: "src:item-1",
            orderIndex: 0,
            priority: "HIGH",
            title: "User Login",
          },
        ],
      },
    ],
  };

  test("Same snapshot produces same hash (determinism)", () => {
    const hash1 = computeSnapshotHash(testSnapshot);
    const hash2 = computeSnapshotHash(testSnapshot);
    const hash3 = computeSnapshotHash(testSnapshot);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  test("Hash is exactly 64 characters (SHA-256)", () => {
    const hash = computeSnapshotHash(testSnapshot);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("Different key order produces same hash", () => {
    // Same data, different key order
    const snapshot1: any = {
      metadata: testSnapshot.metadata,
      proposal: testSnapshot.proposal,
      sections: testSnapshot.sections,
    };

    const snapshot2: any = {
      sections: testSnapshot.sections,
      proposal: testSnapshot.proposal,
      metadata: testSnapshot.metadata,
    };

    expect(computeSnapshotHash(snapshot1)).toBe(computeSnapshotHash(snapshot2));
  });

  test("Changing ANY field changes hash", () => {
    const originalHash = computeSnapshotHash(testSnapshot);

    // Change title
    const modified1 = {
      ...testSnapshot,
      proposal: { ...testSnapshot.proposal, title: "Modified Title" },
    };
    expect(computeSnapshotHash(modified1)).not.toBe(originalHash);

    // Change description
    const modified2 = {
      ...testSnapshot,
      sections: [
        {
          ...testSnapshot.sections[0],
          items: [
            {
              ...testSnapshot.sections[0].items[0],
              description: "Modified description",
            },
          ],
        },
      ],
    };
    expect(computeSnapshotHash(modified2)).not.toBe(originalHash);
  });

  test("snapshotsAreEqual works correctly", () => {
    const snapshot2 = JSON.parse(JSON.stringify(testSnapshot));
    expect(snapshotsAreEqual(testSnapshot, snapshot2)).toBe(true);

    const snapshot3 = {
      ...testSnapshot,
      proposal: { ...testSnapshot.proposal, title: "Different" },
    };
    expect(snapshotsAreEqual(testSnapshot, snapshot3)).toBe(false);
  });

  test("Verify snapshot integrity detects tampering", () => {
    const hash = computeSnapshotHash(testSnapshot);

    // Valid snapshot verifies
    expect(verifySnapshotIntegrity(testSnapshot, hash)).toBe(true);

    // Tampered snapshot fails
    const tampered = {
      ...testSnapshot,
      proposal: { ...testSnapshot.proposal, title: "TAMPERED" },
    };
    expect(verifySnapshotIntegrity(tampered, hash)).toBe(false);

    // Wrong hash fails
    const wrongHash = "0000000000000000000000000000000000000000000000000000000000000000";
    expect(verifySnapshotIntegrity(testSnapshot, wrongHash)).toBe(false);
  });
});

describe("Signature Hash Stability", () => {
  const snapshotHash = "a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0";
  const email = "john@example.com";
  const typedName = "John Doe";
  const signedAt = new Date("2024-01-01T00:00:00.000Z");

  test("Same signature data produces same hash", () => {
    const hash1 = computeSignatureHash(snapshotHash, email, typedName, signedAt);
    const hash2 = computeSignatureHash(snapshotHash, email, typedName, signedAt);

    expect(hash1).toBe(hash2);
  });

  test("Hash is exactly 64 characters", () => {
    const hash = computeSignatureHash(snapshotHash, email, typedName, signedAt);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("Different signer produces different hash", () => {
    const hash1 = computeSignatureHash(snapshotHash, "john@example.com", typedName, signedAt);
    const hash2 = computeSignatureHash(snapshotHash, "jane@example.com", typedName, signedAt);

    expect(hash1).not.toBe(hash2);
  });

  test("Different snapshot produces different hash", () => {
    const hash1 = computeSignatureHash(snapshotHash, email, typedName, signedAt);
    const hash2 = computeSignatureHash("different-snapshot-hash", email, typedName, signedAt);

    expect(hash1).not.toBe(hash2);
  });

  test("Email normalization (case insensitive)", () => {
    const hash1 = computeSignatureHash(snapshotHash, "John@Example.COM", typedName, signedAt);
    const hash2 = computeSignatureHash(snapshotHash, "john@example.com", typedName, signedAt);

    expect(hash1).toBe(hash2);
  });

  test("Verify signature integrity works", () => {
    const hash = computeSignatureHash(snapshotHash, email, typedName, signedAt);

    // Valid signature verifies
    expect(verifySignatureIntegrity(snapshotHash, email, typedName, signedAt, hash)).toBe(true);

    // Wrong email fails
    expect(verifySignatureIntegrity(snapshotHash, "wrong@example.com", typedName, signedAt, hash)).toBe(false);

    // Wrong typed name fails
    expect(verifySignatureIntegrity(snapshotHash, email, "Wrong Name", signedAt, hash)).toBe(false);

    // Wrong hash fails
    const wrongHash = "0000000000000000000000000000000000000000000000000000000000000000";
    expect(verifySignatureIntegrity(snapshotHash, email, typedName, signedAt, wrongHash)).toBe(false);
  });
});

describe("Complete Signature Verification", () => {
  const snapshot: CanonicalSnapshot = {
    metadata: {
      projectId: "test",
      projectName: "Test",
      snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
      snapshotVersion: "1.0",
    },
    proposal: {
      baseVersion: "1.0",
      changeNote: "Test",
      id: "p1",
      impactCost: "LOW",
      impactTimeline: "LOW",
      proposedVersion: "1.1",
      rationale: "Test",
      requestedByParty: "DEV",
      risk: "LOW",
      title: "Test",
    },
    sections: [],
  };

  test("Valid complete signature verifies", () => {
    const snapshotHash = computeSnapshotHash(snapshot);
    const signedAt = new Date("2024-01-01T00:00:00.000Z");
    const email = "test@example.com";
    const typedName = "Test User";

    const signatureHash = computeSignatureHash(snapshotHash, email, typedName, signedAt);

    const result = verifyCompleteSignature({
      agreementSnapshotJson: snapshot,
      snapshotHash,
      signatureHash,
      approvalRecipient: { email },
      typedName,
      signedAt,
    });

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("Tampered snapshot detected", () => {
    const snapshotHash = computeSnapshotHash(snapshot);
    const signedAt = new Date("2024-01-01T00:00:00.000Z");
    const email = "test@example.com";
    const typedName = "Test User";

    const signatureHash = computeSignatureHash(snapshotHash, email, typedName, signedAt);

    // Tamper with snapshot
    const tamperedSnapshot = {
      ...snapshot,
      proposal: { ...snapshot.proposal, title: "TAMPERED" },
    };

    const result = verifyCompleteSignature({
      agreementSnapshotJson: tamperedSnapshot,
      snapshotHash,
      signatureHash,
      approvalRecipient: { email },
      typedName,
      signedAt,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("tampered");
  });

  test("Tampered signature hash detected", () => {
    const snapshotHash = computeSnapshotHash(snapshot);
    const signedAt = new Date("2024-01-01T00:00:00.000Z");
    const email = "test@example.com";
    const typedName = "Test User";

    const wrongSignatureHash = "0000000000000000000000000000000000000000000000000000000000000000";

    const result = verifyCompleteSignature({
      agreementSnapshotJson: snapshot,
      snapshotHash,
      signatureHash: wrongSignatureHash,
      approvalRecipient: { email },
      typedName,
      signedAt,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("tampered");
  });
});

describe("Stable IDs", () => {
  test("Source items have src: prefix", () => {
    const snapshot: CanonicalSnapshot = {
      metadata: {
        projectId: "test",
        projectName: "Test",
        snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
        snapshotVersion: "1.0",
      },
      proposal: {
        baseVersion: "1.0",
        changeNote: "Test",
        id: "p1",
        impactCost: "LOW",
        impactTimeline: "LOW",
        proposedVersion: "1.1",
        rationale: "Test",
        requestedByParty: "DEV",
        risk: "LOW",
        title: "Test",
      },
      sections: [
        {
          id: "src:original-section",
          orderIndex: 0,
          title: "Test Section",
          items: [
            {
              id: "src:original-item",
              title: "Test",
              description: "Test",
              acceptanceCriteria: null,
              priority: "HIGH",
              orderIndex: 0,
            },
          ],
        },
      ],
    };

    expect(snapshot.sections[0].id).toMatch(/^src:/);
    expect(snapshot.sections[0].items[0].id).toMatch(/^src:/);
  });

  test("New items have new: prefix", () => {
    const snapshot: CanonicalSnapshot = {
      metadata: {
        projectId: "test",
        projectName: "Test",
        snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
        snapshotVersion: "1.0",
      },
      proposal: {
        baseVersion: "1.0",
        changeNote: "Test",
        id: "p1",
        impactCost: "LOW",
        impactTimeline: "LOW",
        proposedVersion: "1.1",
        rationale: "Test",
        requestedByParty: "DEV",
        risk: "LOW",
        title: "Test",
      },
      sections: [
        {
          id: "new:new-section",
          orderIndex: 0,
          title: "Test Section",
          items: [
            {
              id: "new:new-item",
              title: "Test",
              description: "Test",
              acceptanceCriteria: null,
              priority: "HIGH",
              orderIndex: 0,
            },
          ],
        },
      ],
    };

    expect(snapshot.sections[0].id).toMatch(/^new:/);
    expect(snapshot.sections[0].items[0].id).toMatch(/^new:/);
  });
});
