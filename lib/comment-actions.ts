import { prisma } from "./prisma";
import { requireUser } from "./session";
import { revalidatePath } from "next/cache";

// ============================================================================
// REOPEN COMMENT THREAD
// ============================================================================

export async function reopenCommentThread(threadId: string) {
  const user = await requireUser();

  const thread = await prisma.commentThread.findUnique({
    where: { id: threadId },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.status !== "RESOLVED") {
    throw new Error("Thread is not resolved");
  }

  await prisma.commentThread.update({
    where: { id: threadId },
    data: {
      status: "OPEN",
      resolvedAt: null,
      resolvedByUserId: null,
      resolvedByClientUserId: null,
    },
  });

  await prisma.auditEvent.create({
    data: {
      projectId: thread.projectId,
      actorType: thread.createdByUserId ? "USER" : "CLIENT_USER",
      actorUserId: user.id,
      action: "REOPEN_THREAD",
      entityType: "COMMENT_THREAD",
      entityId: threadId,
      metadata: {},
    },
  });

  revalidatePath(`/app/projects/${thread.projectId}`);

  return thread;
}
