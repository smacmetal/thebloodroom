 // C:\Users\steph\thebloodroom\middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * --- SECTION A: Admin/Dev Tools ---
 * Basic Auth guarding ONLY in production AND when DEV_TOOLS_ENABLED=true.
 */
const adminProtectedMatchers = [
  "/test",
  "/debug",
  "/vault/json",
  "/messages/monitor",
  "/api/stats",
];

function handleAdminGuards(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  if (process.env.DEV_TOOLS_ENABLED !== "true") return NextResponse.next();

  const url = req.nextUrl;
  const needsAuth = adminProtectedMatchers.some((p) =>
    url.pathname.startsWith(p)
  );
  if (!needsAuth) return NextResponse.next();

  const user = process.env.ADMIN_USER || "";
  const pass = process.env.ADMIN_PASS || "";
  const expected = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

  const got = req.headers.get("authorization") || "";
  if (got !== expected) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Bloodroom Admin"' },
    });
  }
  return NextResponse.next();
}

/**
 * --- SECTION B: App Auth (Bloodroom, Temples, Vault, Workroom) ---
 * Redirects to /login if not authenticated.
 */
const appProtectedMatchers = [
  "/bloodroom",
  "/queen",
  "/princess",
  "/king",
  "/vault",
  "/workroom",
];

function isAuthed(req: NextRequest): boolean {
  const name = process.env.AUTH_COOKIE_NAME || "br_auth";
  const val = process.env.AUTH_COOKIE_VALUE || "ok";
  return req.cookies.get(name)?.value === val;
}

function handleAppGuards(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Don’t guard the login page itself
  if (pathname.startsWith("/login")) return NextResponse.next();

  const needsAuth = appProtectedMatchers.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();

  if (isAuthed(req)) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * --- Middleware entrypoint ---
 */
export function middleware(req: NextRequest) {
  const adminResult = handleAdminGuards(req);
  if (adminResult.status === 401 || adminResult.redirected) return adminResult;

  const appResult = handleAppGuards(req);
  if (appResult.status === 401 || appResult.redirected) return appResult;

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin/dev
    "/test/:path*",
    "/debug/:path*",
    "/vault/json/:path*",
    "/messages/monitor/:path*",
    "/api/stats",

    // App rooms
    "/bloodroom/:path*",
    "/queen/:path*",
    "/princess/:path*",
    "/king/:path*",
    "/vault/:path*",
    "/workroom/:path*",

    // Base paths
    "/bloodroom",
    "/queen",
    "/princess",
    "/king",
    "/vault",
    "/workroom",

    "/login",
  ],
};
