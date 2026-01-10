"use client";

import { useState } from "react";
import { removeMember, updateMemberRole, addMember } from "./actions";
import { PartyType, ProjectRole } from "@prisma/client";
import { UserPlus, Trash2, Shield, User as UserIcon, Eye } from "lucide-react";

interface Membership {
  id: string;
  party: PartyType;
  role: ProjectRole;
  userId: string | null;
  clientUserId: string | null;
  user: { id: string; name: string | null; email: string } | null;
  clientUser: { id: string; name: string | null; email: string } | null;
}

interface TeamPageClientProps {
  projectId: string;
  memberships: Membership[];
  isLeader: boolean;
}

export function TeamPageClient({
  projectId,
  memberships: initialMemberships,
  isLeader,
}: TeamPageClientProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [party, setParty] = useState<PartyType>("DEV");
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (membership: Membership): Promise<void> => {
    const displayName =
      membership.user?.name ||
      membership.user?.email ||
      membership.clientUser?.name ||
      membership.clientUser?.email ||
      "this member";

    if (!confirm(`Remove ${displayName} from the project?`)) {
      return;
    }

    const result = await removeMember(membership.id, projectId);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Failed to remove member");
    }
  };

  const handleRoleChange = async (membership: Membership, newRole: ProjectRole): Promise<void> => {
    const result = await updateMemberRole(membership.id, projectId, newRole);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error || "Failed to update role");
    }
  };

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await addMember(projectId, email.trim(), party, role);

    setIsSubmitting(false);

    if (result.success) {
      setEmail("");
      setParty("DEV");
      setRole("MEMBER");
      setShowAddForm(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to add member");
    }
  }

  const devMembers = initialMemberships.filter((m) => m.party === "DEV");
  const clientMembers = initialMemberships.filter((m) => m.party === "CLIENT");

  const getRoleIcon = (role: ProjectRole) => {
    switch (role) {
      case "LEADER":
        return <Shield className="w-4 h-4 text-accent" />;
      case "MEMBER":
        return <UserIcon className="w-4 h-4 text-blue-600" />;
      case "VIEWER":
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderMemberList = (members: Membership[], title: string) => (
    <div className="rounded-lg border border-text/10 bg-white p-6">
      <h2 className="mb-4 font-heading text-xl font-semibold text-text">{title}</h2>
      {members.length === 0 ? (
        <p className="text-sm text-text/60">No {title.toLowerCase()} yet</p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const displayUser = member.user || member.clientUser;
            if (!displayUser) return null;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-text/10 bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  {getRoleIcon(member.role)}
                  <div>
                    <div className="font-medium text-text">
                      {displayUser.name || displayUser.email}
                    </div>
                    <div className="text-sm text-text/60">{displayUser.email}</div>
                  </div>
                </div>

                {isLeader && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member, e.target.value as ProjectRole)
                      }
                      className="rounded-md border border-text/20 px-3 py-1 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="LEADER">Leader</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member)}
                      className="p-2 text-text/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {!isLeader && (
                  <span className="text-sm text-text/60 capitalize">
                    {member.role.toLowerCase()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {isLeader && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-text">
                Add Team Member
              </h2>
              <p className="mt-1 text-sm text-text/60">
                Invite users to collaborate on this project
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="user@example.com"
                />
                <p className="mt-1 text-xs text-text/60">
                  User must already have an account
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Party *
                  </label>
                  <select
                    value={party}
                    onChange={(e) => setParty(e.target.value as PartyType)}
                    className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="DEV">Developer</option>
                    <option value="CLIENT">Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ProjectRole)}
                    className="w-full rounded-md border border-text/20 px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="LEADER">Leader</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium !text-white bg-accent hover:bg-accent/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Member"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                    setEmail("");
                  }}
                  className="px-6 py-2 text-sm font-medium text-text border border-text/20 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMemberList(devMembers, "Developer Team")}
        {renderMemberList(clientMembers, "Client Team")}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Role Permissions</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            <strong>Leader:</strong> Full access - can manage team, edit project, create
            proposals, approve changes
          </li>
          <li>
            <strong>Member:</strong> Can create proposals and participate in discussions
          </li>
          <li>
            <strong>Viewer:</strong> Read-only access to project and proposals
          </li>
        </ul>
      </div>
    </div>
  );
}
