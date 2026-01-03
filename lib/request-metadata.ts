/**
 * Request Metadata Utilities
 *
 * Extract IP address and User-Agent from Next.js requests
 * Used for signature audit trail
 */

import { headers } from "next/headers";

/**
 * Get client IP address from request headers
 * Checks various headers in order of reliability
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Check X-Forwarded-For (most common for proxied requests)
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // Take first IP if multiple (client IP)
    return forwardedFor.split(",")[0].trim();
  }

  // Check X-Real-IP
  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to "unknown" if no IP found
  return "unknown";
}

/**
 * Get User-Agent from request headers
 */
export async function getUserAgent(): Promise<string> {
  const headersList = await headers();
  return headersList.get("user-agent") || "unknown";
}

/**
 * Get both IP and User-Agent in one call
 */
export async function getRequestMetadata(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  const [ipAddress, userAgent] = await Promise.all([
    getClientIp(),
    getUserAgent(),
  ]);

  return { ipAddress, userAgent };
}
