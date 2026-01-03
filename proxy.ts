import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ============================================================================
// PROXY - ROUTE PROTECTION (edge-safe, no Prisma/Node crypto)
// ============================================================================

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // Public routes (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/verify-request",
    "/forgot-password",
    "/pricing",
  ];

  // Portal routes (use signed tokens, NOT session auth)
  if (pathname.startsWith("/p/")) {
    // Portal routes verify tokens internally; do not redirect to login
    return NextResponse.next();
  }

  // Auth API routes (always allow)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route ? true : pathname.startsWith(route + "/")
  );

  // ENFORCE: /app/* requires authentication
  if (pathname.startsWith("/app")) {
    if (!isAuthenticated) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // If authenticated and trying to access public routes, allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Default: allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
