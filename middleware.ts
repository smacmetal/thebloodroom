 import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * --- SECTION A: Admin/Dev Guards ---
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
 * --- SECTION B: App Auth Guards ---
 */
const AUTH_COOKIE_NAME  = process.env.AUTH_COOKIE_NAME  || "br_auth";
const AUTH_COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE || "ok";

// Public routes (NO auth required)
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/login",
]);

// Public prefixes (NO auth required)
const PUBLIC_PREFIXES = ["/api/login", "/api/logout", "/_next", "/favicon", "/icons", "/images", "/public"];

const PROTECTED_PREFIXES = [
  "/bloodroom",
  "/queen",
  "/princess",
  "/king",
  "/vault",
  "/workroom",
];

function isAuthed(req: NextRequest): boolean {
  return req.cookies.get(AUTH_COOKIE_NAME)?.value === AUTH_COOKIE_VALUE;
}

function handleAppGuards(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow clearly public assets & APIs
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Only guard protected sections
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();

  if (isAuthed(req)) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * --- Middleware Entrypoint ---
 */
export function middleware(req: NextRequest) {
  // Admin/dev guards
  const adminResult = handleAdminGuards(req);
  if (adminResult instanceof NextResponse && adminResult.status !== 200) {
    return adminResult;
  }

  // App guards
  const appResult = handleAppGuards(req);
  if (appResult instanceof NextResponse && appResult.status !== 200) {
    return appResult;
  }

  return NextResponse.next();
}

/**
 * --- Run middleware for (almost) everything ---
 * (Exclude only static asset paths and image optimizer)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
