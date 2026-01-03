/**
 * Portal Token Utilities
 *
 * Secure signed tokens for client portal access and approval signing.
 * Tokens are time-limited and cryptographically signed.
 */

import { createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";

const TOKEN_SECRET = process.env.PORTAL_TOKEN_SECRET;

if (\!TOKEN_SECRET) {
  throw new Error(
    "PORTAL_TOKEN_SECRET environment variable is required for portal token signing. " +
    "Please configure it in your .env file."
  );
}

const TOKEN_EXPIRY_HOURS = 72; // 3 days default

export interface PortalTokenPayload {
  type: "PROJECT_ACCESS" | "APPROVAL_SIGN";
  projectId: string;
  approvalRecipientId?: string;
  email: string;
  expiresAt: number;
}

/**
 * Generate a secure portal access token
 */
export function generatePortalToken(payload: Omit<PortalTokenPayload, "expiresAt">): string {
  const expiresAt = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

  const fullPayload: PortalTokenPayload = {
    ...payload,
    expiresAt,
  };

  const data = JSON.stringify(fullPayload);
  const encoded = Buffer.from(data).toString("base64url");

  // Create HMAC signature
  const signature = createHash("sha256")
    .update(encoded + TOKEN_SECRET)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a portal token
 */
export function verifyPortalToken(token: string): PortalTokenPayload | null {
  try {
    const [encoded, signature] = token.split(".");

    if (!encoded || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = createHash("sha256")
      .update(encoded + TOKEN_SECRET)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const data = Buffer.from(encoded, "base64url").toString("utf8");
    const payload = JSON.parse(data) as PortalTokenPayload;

    // Check expiry
    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a portal URL for project access
 */
export function generatePortalUrl(projectId: string, email: string): string {
  const token = generatePortalToken({
    type: "PROJECT_ACCESS",
    projectId,
    email,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/p/${projectId}?token=${token}`;
}

/**
 * Generate a signing URL for approval request
 */
export async function generateApprovalSigningUrl(
  approvalRecipientId: string
): Promise<string | null> {
  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
    include: {
      approvalRequest: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!recipient) {
    return null;
  }

  const token = generatePortalToken({
    type: "APPROVAL_SIGN",
    projectId: recipient.approvalRequest.projectId,
    approvalRecipientId: recipient.id,
    email: recipient.email,
  });

  const publicKey = recipient.approvalRequest.project.portalPublicKey;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${baseUrl}/p/${publicKey}/approve/${recipient.approvalRequestId}?token=${token}`;
}

/**
 * Verify a token is valid for a specific approval recipient
 */
export async function verifyApprovalToken(
  token: string,
  approvalRecipientId: string
): Promise<boolean> {
  const payload = verifyPortalToken(token);

  if (!payload) {
    return false;
  }

  if (payload.type !== "APPROVAL_SIGN") {
    return false;
  }

  if (payload.approvalRecipientId !== approvalRecipientId) {
    return false;
  }

  // Verify recipient exists and is in correct state
  const recipient = await prisma.approvalRecipient.findUnique({
    where: { id: approvalRecipientId },
  });

  if (!recipient) {
    return false;
  }

  if (recipient.email !== payload.email) {
    return false;
  }

  // Can only sign if status is PENDING or VIEWED
  if (recipient.status !== "PENDING" && recipient.status !== "VIEWED") {
    return false;
  }

  return true;
}

/**
 * Generate a unique portal public key for a project
 */
export function generatePortalPublicKey(): string {
  return `prj_${randomBytes(16).toString("hex")}`;
}
