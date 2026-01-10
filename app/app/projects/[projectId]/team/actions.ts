"use server";

import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PartyType, ProjectRole } from "@prisma/client";

export async function removeMember(membershipId: string, projectId: string) {
  const userId = await requireUserId();

  // Check if user is a leader on this project
  const userMembership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
      role: "LEADER",
    },
  });

  if (!userMembership) {
    return {
      success: false,
      error: "Only project leaders can remove members",
    };
  }

  // Don't allow removing the last leader
  const leaderCount = await prisma.projectMembership.count({
    where: {
      projectId,
      role: "LEADER",
    },
  });

  const membershipToRemove = await prisma.projectMembership.findUnique({
    where: { id: membershipId },
  });

  if (membershipToRemove?.role === "LEADER" && leaderCount <= 1) {
    return {
      success: false,
      error: "Cannot remove the last leader from the project",
    };
  }

  try {
    await prisma.projectMembership.delete({
      where: { id: membershipId },
    });

    revalidatePath(`/app/projects/${projectId}/team`);
    revalidatePath(`/app/projects/${projectId}`);

    return {
      success: true,
      message: "Member removed successfully",
    };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      error: "Failed to remove member",
    };
  }
}

export async function updateMemberRole(
  membershipId: string,
  projectId: string,
  newRole: ProjectRole
) {
  const userId = await requireUserId();

  // Check if user is a leader on this project
  const userMembership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
      role: "LEADER",
    },
  });

  if (!userMembership) {
    return {
      success: false,
      error: "Only project leaders can change roles",
    };
  }

  // Don't allow demoting the last leader
  if (newRole !== "LEADER") {
    const leaderCount = await prisma.projectMembership.count({
      where: {
        projectId,
        role: "LEADER",
      },
    });

    const membershipToUpdate = await prisma.projectMembership.findUnique({
      where: { id: membershipId },
    });

    if (membershipToUpdate?.role === "LEADER" && leaderCount <= 1) {
      return {
        success: false,
        error: "Cannot demote the last leader",
      };
    }
  }

  try {
    await prisma.projectMembership.update({
      where: { id: membershipId },
      data: { role: newRole },
    });

    revalidatePath(`/app/projects/${projectId}/team`);
    revalidatePath(`/app/projects/${projectId}`);

    return {
      success: true,
      message: "Role updated successfully",
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      success: false,
      error: "Failed to update role",
    };
  }
}

export async function addMember(
  projectId: string,
  email: string,
  party: PartyType,
  role: ProjectRole
) {
  const userId = await requireUserId();

  // Check if user is a leader on this project
  const userMembership = await prisma.projectMembership.findFirst({
    where: {
      projectId,
      userId,
      role: "LEADER",
    },
  });

  if (!userMembership) {
    return {
      success: false,
      error: "Only project leaders can add members",
    };
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found with that email address",
      };
    }

    // Check if user is already a member
    const existing = await prisma.projectMembership.findFirst({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "User is already a member of this project",
      };
    }

    await prisma.projectMembership.create({
      data: {
        projectId,
        userId: user.id,
        party,
        role,
      },
    });

    revalidatePath(`/app/projects/${projectId}/team`);
    revalidatePath(`/app/projects/${projectId}`);

    return {
      success: true,
      message: "Member added successfully",
    };
  } catch (error) {
    console.error("Error adding member:", error);
    return {
      success: false,
      error: "Failed to add member",
    };
  }
}
