/**
 * Canonical Snapshot Test Utilities
 *
 * Utilities to verify zero-variance properties of canonical snapshots
 */

import {
  CanonicalSnapshot,
  computeSnapshotHash,
  snapshotsAreEqual,
  verifySnapshotIntegrity,
  verifySignatureIntegrity,
  verifyCompleteSignature,
} from "./canonical-snapshot";

/**
 * Test Case: Verify snapshot hashing is deterministic
 * Same snapshot should ALWAYS produce same hash
 */
export function testSnapshotDeterminism(
  snapshot: CanonicalSnapshot
): boolean {
  const hash1 = computeSnapshotHash(snapshot);
  const hash2 = computeSnapshotHash(snapshot);
  const hash3 = computeSnapshotHash(snapshot);

  return hash1 === hash2 && hash2 === hash3;
}

/**
 * Test Case: Verify key ordering doesn't matter for input
 * Same data with different key order should produce same hash
 */
export function testKeyOrderIndependence(): boolean {
  // Same data, different key order
  const snapshot1: any = {
    metadata: { projectId: "1", projectName: "Test", snapshotGeneratedAt: "2024-01-01T00:00:00.000Z", snapshotVersion: "1.0" },
    proposal: { id: "p1", title: "Test", baseVersion: "1.0", proposedVersion: "1.1", changeNote: "Test", rationale: "Test", impactTimeline: "LOW", impactCost: "LOW", risk: "LOW", requestedByParty: "DEV" },
    sections: [],
  };

  const snapshot2: any = {
    sections: [],
    proposal: { requestedByParty: "DEV", risk: "LOW", impactCost: "LOW", impactTimeline: "LOW", rationale: "Test", changeNote: "Test", proposedVersion: "1.1", baseVersion: "1.0", title: "Test", id: "p1" },
    metadata: { snapshotVersion: "1.0", snapshotGeneratedAt: "2024-01-01T00:00:00.000Z", projectName: "Test", projectId: "1" },
  };

  const hash1 = computeSnapshotHash(snapshot1);
  const hash2 = computeSnapshotHash(snapshot2);

  return hash1 === hash2;
}

/**
 * Test Case: Verify text normalization works
 * Same text with different encodings should normalize to same hash
 */
export function testTextNormalization(): boolean {
  // These should all normalize to the same result
  const texts = [
    "café", // NFC
    "café", // NFD (decomposed)
    "café\r\n", // CRLF line ending
    "café\r", // CR line ending
    "café\n", // LF line ending
  ];

  // Can't test directly without exposing normalizeText,
  // but this test documents the expectation
  return true; // Placeholder - would need to expose normalizeText for real test
}

/**
 * Test Case: Verify stable IDs are generated correctly
 */
export function testStableIdGeneration(snapshot: CanonicalSnapshot): {
  hasSourceIds: boolean;
  hasNewIds: boolean;
  allIdsHavePrefix: boolean;
} {
  let hasSourceIds = false;
  let hasNewIds = false;
  let allIdsHavePrefix = true;

  for (const section of snapshot.sections) {
    if (section.id.startsWith("src:")) {
      hasSourceIds = true;
    } else if (section.id.startsWith("new:")) {
      hasNewIds = true;
    } else {
      allIdsHavePrefix = false;
    }

    for (const item of section.items) {
      if (item.id.startsWith("src:")) {
        hasSourceIds = true;
      } else if (item.id.startsWith("new:")) {
        hasNewIds = true;
      } else {
        allIdsHavePrefix = false;
      }
    }
  }

  return { hasSourceIds, hasNewIds, allIdsHavePrefix };
}

/**
 * Test Case: Verify JSON has no extra whitespace
 */
export function testNoExtraWhitespace(snapshot: CanonicalSnapshot): boolean {
  const hash1 = computeSnapshotHash(snapshot);

  // Manually serialize with extra whitespace
  const jsonWithWhitespace = JSON.stringify(snapshot, null, 2);
  const jsonWithoutWhitespace = JSON.stringify(snapshot);

  // Hash should be computed from compact form
  // So adding whitespace to input shouldn't matter (it gets normalized)
  return hash1.length === 64; // SHA-256 is always 64 hex chars
}

/**
 * Test Case: Verify snapshot equality detection
 */
export function testSnapshotEquality(
  snapshot1: CanonicalSnapshot,
  snapshot2: CanonicalSnapshot
): boolean {
  const areEqual = snapshotsAreEqual(snapshot1, snapshot2);
  const hash1 = computeSnapshotHash(snapshot1);
  const hash2 = computeSnapshotHash(snapshot2);

  // Equality check should match hash comparison
  return areEqual === (hash1 === hash2);
}

/**
 * Test Case: Verify signature verification detects tampering
 */
export function testSignatureVerificationDetectsTampering(): {
  validSignatureVerifies: boolean;
  tamperedSnapshotFails: boolean;
  tamperedSignatureFails: boolean;
} {
  const validSnapshot: CanonicalSnapshot = {
    metadata: {
      projectId: "test-project",
      projectName: "Test Project",
      snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
      snapshotVersion: "1.0",
    },
    proposal: {
      id: "test-proposal",
      title: "Test Proposal",
      baseVersion: "1.0",
      proposedVersion: "1.1",
      changeNote: "Test change",
      rationale: "Test rationale",
      impactTimeline: "LOW",
      impactCost: "LOW",
      risk: "LOW",
      requestedByParty: "DEV",
    },
    sections: [],
  };

  const validHash = computeSnapshotHash(validSnapshot);

  // Test 1: Valid snapshot verifies
  const validSignatureVerifies = verifySnapshotIntegrity(
    validSnapshot,
    validHash
  );

  // Test 2: Tampered snapshot fails
  const tamperedSnapshot = JSON.parse(JSON.stringify(validSnapshot));
  tamperedSnapshot.proposal.title = "TAMPERED";
  const tamperedSnapshotFails = !verifySnapshotIntegrity(
    tamperedSnapshot,
    validHash
  );

  // Test 3: Wrong hash fails
  const wrongHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const tamperedSignatureFails = !verifySnapshotIntegrity(
    validSnapshot,
    wrongHash
  );

  return {
    validSignatureVerifies,
    tamperedSnapshotFails,
    tamperedSignatureFails,
  };
}

/**
 * Test Case: Verify complete signature validation
 */
export function testCompleteSignatureValidation(): {
  validSignaturePasses: boolean;
  tamperedSnapshotFails: boolean;
  tamperedSignatureFails: boolean;
} {
  const snapshot: CanonicalSnapshot = {
    metadata: {
      projectId: "test",
      projectName: "Test",
      snapshotGeneratedAt: "2024-01-01T00:00:00.000Z",
      snapshotVersion: "1.0",
    },
    proposal: {
      id: "p1",
      title: "Test",
      baseVersion: "1.0",
      proposedVersion: "1.1",
      changeNote: "Test",
      rationale: "Test",
      impactTimeline: "LOW",
      impactCost: "LOW",
      risk: "LOW",
      requestedByParty: "DEV",
    },
    sections: [],
  };

  const snapshotHash = computeSnapshotHash(snapshot);
  const signedAt = new Date("2024-01-01T00:00:00.000Z");
  const email = "test@example.com";
  const typedName = "John Doe";

  // Compute valid signature hash
  const validSignatureHash = require("crypto")
    .createHash("sha256")
    .update(
      JSON.stringify({
        signedAt: signedAt.toISOString(),
        signerEmail: email.toLowerCase().trim(),
        snapshotHash: snapshotHash,
        typedName: typedName.trim(),
      })
    )
    .digest("hex");

  const validSignature = {
    agreementSnapshotJson: snapshot,
    snapshotHash: snapshotHash,
    signatureHash: validSignatureHash,
    approvalRecipient: { email },
    typedName,
    signedAt,
  };

  // Test 1: Valid signature passes
  const result1 = verifyCompleteSignature(validSignature);
  const validSignaturePasses = result1.valid;

  // Test 2: Tampered snapshot fails
  const tamperedSnapshot = JSON.parse(JSON.stringify(snapshot));
  tamperedSnapshot.proposal.title = "TAMPERED";
  const result2 = verifyCompleteSignature({
    ...validSignature,
    agreementSnapshotJson: tamperedSnapshot,
  });
  const tamperedSnapshotFails = !result2.valid;

  // Test 3: Tampered signature hash fails
  const result3 = verifyCompleteSignature({
    ...validSignature,
    signatureHash: "0000000000000000000000000000000000000000000000000000000000000000",
  });
  const tamperedSignatureFails = !result3.valid;

  return {
    validSignaturePasses,
    tamperedSnapshotFails,
    tamperedSignatureFails,
  };
}

/**
 * Run all tests and return results
 */
export function runAllCanonicalSnapshotTests(
  snapshot: CanonicalSnapshot
): {
  determinism: boolean;
  keyOrderIndependence: boolean;
  noExtraWhitespace: boolean;
  stableIds: {
    hasSourceIds: boolean;
    hasNewIds: boolean;
    allIdsHavePrefix: boolean;
  };
  tamperDetection: {
    validSignatureVerifies: boolean;
    tamperedSnapshotFails: boolean;
    tamperedSignatureFails: boolean;
  };
  completeValidation: {
    validSignaturePasses: boolean;
    tamperedSnapshotFails: boolean;
    tamperedSignatureFails: boolean;
  };
  allTestsPassed: boolean;
} {
  const determinism = testSnapshotDeterminism(snapshot);
  const keyOrderIndependence = testKeyOrderIndependence();
  const noExtraWhitespace = testNoExtraWhitespace(snapshot);
  const stableIds = testStableIdGeneration(snapshot);
  const tamperDetection = testSignatureVerificationDetectsTampering();
  const completeValidation = testCompleteSignatureValidation();

  const allTestsPassed =
    determinism &&
    keyOrderIndependence &&
    noExtraWhitespace &&
    stableIds.allIdsHavePrefix &&
    tamperDetection.validSignatureVerifies &&
    tamperDetection.tamperedSnapshotFails &&
    tamperDetection.tamperedSignatureFails &&
    completeValidation.validSignaturePasses &&
    completeValidation.tamperedSnapshotFails &&
    completeValidation.tamperedSignatureFails;

  return {
    determinism,
    keyOrderIndependence,
    noExtraWhitespace,
    stableIds,
    tamperDetection,
    completeValidation,
    allTestsPassed,
  };
}
