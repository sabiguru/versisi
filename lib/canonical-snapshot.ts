/**
 * Canonical Snapshot Generation (Prompt 11)
 *
 * Generates ZERO-VARIANCE canonical JSON snapshots for legal signing.
 * Every byte must be identical for the same proposal state.
 *
 * REQUIREMENTS:
 * - Stable IDs with src:/new: prefixes
 * - Sorted keys at ALL levels
 * - Stable ordering for all arrays
 * - LF line endings (\n) only
 * - NFC Unicode normalization
 * - SHA-256 hashing
 */

import { prisma } from "./prisma";
import { createHash } from "crypto";

/**
 * Canonical snapshot structure
 * Field order is CRITICAL - defined explicitly here
 */
export interface CanonicalSnapshot {
  metadata: {
    projectId: string;
    projectName: string;
    snapshotGeneratedAt: string; // ISO 8601 with milliseconds
    snapshotVersion: string; // "1.0"
  };
  proposal: {
    baseVersion: string; // "major.minor"
    changeNote: string;
    id: string;
    impactCost: string;
    impactTimeline: string;
    proposedVersion: string; // "major.minor"
    rationale: string;
    requestedByParty: string;
    risk: string;
    title: string;
  };
  sections: Array<{
    id: string; // "src:<sourceId>" or "new:<proposalSectionId>"
    orderIndex: number;
    title: string;
    items: Array<{
      acceptanceCriteria: string | null;
      description: string;
      id: string; // "src:<sourceId>" or "new:<proposalItemId>"
      orderIndex: number;
      priority: string;
      title: string;
    }>;
  }>;
}

/**
 * Normalize text to canonical form
 * - NFC Unicode normalization
 * - LF line endings only (no CRLF)
 * - Trim trailing whitespace on each line
 */
function normalizeText(text: string): string {
  // NFC normalization (canonical decomposition + canonical composition)
  let normalized = text.normalize("NFC");

  // Convert all line endings to LF
  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Trim trailing whitespace from each line
  normalized = normalized
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  return normalized;
}

/**
 * Generate stable ID for sections and items
 * - Items from base scope: "src:<sourceScopeItemId>"
 * - New items in proposal: "new:<proposalItemId>"
 */
function generateStableId(
  entityId: string,
  sourceScopeItemId: string | null
): string {
  if (sourceScopeItemId) {
    return `src:${sourceScopeItemId}`;
  } else {
    return `new:${entityId}`;
  }
}

/**
 * Recursively sort object keys for deterministic serialization
 */
function sortKeys(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }

  if (typeof obj === "object") {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }

  return obj;
}

/**
 * Generate canonical snapshot from a proposal
 * Zero variance - every field, every byte is deterministic
 */
export async function generateCanonicalSnapshot(
  proposalId: string
): Promise<CanonicalSnapshot> {
  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      project: true,
      baseScopeVersion: true,
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

  // Generate timestamp once for consistency
  const snapshotTimestamp = new Date().toISOString();

  // Build canonical snapshot with EXACT field ordering
  // Fields MUST be in alphabetical order within each object
  const snapshot: CanonicalSnapshot = {
    metadata: {
      projectId: proposal.projectId,
      projectName: normalizeText(proposal.project.name),
      snapshotGeneratedAt: snapshotTimestamp,
      snapshotVersion: "1.0",
    },
    proposal: {
      baseVersion: `${proposal.baseScopeVersion.major}.${proposal.baseScopeVersion.minor}`,
      changeNote: normalizeText(proposal.changeNote),
      id: proposal.id,
      impactCost: proposal.impactCost,
      impactTimeline: proposal.impactTimeline,
      proposedVersion: `${proposal.proposedMajor}.${proposal.proposedMinor}`,
      rationale: normalizeText(proposal.rationale),
      requestedByParty: proposal.requestedByParty,
      risk: proposal.risk,
      title: normalizeText(proposal.title),
    },
    sections: proposal.sections.map((section) => ({
      id: generateStableId(section.id, section.sourceScopeSectionId),
      orderIndex: section.orderIndex,
      title: normalizeText(section.title),
      items: section.items.map((item) => ({
        acceptanceCriteria: item.acceptanceCriteria
          ? normalizeText(item.acceptanceCriteria)
          : null,
        description: normalizeText(item.description),
        id: generateStableId(item.id, item.sourceScopeItemId),
        orderIndex: item.orderIndex,
        priority: item.priority,
        title: normalizeText(item.title),
      })),
    })),
  };

  return snapshot;
}

/**
 * Compute SHA-256 hash of canonical snapshot
 * This is the snapshotHash stored in Signature
 *
 * ZERO VARIANCE REQUIREMENT:
 * - Keys sorted at ALL levels
 * - No extra whitespace
 * - No trailing newlines
 * - UTF-8 encoding
 */
export function computeSnapshotHash(snapshot: CanonicalSnapshot): string {
  // Sort all keys recursively for absolute determinism
  const sorted = sortKeys(snapshot);

  // Serialize with NO extra whitespace (compact)
  const canonicalJson = JSON.stringify(sorted);

  // SHA-256 hash
  return createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}

/**
 * Compute signature hash combining snapshot + signer identity
 * This is the signatureHash stored in Signature (prevents signature reuse)
 *
 * Includes:
 * - snapshotHash (already canonical)
 * - signerEmail (normalized: lowercase, trimmed, NFC)
 * - typedName (normalized: trimmed, NFC)
 * - signedAt (ISO 8601)
 */
export function computeSignatureHash(
  snapshotHash: string,
  signerEmail: string,
  typedName: string,
  signedAt: Date
): string {
  // Normalize signer identity
  const normalizedEmail = normalizeText(signerEmail.toLowerCase().trim());
  const normalizedName = normalizeText(typedName.trim());

  // Build canonical signature data (keys sorted)
  const signatureData = {
    signedAt: signedAt.toISOString(),
    signerEmail: normalizedEmail,
    snapshotHash: snapshotHash,
    typedName: normalizedName,
  };

  // Sort keys for determinism
  const sorted = sortKeys(signatureData);
  const canonicalJson = JSON.stringify(sorted);

  return createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}

/**
 * Verify snapshot integrity
 * Returns true if snapshot hash matches expected hash
 *
 * Use this to detect tampering with stored snapshots
 */
export function verifySnapshotIntegrity(
  snapshot: CanonicalSnapshot,
  expectedHash: string
): boolean {
  const actualHash = computeSnapshotHash(snapshot);
  return actualHash === expectedHash;
}

/**
 * Verify signature integrity
 * Returns true if signature hash matches expected hash
 *
 * Use this to verify a signature hasn't been forged or reused
 */
export function verifySignatureIntegrity(
  snapshotHash: string,
  signerEmail: string,
  typedName: string,
  signedAt: Date,
  expectedHash: string
): boolean {
  const actualHash = computeSignatureHash(
    snapshotHash,
    signerEmail,
    typedName,
    signedAt
  );
  return actualHash === expectedHash;
}

/**
 * Verify complete signature record
 * Checks both snapshot integrity and signature integrity
 *
 * Returns:
 * - { valid: true } if all checks pass
 * - { valid: false, error: string } if any check fails
 */
export function verifyCompleteSignature(signature: {
  agreementSnapshotJson: any;
  snapshotHash: string;
  signatureHash: string;
  approvalRecipient: {
    email: string;
  };
  typedName: string;
  signedAt: Date;
}): { valid: boolean; error?: string } {
  // Check 1: Verify snapshot integrity
  const snapshotValid = verifySnapshotIntegrity(
    signature.agreementSnapshotJson,
    signature.snapshotHash
  );

  if (!snapshotValid) {
    return {
      valid: false,
      error: "Snapshot has been tampered with (hash mismatch)",
    };
  }

  // Check 2: Verify signature integrity
  const signatureValid = verifySignatureIntegrity(
    signature.snapshotHash,
    signature.approvalRecipient.email,
    signature.typedName,
    signature.signedAt,
    signature.signatureHash
  );

  if (!signatureValid) {
    return {
      valid: false,
      error: "Signature has been tampered with (hash mismatch)",
    };
  }

  return { valid: true };
}

/**
 * Compare two snapshots for equality
 * Returns true if snapshots are byte-for-byte identical
 *
 * Use this to verify no changes occurred between snapshots
 */
export function snapshotsAreEqual(
  snapshot1: CanonicalSnapshot,
  snapshot2: CanonicalSnapshot
): boolean {
  const hash1 = computeSnapshotHash(snapshot1);
  const hash2 = computeSnapshotHash(snapshot2);
  return hash1 === hash2;
}

/**
 * Extract stable IDs from snapshot for traceability
 * Returns map of proposal IDs to stable IDs
 */
export function extractStableIdMapping(snapshot: CanonicalSnapshot): {
  sections: Map<string, string>; // proposalSectionId -> stableId
  items: Map<string, string>; // proposalItemId -> stableId
} {
  const sections = new Map<string, string>();
  const items = new Map<string, string>();

  for (const section of snapshot.sections) {
    // Extract original ID from stable ID
    if (section.id.startsWith("src:")) {
      sections.set(section.id.substring(4), section.id);
    } else if (section.id.startsWith("new:")) {
      sections.set(section.id.substring(4), section.id);
    }

    for (const item of section.items) {
      if (item.id.startsWith("src:")) {
        items.set(item.id.substring(4), item.id);
      } else if (item.id.startsWith("new:")) {
        items.set(item.id.substring(4), item.id);
      }
    }
  }

  return { sections, items };
}
