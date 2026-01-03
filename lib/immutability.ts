import { prisma } from "@/lib/prisma";

// ============================================================================
// IMMUTABILITY ENFORCEMENT
// ============================================================================

/**
 * CRITICAL RULE: Once ScopeVersion.approvedAt is set, the version is IMMUTABLE.
 * No update operations are allowed. Only reads.
 * This must be enforced in ALL application logic.
 */

export class ImmutabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImmutabilityError";
  }
}

/**
 * Check if a scope version is approved (and therefore immutable)
 */
export async function isScopeVersionApproved(
  versionId: string
): Promise<boolean> {
  const version = await prisma.scopeVersion.findUnique({
    where: { id: versionId },
    select: { approvedAt: true },
  });

  return !!version?.approvedAt;
}

/**
 * Enforce that a scope version is NOT approved before allowing modification
 * Throws ImmutabilityError if version is approved
 */
export async function enforceNotApproved(versionId: string): Promise<void> {
  const isApproved = await isScopeVersionApproved(versionId);

  if (isApproved) {
    throw new ImmutabilityError(
      `Cannot modify approved scope version: ${versionId}. Approved versions are immutable.`
    );
  }
}

/**
 * Check if a scope section belongs to an approved version
 */
export async function isScopeSectionApproved(
  sectionId: string
): Promise<boolean> {
  const section = await prisma.scopeSection.findUnique({
    where: { id: sectionId },
    include: {
      scopeVersion: {
        select: { approvedAt: true },
      },
    },
  });

  return !!section?.scopeVersion.approvedAt;
}

/**
 * Check if a scope item belongs to an approved version
 */
export async function isScopeItemApproved(itemId: string): Promise<boolean> {
  const item = await prisma.scopeItem.findUnique({
    where: { id: itemId },
    include: {
      scopeSection: {
        include: {
          scopeVersion: {
            select: { approvedAt: true },
          },
        },
      },
    },
  });

  return !!item?.scopeSection.scopeVersion.approvedAt;
}

/**
 * Prevent ANY modification to approved scope versions
 * Use this as a guard in all update/delete operations
 */
export async function preventScopeVersionModification(
  versionId: string
): Promise<void> {
  await enforceNotApproved(versionId);
}

/**
 * Prevent modification of scope sections in approved versions
 */
export async function preventScopeSectionModification(
  sectionId: string
): Promise<void> {
  const isApproved = await isScopeSectionApproved(sectionId);

  if (isApproved) {
    throw new ImmutabilityError(
      `Cannot modify section in approved scope version: ${sectionId}`
    );
  }
}

/**
 * Prevent modification of scope items in approved versions
 */
export async function preventScopeItemModification(
  itemId: string
): Promise<void> {
  const isApproved = await isScopeItemApproved(itemId);

  if (isApproved) {
    throw new ImmutabilityError(
      `Cannot modify item in approved scope version: ${itemId}`
    );
  }
}

// ============================================================================
// USAGE EXAMPLES (for documentation)
// ============================================================================

/**
 * Example: Updating a scope version (MUST check first)
 *
 * async function updateScopeVersion(versionId: string, data: any) {
 *   await enforceNotApproved(versionId);
 *   return prisma.scopeVersion.update({
 *     where: { id: versionId },
 *     data,
 *   });
 * }
 */

/**
 * Example: Deleting a scope section (MUST check first)
 *
 * async function deleteScopeSection(sectionId: string) {
 *   await preventScopeSectionModification(sectionId);
 *   return prisma.scopeSection.delete({
 *     where: { id: sectionId },
 *   });
 * }
 */
