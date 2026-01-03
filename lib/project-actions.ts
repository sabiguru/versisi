"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ============================================================================
// SET PROJECT STATUS
// ============================================================================

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus
) {
  const user = await requireUser();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Validate transitions
  const currentStatus = project.status;

  if (currentStatus === "ARCHIVED" && status !== "ACTIVE") {
    throw new Error("Archived projects can only be reactivated to ACTIVE status");
  }

  if (status === "ACTIVE" && currentStatus === "DRAFT") {
    throw new Error("DRAFT projects become ACTIVE automatically when v1.0 is approved");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  await prisma.auditEvent.create({
    data: {
      projectId,
      actorType: "USER",
      actorUserId: user.id,
      action: "UPDATE_PROJECT_STATUS",
      entityType: "PROJECT",
      entityId: projectId,
      metadata: {
        previousStatus: currentStatus,
        newStatus: status,
      },
    },
  });

  revalidatePath(`/app/projects/${projectId}`);

  return { success: true };
}

// ============================================================================
// ARCHIVE PROJECT
// ============================================================================

export async function archiveProject(projectId: string) {
  return setProjectStatus(projectId, "ARCHIVED");
}

// ============================================================================
// RELEASE PROJECT
// ============================================================================

export async function releaseProject(projectId: string) {
  return setProjectStatus(projectId, "RELEASED");
}
