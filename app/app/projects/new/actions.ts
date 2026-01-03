"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getDefaultApprovalRules } from "@/lib/rbac";
import { z } from "zod";
import { PartyType, ProjectRole, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

// ============================================================================
// PROJECT CREATION WIZARD SERVER ACTIONS
// ============================================================================

const projectBasicsSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  clientSummary: z.string().min(1, "Client summary is required"),
  internalDescription: z.string().optional(),
});

const userRoleSchema = z.object({
  userParty: z.enum(["DEV", "CLIENT"]),
  userIsLeader: z.boolean(),
});

const oppositePartySchema = z.object({
  orgId: z.string().optional(),
  orgName: z.string().min(1, "Organization name is required"),
  leaderEmail: z.string().email("Valid email required"),
  leaderName: z.string().optional(),
});

const memberSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["LEADER", "MEMBER", "VIEWER"]),
  party: z.enum(["DEV", "CLIENT"]),
});

const approvalRulesSchema = z.object({
  client: z.object({
    required: z.number().min(1),
    mode: z.enum(["ANY", "ALL"]),
  }),
  dev: z.object({
    required: z.number().min(1),
    mode: z.enum(["ANY", "ALL"]),
  }),
});

export interface CreateProjectWizardData {
  // Step 1
  projectName: string;
  clientSummary: string;
  internalDescription?: string;

  // Step 2-3
  userParty: PartyType;
  userIsLeader: boolean;

  // Step 4-5
  oppositePartyOrgId?: string;
  oppositePartyOrgName: string;
  oppositePartyLeaderEmail: string;
  oppositePartyLeaderName?: string;

  // Step 6
  additionalMembers: Array<{
    email: string;
    name?: string;
    role: ProjectRole;
    party: PartyType;
  }>;

  // Step 7
  approvalRuleClient: { required: number; mode: "ANY" | "ALL" };
  approvalRuleDev: { required: number; mode: "ANY" | "ALL" };
}

/**
 * Complete project creation wizard
 * Creates: Project, Memberships, ClientOrg (if needed), Proposal v1.0, ApprovalRequest
 */
export async function createProjectFromWizard(data: CreateProjectWizardData) {
  const userId = await requireUserId();

  // Validate data
  projectBasicsSchema.parse({
    name: data.projectName,
    clientSummary: data.clientSummary,
    internalDescription: data.internalDescription,
  });

  userRoleSchema.parse({
    userParty: data.userParty,
    userIsLeader: data.userIsLeader,
  });

  oppositePartySchema.parse({
    orgId: data.oppositePartyOrgId,
    orgName: data.oppositePartyOrgName,
    leaderEmail: data.oppositePartyLeaderEmail,
    leaderName: data.oppositePartyLeaderName,
  });

  approvalRulesSchema.parse({
    client: data.approvalRuleClient,
    dev: data.approvalRuleDev,
  });

  // Determine parties
  const isUserDev = data.userParty === "DEV";
  const isUserClient = data.userParty === "CLIENT";

  // Create/get ClientOrg
  let clientOrgId: string | null = null;

  if (isUserClient) {
    // User is client - create or use their org
    if (data.oppositePartyOrgId) {
      clientOrgId = data.oppositePartyOrgId;
    } else {
      // Create new client org for user
      const clientOrg = await prisma.clientOrg.create({
        data: {
          name: data.oppositePartyOrgName,
        },
      });
      clientOrgId = clientOrg.id;
    }
  } else {
    // User is dev - create client org
    const clientOrg = await prisma.clientOrg.create({
      data: {
        name: data.oppositePartyOrgName,
      },
    });
    clientOrgId = clientOrg.id;
  }

  // Create project
  const project = await prisma.project.create({
    data: {
      name: data.projectName,
      clientSummary: data.clientSummary,
      internalDescription: data.internalDescription,
      status: ProjectStatus.DRAFT,
      clientOrgId,
      portalEnabled: true,
      portalPublicKey: generatePortalKey(),
      approvalRuleClient: data.approvalRuleClient as any,
      approvalRuleDev: data.approvalRuleDev as any,
      createdByUserId: userId,
    },
  });

  // Create project memberships

  // 1. Add creator
  await prisma.projectMembership.create({
    data: {
      projectId: project.id,
      userId,
      party: data.userParty,
      role: data.userIsLeader ? "LEADER" : "MEMBER",
    },
  });

  // 2. Create opposite party leader (as ClientUser if they're CLIENT)
  if (isUserDev) {
    // Create CLIENT leader
    const clientUser = await prisma.clientUser.create({
      data: {
        clientOrgId: clientOrgId!,
        email: data.oppositePartyLeaderEmail,
        name: data.oppositePartyLeaderName,
      },
    });

    await prisma.projectMembership.create({
      data: {
        projectId: project.id,
        clientUserId: clientUser.id,
        party: "CLIENT",
        role: "LEADER",
      },
    });
  } else {
    // Create DEV leader (internal user - will be invited)
    // For now, skip creation - they'll be invited via email
    // TODO: Create User invitation system
  }

  // 3. Add additional members
  for (const member of data.additionalMembers) {
    if (member.party === "DEV") {
      // Internal user - skip for now (needs invitation system)
      // await prisma.projectMembership.create({ ... });
    } else {
      // Client user
      let clientUser = await prisma.clientUser.findFirst({
        where: {
          clientOrgId: clientOrgId!,
          email: member.email,
        },
      });

      if (!clientUser) {
        clientUser = await prisma.clientUser.create({
          data: {
            clientOrgId: clientOrgId!,
            email: member.email,
            name: member.name,
          },
        });
      }

      await prisma.projectMembership.create({
        data: {
          projectId: project.id,
          clientUserId: clientUser.id,
          party: "CLIENT",
          role: member.role,
        },
      });
    }
  }

  // 4. Create initial Proposal v1.0 (NOT ScopeVersion)
  const proposal = await prisma.changeProposal.create({
    data: {
      projectId: project.id,
      baseScopeVersionId: "", // Special case: v1.0 has no base
      proposedMajor: 1,
      proposedMinor: 0,
      status: "DRAFT",
      title: "Initial Scope Agreement",
      changeNote: "Initial project scope - v1.0",
      rationale: "First version of the project scope agreement",
      impactTimeline: "NONE",
      impactCost: "NONE",
      risk: "LOW",
      requestedByParty: data.userParty,
      createdByUserId: userId,
    },
  });

  // Create empty base version for v1.0 proposal
  // This is required for the schema but represents "no previous version"
  const baseVersion = await prisma.scopeVersion.create({
    data: {
      projectId: project.id,
      major: 0,
      minor: 0,
      changeNote: "Base placeholder",
      rationale: "Placeholder for v1.0 proposal base",
      impactTimeline: "NONE",
      impactCost: "NONE",
      risk: "LOW",
      createdByUserId: userId,
    },
  });

  // Update proposal to reference base version
  await prisma.changeProposal.update({
    where: { id: proposal.id },
    data: { baseScopeVersionId: baseVersion.id },
  });

  // 5. Create ApprovalRequest
  const approvalRequest = await prisma.approvalRequest.create({
    data: {
      projectId: project.id,
      proposalId: proposal.id,
      status: "PENDING",
      createdByUserId: userId,
    },
  });

  // 6. Create approval recipients (leaders only)
  const leaders = await prisma.projectMembership.findMany({
    where: {
      projectId: project.id,
      role: "LEADER",
    },
    include: {
      user: true,
      clientUser: true,
    },
  });

  for (const leader of leaders) {
    await prisma.approvalRecipient.create({
      data: {
        approvalRequestId: approvalRequest.id,
        party: leader.party,
        userId: leader.userId,
        clientUserId: leader.clientUserId,
        email: leader.user?.email || leader.clientUser?.email || "",
        name: leader.user?.name || leader.clientUser?.name,
        status: "PENDING",
      },
    });
  }

  // 7. Mark approval as sent
  await prisma.approvalRequest.update({
    where: { id: approvalRequest.id },
    data: {
      status: "PENDING",
      sentAt: new Date(),
    },
  });

  // 8. Send emails to recipients (TODO: implement email sending)
  // await sendApprovalEmails(approvalRequest.id);

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      projectId: project.id,
      actorType: "USER",
      actorUserId: userId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project.id,
      metadata: {
        projectName: project.name,
        userParty: data.userParty,
        userIsLeader: data.userIsLeader,
      },
    },
  });

  return { projectId: project.id, proposalId: proposal.id };
}

/**
 * Generate unique portal key
 */
function generatePortalKey(): string {
  return `prj_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate wizard data before submission
 */
export async function validateWizardData(data: CreateProjectWizardData) {
  // Check that we have at least 1 DEV leader and 1 CLIENT leader
  const devLeaders = data.additionalMembers.filter(
    (m) => m.party === "DEV" && m.role === "LEADER"
  );
  const clientLeaders = data.additionalMembers.filter(
    (m) => m.party === "CLIENT" && m.role === "LEADER"
  );

  // Count user if they're a leader
  const userIsDevLeader = data.userParty === "DEV" && data.userIsLeader;
  const userIsClientLeader = data.userParty === "CLIENT" && data.userIsLeader;

  const totalDevLeaders = devLeaders.length + (userIsDevLeader ? 1 : 0);
  const totalClientLeaders =
    clientLeaders.length + (userIsClientLeader ? 1 : 0) + 1; // +1 for opposite party leader

  if (totalDevLeaders < 1) {
    throw new Error("Project must have at least 1 DEV leader");
  }

  if (totalClientLeaders < 1) {
    throw new Error("Project must have at least 1 CLIENT leader");
  }

  return { valid: true };
}
