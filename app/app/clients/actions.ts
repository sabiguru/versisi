"use server";

import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const clientOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(200, "Name is too long"),
});

export async function createClientOrg(formData: FormData) {
  await requireUserId();

  const parsed = clientOrgSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    await prisma.clientOrg.create({
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/app/clients");

    return {
      success: true,
      message: "Client organization created successfully",
    };
  } catch (error) {
    console.error("Error creating client org:", error);
    return {
      success: false,
      error: "Failed to create client organization",
    };
  }
}

export async function updateClientOrg(clientOrgId: string, formData: FormData) {
  await requireUserId();

  const parsed = clientOrgSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    await prisma.clientOrg.update({
      where: { id: clientOrgId },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/app/clients");

    return {
      success: true,
      message: "Client organization updated successfully",
    };
  } catch (error) {
    console.error("Error updating client org:", error);
    return {
      success: false,
      error: "Failed to update client organization",
    };
  }
}

export async function deleteClientOrg(clientOrgId: string) {
  await requireUserId();

  try {
    // Check if client org is used in any projects
    const projectCount = await prisma.project.count({
      where: { clientOrgId },
    });

    if (projectCount > 0) {
      return {
        success: false,
        error: `Cannot delete client organization that is used in ${projectCount} project(s)`,
      };
    }

    await prisma.clientOrg.delete({
      where: { id: clientOrgId },
    });

    revalidatePath("/app/clients");

    return {
      success: true,
      message: "Client organization deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting client org:", error);
    return {
      success: false,
      error: "Failed to delete client organization",
    };
  }
}
