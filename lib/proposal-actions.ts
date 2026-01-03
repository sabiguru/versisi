"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PartyType, ProposalStatus, ScopeItemPriority } from "@prisma/client";
import { computeCanonicalDiff, persistDiffSummary } from "@/lib/canonical-diff";

// ============================================================================
// CREATE DRAFT PROPOSAL
// ============================================================================

export async function createDraftProposal(data: {
  projectId: string;
  baseScopeVersionId: string;
  title: string;
  changeNote: string;
  rationale: string;
  requestedByParty: PartyType;
  requestedByName?: string;
}) {
  const user = await requireUser();

  // Get base version to determine next version number
  const baseVersion = await prisma.scopeVersion.findUnique({
    where: { id: data.baseScopeVersionId },
  });

  if (!baseVersion) {
    throw new Error("Base version not found");
  }

  const proposal = await prisma.changeProposal.create({
    data: {
      projectId: data.projectId,
      baseScopeVersionId: data.baseScopeVersionId,
      proposedMajor: baseVersion.major,
      proposedMinor: baseVersion.minor + 1,
      title: data.title,
      changeNote: data.changeNote,
      rationale: data.rationale,
      impactTimeline: "NONE",
      impactCost: "NONE",
      risk: "LOW",
      requestedByParty: data.requestedByParty,
      requestedByName: data.requestedByName,
      createdByUserId: user.id,
      status: "DRAFT",
    },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: data.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "CREATE",
      entityType: "CHANGE_PROPOSAL",
      entityId: proposal.id,
      metadata: { title: data.title },
    },
  });

  revalidatePath(`/app/projects/${data.projectId}`);

  return proposal;
}

// ============================================================================
// UPDATE PROPOSAL DETAILS
// ============================================================================

export async function updateProposalDetails(
  proposalId: string,
  data: {
    title?: string;
    changeNote?: string;
    rationale?: string;
    impactTimeline?: "NONE" | "MINOR" | "MAJOR";
    impactCost?: "NONE" | "MINOR" | "MAJOR";
    risk?: "LOW" | "MED" | "HIGH";
  }
) {
  const user = await requireUser();

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  const updated = await prisma.changeProposal.update({
    where: { id: proposalId },
    data,
  });

  await prisma.auditEvent.create({
    data: {
      projectId: proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "UPDATE",
      entityType: "CHANGE_PROPOSAL",
      entityId: proposalId,
      metadata: { changes: data },
    },
  });

  revalidatePath(`/app/projects/${proposal.projectId}/proposals/${proposalId}`);

  return updated;
}

// ============================================================================
// ADD SECTION
// ============================================================================

export async function addProposalSection(
  proposalId: string,
  data: {
    title: string;
    sourceScopeSectionId?: string;
  }
) {
  const user = await requireUser();

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: { sections: true },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  const maxOrder = proposal.sections.reduce(
    (max, s) => Math.max(max, s.orderIndex),
    -1
  );

  const section = await prisma.proposalSection.create({
    data: {
      proposalId,
      title: data.title,
      orderIndex: maxOrder + 1,
      sourceScopeSectionId: data.sourceScopeSectionId,
    },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "CREATE",
      entityType: "PROPOSAL_SECTION",
      entityId: section.id,
      metadata: { proposalId, title: data.title },
    },
  });

  revalidatePath(`/app/projects/${proposal.projectId}/proposals/${proposalId}`);

  return section;
}

// ============================================================================
// UPDATE SECTION
// ============================================================================

export async function updateProposalSection(
  sectionId: string,
  data: {
    title?: string;
    orderIndex?: number;
  }
) {
  const user = await requireUser();

  const section = await prisma.proposalSection.findUnique({
    where: { id: sectionId },
    include: { proposal: true },
  });

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  const updated = await prisma.proposalSection.update({
    where: { id: sectionId },
    data,
  });

  await prisma.auditEvent.create({
    data: {
      projectId: section.proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "UPDATE",
      entityType: "PROPOSAL_SECTION",
      entityId: sectionId,
      metadata: { changes: data },
    },
  });

  revalidatePath(`/app/projects/${section.proposal.projectId}/proposals/${section.proposalId}`);

  return updated;
}

// ============================================================================
// DELETE SECTION
// ============================================================================

export async function deleteProposalSection(sectionId: string) {
  const user = await requireUser();

  const section = await prisma.proposalSection.findUnique({
    where: { id: sectionId },
    include: { proposal: true },
  });

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  await prisma.proposalSection.delete({
    where: { id: sectionId },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: section.proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "DELETE",
      entityType: "PROPOSAL_SECTION",
      entityId: sectionId,
    },
  });

  revalidatePath(`/app/projects/${section.proposal.projectId}/proposals/${section.proposalId}`);
}

// ============================================================================
// ADD ITEM
// ============================================================================

export async function addProposalItem(
  sectionId: string,
  data: {
    title: string;
    description: string;
    acceptanceCriteria?: string;
    priority: ScopeItemPriority;
    sourceScopeItemId?: string;
  }
) {
  const user = await requireUser();

  const section = await prisma.proposalSection.findUnique({
    where: { id: sectionId },
    include: { proposal: true, items: true },
  });

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  const maxOrder = section.items.reduce(
    (max, item) => Math.max(max, item.orderIndex),
    -1
  );

  const item = await prisma.proposalItem.create({
    data: {
      proposalSectionId: sectionId,
      title: data.title,
      description: data.description,
      acceptanceCriteria: data.acceptanceCriteria || "",
      priority: data.priority,
      orderIndex: maxOrder + 1,
      sourceScopeItemId: data.sourceScopeItemId,
    },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: section.proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "CREATE",
      entityType: "PROPOSAL_ITEM",
      entityId: item.id,
      metadata: { sectionId, title: data.title },
    },
  });

  revalidatePath(`/app/projects/${section.proposal.projectId}/proposals/${section.proposalId}`);

  return item;
}

// ============================================================================
// UPDATE ITEM
// ============================================================================

export async function updateProposalItem(
  itemId: string,
  data: {
    title?: string;
    description?: string;
    acceptanceCriteria?: string;
    priority?: ScopeItemPriority;
    orderIndex?: number;
  }
) {
  const user = await requireUser();

  const item = await prisma.proposalItem.findUnique({
    where: { id: itemId },
    include: {
      proposalSection: {
        include: { proposal: true },
      },
    },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  if (item.proposalSection.proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  const updated = await prisma.proposalItem.update({
    where: { id: itemId },
    data,
  });

  await prisma.auditEvent.create({
    data: {
      projectId: item.proposalSection.proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "UPDATE",
      entityType: "PROPOSAL_ITEM",
      entityId: itemId,
      metadata: { changes: data },
    },
  });

  revalidatePath(`/app/projects/${item.proposalSection.proposal.projectId}/proposals/${item.proposalSection.proposalId}`);

  return updated;
}

// ============================================================================
// DELETE ITEM
// ============================================================================

export async function deleteProposalItem(itemId: string) {
  const user = await requireUser();

  const item = await prisma.proposalItem.findUnique({
    where: { id: itemId },
    include: {
      proposalSection: {
        include: { proposal: true },
      },
    },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  if (item.proposalSection.proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  await prisma.proposalItem.delete({
    where: { id: itemId },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: item.proposalSection.proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "DELETE",
      entityType: "PROPOSAL_ITEM",
      entityId: itemId,
    },
  });

  revalidatePath(`/app/projects/${item.proposalSection.proposal.projectId}/proposals/${item.proposalSection.proposalId}`);
}

// ============================================================================
// SUBMIT PROPOSAL FOR APPROVAL
// ============================================================================

export async function submitProposalForApproval(proposalId: string) {
  const user = await requireUser();

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      sections: {
        include: { items: true },
        orderBy: { orderIndex: "asc" },
      },
      project: {
        include: {
          memberships: {
            where: { role: "LEADER" },
            include: { user: true, clientUser: true },
          },
        },
      },
    },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.status !== "DRAFT") {
    throw new Error("Proposal already submitted");
  }

  // Validate proposal has content
  if (proposal.sections.length === 0) {
    throw new Error("Proposal must have at least one section");
  }

  const hasItems = proposal.sections.some((s) => s.items.length > 0);
  if (!hasItems) {
    throw new Error("Proposal must have at least one item");
  }

  // Compute canonical diff
  if (proposal.baseScopeVersionId) {
    const diffSummary = await computeCanonicalDiff(
      proposal.baseScopeVersionId,
      proposalId
    );
    await persistDiffSummary(proposalId, diffSummary);
  }

  // Update proposal status
  await prisma.changeProposal.update({
    where: { id: proposalId },
    data: {
      status: "AWAITING_APPROVAL",
      submittedAt: new Date(),
    },
  });

  // Create approval request with recipients
  const devLeaders = proposal.project.memberships.filter(
    (m) => m.party === "DEV" && m.role === "LEADER"
  );
  const clientLeaders = proposal.project.memberships.filter(
    (m) => m.party === "CLIENT" && m.role === "LEADER"
  );

  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      projectId: proposal.projectId,
      proposalId: proposal.id,
      status: "PENDING",
      sentAt: new Date(),
      createdByUserId: user.id,
      recipients: {
        create: [
          ...devLeaders.map((m) => ({
            party: "DEV" as PartyType,
            userId: m.userId,
            clientUserId: m.clientUserId,
            email: m.user?.email || m.clientUser?.email || "",
            name: m.user?.name || m.clientUser?.name || "",
            status: "PENDING" as const,
          })),
          ...clientLeaders.map((m) => ({
            party: "CLIENT" as PartyType,
            userId: m.userId,
            clientUserId: m.clientUserId,
            email: m.user?.email || m.clientUser?.email || "",
            name: m.user?.name || m.clientUser?.name || "",
            status: "PENDING" as const,
          })),
        ],
      },
    },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "SUBMIT",
      entityType: "CHANGE_PROPOSAL",
      entityId: proposalId,
      metadata: {
        approvalRequestId: approvalRequest.id,
        recipientCount: devLeaders.length + clientLeaders.length,
      },
    },
  });

  revalidatePath(`/app/projects/${proposal.projectId}`);
  revalidatePath(`/app/projects/${proposal.projectId}/proposals/${proposalId}`);

  return { approvalRequest };
}

// ============================================================================
// COPY FROM BASE VERSION (Initialize proposal from current version)
// ============================================================================

export async function copyFromBaseVersion(proposalId: string) {
  const user = await requireUser();

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: {
      baseScopeVersion: {
        include: {
          sections: {
            include: { items: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  if (proposal.status !== "DRAFT") {
    throw new Error("Can only edit draft proposals");
  }

  // Copy all sections and items from base version
  for (const section of proposal.baseScopeVersion.sections) {
    const newSection = await prisma.proposalSection.create({
      data: {
        proposalId: proposal.id,
        title: section.title,
        orderIndex: section.orderIndex,
        sourceScopeSectionId: section.id,
      },
    });

    for (const item of section.items) {
      await prisma.proposalItem.create({
        data: {
          proposalSectionId: newSection.id,
          title: item.title,
          description: item.description,
          acceptanceCriteria: item.acceptanceCriteria || "",
          priority: item.priority,
          orderIndex: item.orderIndex,
          sourceScopeItemId: item.id,
        },
      });
    }
  }

  await prisma.auditEvent.create({
    data: {
      projectId: proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "COPY",
      entityType: "CHANGE_PROPOSAL",
      entityId: proposalId,
      metadata: { baseScopeVersionId: proposal.baseScopeVersionId },
    },
  });

  revalidatePath(`/app/projects/${proposal.projectId}/proposals/${proposalId}`);
}

// ============================================================================
// WITHDRAW PROPOSAL
// ============================================================================

export async function withdrawProposal(proposalId: string) {
  const user = await requireUser();

  const proposal = await prisma.changeProposal.findUnique({
    where: { id: proposalId },
    include: { project: true },
  });

  if (!proposal) {
    throw new Error("Proposal not found");
  }

  // Can only withdraw if DRAFT, INTERNAL_REVIEW, or AWAITING_APPROVAL
  if (!["DRAFT", "INTERNAL_REVIEW", "AWAITING_APPROVAL"].includes(proposal.status)) {
    throw new Error(`Cannot withdraw proposal with status: ${proposal.status}`);
  }

  // Update proposal status
  await prisma.changeProposal.update({
    where: { id: proposalId },
    data: { status: "WITHDRAWN" },
  });

  // Cancel any approval requests
  await prisma.approvalRequest.updateMany({
    where: {
      proposalId,
      status: { in: ["PENDING", "VIEWED"] },
    },
    data: { status: "CANCELLED" },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: proposal.projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "WITHDRAW",
      entityType: "CHANGE_PROPOSAL",
      entityId: proposalId,
      metadata: { previousStatus: proposal.status },
    },
  });

  revalidatePath(`/app/projects/${proposal.projectId}`);
  revalidatePath(`/app/projects/${proposal.projectId}/proposals/${proposalId}`);

  return { success: true };
}
