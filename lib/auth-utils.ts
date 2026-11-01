import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "crypto";

// ============================================================================
// PASSWORD UTILITIES (for internal users only)
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================================================
// PORTAL TOKEN UTILITIES (for client users)
// ============================================================================

const TOKEN_SECRET = process.env.AUTH_SECRET;

if (!TOKEN_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required for portal token signing. " +
    "Please configure it in your .env file."
  );
}

export interface PortalTokenPayload {
  type: "approval" | "invite" | "portal-access";
  clientUserId?: string;
  approvalRequestId?: string;
  projectId?: string;
  expiresAt: number;
}

/**
 * Create a signed token for portal access
 * MUST be used for all /p/* routes
 */
export function signPortalToken(payload: PortalTokenPayload): string {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString("base64url");

  const signature = createHmac("sha256", TOKEN_SECRET)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

/**
 * Verify and decode a portal token
 * Returns null if invalid or expired
 */
export function verifyPortalToken(token: string): PortalTokenPayload | null {
  try {
    const [encoded, signature] = token.split(".");

    if (!encoded || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = createHmac("sha256", TOKEN_SECRET)
      .update(encoded)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const data = Buffer.from(encoded, "base64url").toString("utf-8");
    const payload = JSON.parse(data) as PortalTokenPayload;

    // Check expiry
    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate a random token for email verification
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}
