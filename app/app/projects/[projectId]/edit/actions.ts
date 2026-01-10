"use server";

import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Name is too long"),
  clientSummary: z.string().min(1, "Client summary is required"),
  internalDescription: z.string().optional(),
  clientOrgId: z.string().optional(),
  workspaceId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "RELEASED", "ARCHIVED"]),
  archiveReason: z.string().optional(),
});

export async function updateProject(projectId: string, formData: FormData) {
  const userId = await requireUserId();

  // Verify user has access to this project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      memberships: {
        some: { userId },
      },
    },
  });

  if (!project) {
    return {
      success: false,
      error: "Project not found or you don't have permission to edit it",
    };
  }

  const parsed = updateProjectSchema.safeParse({
    name: formData.get("name"),
    clientSummary: formData.get("clientSummary"),
    internalDescription: formData.get("internalDescription") || undefined,
    clientOrgId: formData.get("clientOrgId") || undefined,
    workspaceId: formData.get("workspaceId") || undefined,
    status: formData.get("status"),
    archiveReason: formData.get("archiveReason") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    const updateData: any = {
      name: parsed.data.name,
      clientSummary: parsed.data.clientSummary,
      internalDescription: parsed.data.internalDescription || null,
      clientOrgId: parsed.data.clientOrgId || null,
      workspaceId: parsed.data.workspaceId || null,
      status: parsed.data.status,
    };

    // If archiving and reason is provided, store it in internal description
    if (parsed.data.status === "ARCHIVED" && parsed.data.archiveReason) {
      const existingDesc = updateData.internalDescription || "";
      const archiveNote = `\n\n[ARCHIVED: ${new Date().toISOString().split("T")[0]}]\nReason: ${parsed.data.archiveReason}`;
      updateData.internalDescription = (existingDesc + archiveNote).trim();
    }

    await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath("/app/projects");

    return {
      success: true,
      message: "Project updated successfully",
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return {
      success: false,
      error: "Failed to update project",
    };
  }
}
