"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PartyType, ProjectRole } from "@prisma/client";
import {
  createProjectFromWizard,
  validateWizardData,
  type CreateProjectWizardData,
} from "@/app/app/projects/new/actions";
import { getDefaultApprovalRules } from "@/lib/rbac";

const STEPS = [
  "Project Basics",
  "Your Role",
  "Opposite Party",
  "Invite Leader",
  "Additional Members",
  "Approval Rules",
  "Review & Create",
] as const;

interface WizardMember {
  email: string;
  name?: string;
  role: ProjectRole;
  party: PartyType;
}

export function ProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [clientSummary, setClientSummary] = useState("");
  const [internalDescription, setInternalDescription] = useState("");

  const [userParty, setUserParty] = useState<PartyType | null>(null);
  const [userIsLeader, setUserIsLeader] = useState(false);

  const [oppositePartyOrgName, setOppositePartyOrgName] = useState("");
  const [oppositePartyLeaderEmail, setOppositePartyLeaderEmail] = useState("");
  const [oppositePartyLeaderName, setOppositePartyLeaderName] = useState("");

  const [additionalMembers, setAdditionalMembers] = useState<WizardMember[]>(
    []
  );

  const [approvalRules, setApprovalRules] = useState<{
    client: { required: number; mode: "ANY" | "ALL" };
    dev: { required: number; mode: "ANY" | "ALL" };
  }>({
    client: { required: 1, mode: "ANY" },
    dev: { required: 1, mode: "ANY" },
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Project basics
        return projectName.trim() && clientSummary.trim();
      case 1: // Your role
        return userParty !== null;
      case 2: // User leader status
        return true; // userIsLeader can be true or false
      case 3: // Opposite party org
        return oppositePartyOrgName.trim();
      case 4: // Opposite party leader
        return (
          oppositePartyLeaderEmail.trim() &&
          oppositePartyLeaderEmail.includes("@")
        );
      case 5: // Additional members
        return true; // Optional
      case 6: // Approval rules
        return true; // Has defaults
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const addMember = () => {
    setAdditionalMembers([
      ...additionalMembers,
      {
        email: "",
        name: "",
        role: "MEMBER",
        party: userParty === "DEV" ? "DEV" : "CLIENT",
      },
    ]);
  };

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...additionalMembers];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalMembers(updated);
  };

  const removeMember = (index: number) => {
    setAdditionalMembers(additionalMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userParty) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const wizardData: CreateProjectWizardData = {
        projectName,
        clientSummary,
        internalDescription,
        userParty,
        userIsLeader,
        oppositePartyOrgName,
        oppositePartyLeaderEmail,
        oppositePartyLeaderName,
        additionalMembers: additionalMembers.filter((m) => m.email.trim()),
        approvalRuleClient: approvalRules.client,
        approvalRuleDev: approvalRules.dev,
      };

      // Validate
      await validateWizardData(wizardData);

      // Create project
      const result = await createProjectFromWizard(wizardData);

      // Redirect to proposal editor to build initial scope
      router.push(`/app/projects/${result.projectId}/proposals/${result.proposalId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-text/60">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${index === currentStep ? "font-medium text-accent" : ""}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index === currentStep
                    ? "bg-accent !text-white"
                    : index < currentStep
                      ? "bg-accent/20 text-accent"
                      : "bg-text/10 text-text/40"
                }`}
              >
                {index + 1}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 ${index < currentStep ? "bg-accent/40" : "bg-text/10"}`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm font-medium text-text">
          Step {currentStep + 1}: {STEPS[currentStep]}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="rounded-lg border border-text/10 bg-white p-8">
        {/* Step 0: Project Basics */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Project Basics
            </h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Website Redesign Project"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Client Summary *
              </label>
              <textarea
                value={clientSummary}
                onChange={(e) => setClientSummary(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Brief description visible to clients"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Internal Description (optional)
              </label>
              <textarea
                value={internalDescription}
                onChange={(e) => setInternalDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Internal notes not visible to clients"
              />
            </div>
          </div>
        )}

        {/* Step 1: Your Side */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Which side are you on?
            </h2>
            <p className="text-text/70">
              Are you the developer/agency or the client for this project?
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUserParty("DEV")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  userParty === "DEV"
                    ? "border-accent bg-accent/5"
                    : "border-text/10 hover:border-text/20"
                }`}
              >
                <div className="font-medium text-text">
                  Developer / Agency Side
                </div>
                <p className="mt-1 text-sm text-text/60">
                  I&apos;m building/delivering the project
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserParty("CLIENT")}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  userParty === "CLIENT"
                    ? "border-accent bg-accent/5"
                    : "border-text/10 hover:border-text/20"
                }`}
              >
                <div className="font-medium text-text">Client Side</div>
                <p className="mt-1 text-sm text-text/60">
                  I&apos;m the stakeholder/buyer
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Leader Status */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Are you a leader?
            </h2>
            <p className="text-text/70">
              Leaders can approve scope changes and invite team members.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setUserIsLeader(true)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  userIsLeader
                    ? "border-accent bg-accent/5"
                    : "border-text/10 hover:border-text/20"
                }`}
              >
                <div className="font-medium text-text">
                  Yes, I&apos;m a leader
                </div>
                <p className="mt-1 text-sm text-text/60">
                  I can approve changes and manage the team
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserIsLeader(false)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                  !userIsLeader
                    ? "border-accent bg-accent/5"
                    : "border-text/10 hover:border-text/20"
                }`}
              >
                <div className="font-medium text-text">No, I&apos;m a member</div>
                <p className="mt-1 text-sm text-text/60">
                  I can view and comment but not approve
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Opposite Party Org */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              {userParty === "DEV" ? "Client" : "Developer"} Organization
            </h2>
            <p className="text-text/70">
              What is the name of the{" "}
              {userParty === "DEV" ? "client" : "developer"} organization?
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Organization Name *
              </label>
              <input
                type="text"
                value={oppositePartyOrgName}
                onChange={(e) => setOppositePartyOrgName(e.target.value)}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Acme Inc."
              />
            </div>
          </div>
        )}

        {/* Step 4: Opposite Party Leader */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Invite {userParty === "DEV" ? "Client" : "Developer"} Leader
            </h2>
            <p className="text-text/70">
              At least one leader is required on both sides to approve scope
              changes.
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Email *
              </label>
              <input
                type="email"
                value={oppositePartyLeaderEmail}
                onChange={(e) => setOppositePartyLeaderEmail(e.target.value)}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="leader@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Name (optional)
              </label>
              <input
                type="text"
                value={oppositePartyLeaderName}
                onChange={(e) => setOppositePartyLeaderName(e.target.value)}
                className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        {/* Step 5: Additional Members */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Additional Team Members
            </h2>
            <p className="text-text/70">
              Invite additional members to the project (optional).
            </p>

            {additionalMembers.length > 0 && (
              <div className="space-y-4">
                {additionalMembers.map((member, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-text/10 p-4"
                  >
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text/70">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            updateMember(index, "email", e.target.value)
                          }
                          className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                          placeholder="member@example.com"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text/70">
                          Name
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) =>
                            updateMember(index, "name", e.target.value)
                          }
                          className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text/70">
                          Party
                        </label>
                        <select
                          value={member.party}
                          onChange={(e) =>
                            updateMember(index, "party", e.target.value)
                          }
                          className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                        >
                          <option value="DEV">Dev Team</option>
                          <option value="CLIENT">Client Team</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text/70">
                          Role
                        </label>
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateMember(index, "role", e.target.value)
                          }
                          className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                        >
                          <option value="LEADER">Leader</option>
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="w-full rounded-md border border-warning/20 px-3 py-2 text-sm text-warning hover:bg-warning/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addMember}
              className="w-full rounded-md border-2 border-dashed border-text/20 px-4 py-3 text-sm font-medium text-text/70 hover:border-accent hover:text-accent"
            >
              + Add Member
            </button>
          </div>
        )}

        {/* Step 6: Approval Rules */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Approval Rules
            </h2>
            <p className="text-text/70">
              Define how many signatures are required to approve scope changes.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-text/10 p-4">
                <h3 className="mb-3 font-medium text-text">
                  Client Side Approvals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text/70">
                      Required Signatures
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={approvalRules.client.required}
                      onChange={(e) =>
                        setApprovalRules({
                          ...approvalRules,
                          client: {
                            ...approvalRules.client,
                            required: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text/70">
                      Mode
                    </label>
                    <select
                      value={approvalRules.client.mode}
                      onChange={(e) =>
                        setApprovalRules({
                          ...approvalRules,
                          client: {
                            ...approvalRules.client,
                            mode: e.target.value as "ANY" | "ALL",
                          },
                        })
                      }
                      className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                    >
                      <option value="ANY">Any (first N)</option>
                      <option value="ALL">All leaders</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-text/10 p-4">
                <h3 className="mb-3 font-medium text-text">
                  Dev Side Approvals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text/70">
                      Required Signatures
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={approvalRules.dev.required}
                      onChange={(e) =>
                        setApprovalRules({
                          ...approvalRules,
                          dev: {
                            ...approvalRules.dev,
                            required: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                      className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text/70">
                      Mode
                    </label>
                    <select
                      value={approvalRules.dev.mode}
                      onChange={(e) =>
                        setApprovalRules({
                          ...approvalRules,
                          dev: {
                            ...approvalRules.dev,
                            mode: e.target.value as "ANY" | "ALL",
                          },
                        })
                      }
                      className="w-full rounded-md border border-text/20 px-3 py-2 text-sm text-text"
                    >
                      <option value="ANY">Any (first N)</option>
                      <option value="ALL">All leaders</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm text-text/70">
              <p>
                <strong>Default:</strong> 1 signature from each side (DEV +
                CLIENT)
              </p>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-text">
              Review & Create
            </h2>
            <p className="text-text/70">
              Review your project setup before creating.
            </p>

            <div className="space-y-4 rounded-lg border border-text/10 bg-text/5 p-4 text-sm">
              <div>
                <span className="font-medium text-text/70">Project:</span>{" "}
                {projectName}
              </div>
              <div>
                <span className="font-medium text-text/70">Your Role:</span>{" "}
                {userParty} {userIsLeader ? "Leader" : "Member"}
              </div>
              <div>
                <span className="font-medium text-text/70">
                  {userParty === "DEV" ? "Client" : "Developer"} Org:
                </span>{" "}
                {oppositePartyOrgName}
              </div>
              <div>
                <span className="font-medium text-text/70">
                  {userParty === "DEV" ? "Client" : "Developer"} Leader:
                </span>{" "}
                {oppositePartyLeaderEmail}
              </div>
              <div>
                <span className="font-medium text-text/70">
                  Additional Members:
                </span>{" "}
                {additionalMembers.length}
              </div>
              <div>
                <span className="font-medium text-text/70">
                  Approval Rules:
                </span>{" "}
                {approvalRules.dev.required} DEV +{" "}
                {approvalRules.client.required} CLIENT
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="text-sm text-text/70">
                <strong>Next steps:</strong>
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-text/70">
                <li>Project will be created with initial proposal (v1.0)</li>
                <li>Approval request will be sent to all leaders</li>
                <li>Leaders must sign to activate the project</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="rounded-md border border-text/20 px-6 py-2 font-medium text-text transition-colors hover:bg-text/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="rounded-md bg-accent px-6 py-2 font-medium !text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="rounded-md bg-accent px-6 py-2 font-medium !text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        )}
      </div>
    </div>
  );
}
