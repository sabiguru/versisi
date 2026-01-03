import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user session
 * Returns null if not authenticated
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current authenticated user
 * Throws if not authenticated
 */
export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

/**
 * Get the current user ID
 * Throws if not authenticated
 */
export async function requireUserId() {
  const user = await requireUser();
  return user.id;
}
