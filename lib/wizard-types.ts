import { PartyType, ProjectRole } from "@prisma/client";

// ============================================================================
// PROJECT CREATION WIZARD TYPES
// ============================================================================

export interface WizardState {
  // Step 1: Project basics
  projectName: string;
  clientSummary: string;
  internalDescription?: string;

  // Step 2-3: User's role in project
  userParty: PartyType | null; // DEV or CLIENT
  userIsLeader: boolean;

  // Step 4-5: Opposite party
  oppositePartyOrgId?: string;
  oppositePartyOrgName?: string;
  oppositePartyLeaderEmail: string;
  oppositePartyLeaderName?: string;

  // Step 6: Additional members
  devMembers: WizardMember[];
  clientMembers: WizardMember[];

  // Step 7: Approval rules
  approvalRuleClient: { required: number; mode: "ANY" | "ALL" };
  approvalRuleDev: { required: number; mode: "ANY" | "ALL" };

  // Current step
  currentStep: number;
}

export interface WizardMember {
  email: string;
  name?: string;
  role: ProjectRole; // LEADER, MEMBER, VIEWER
  party: PartyType; // DEV or CLIENT
}

export const WIZARD_STEPS = [
  "Project Basics",
  "Your Role",
  "Opposite Party",
  "Invite Leader",
  "Additional Members",
  "Approval Rules",
  "Review & Create",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];
