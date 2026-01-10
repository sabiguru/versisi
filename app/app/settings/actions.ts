"use server";

import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================================================
// UPDATE PROFILE
// ============================================================================

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/app/settings");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

// ============================================================================
// CONNECTED ACCOUNTS
// ============================================================================

export async function getConnectedAccounts() {
  const user = await requireUser();

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      provider: true,
      providerAccountId: true,
    },
  });

  return accounts;
}

export async function disconnectAccount(accountId: string) {
  const user = await requireUser();

  try {
    // Verify the account belongs to this user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return {
        success: false,
        error: "Account not found",
      };
    }

    // Check if user has other auth methods
    const accountCount = await prisma.account.count({
      where: { userId: user.id },
    });

    if (accountCount <= 1) {
      return {
        success: false,
        error: "Cannot disconnect your only authentication method",
      };
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    revalidatePath("/app/settings");

    return {
      success: true,
      message: "Account disconnected successfully",
    };
  } catch (error) {
    console.error("Error disconnecting account:", error);
    return {
      success: false,
      error: "Failed to disconnect account",
    };
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function getActiveSessions() {
  const user = await requireUser();

  const sessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expires: {
        gt: new Date(), // Only active sessions
      },
    },
    select: {
      id: true,
      sessionToken: true,
      expires: true,
    },
    orderBy: {
      expires: "desc",
    },
  });

  return sessions;
}

export async function revokeSession(sessionId: string) {
  const user = await requireUser();

  try {
    // Verify the session belongs to this user
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    revalidatePath("/app/settings");

    return {
      success: true,
      message: "Session revoked successfully",
    };
  } catch (error) {
    console.error("Error revoking session:", error);
    return {
      success: false,
      error: "Failed to revoke session",
    };
  }
}

export async function revokeAllOtherSessions(currentSessionToken: string) {
  const user = await requireUser();

  try {
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        sessionToken: {
          not: currentSessionToken,
        },
      },
    });

    revalidatePath("/app/settings");

    return {
      success: true,
      message: "All other sessions revoked successfully",
    };
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return {
      success: false,
      error: "Failed to revoke sessions",
    };
  }
}
