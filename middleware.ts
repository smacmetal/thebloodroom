 import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Allow login page itself
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Check auth cookie
  const cookieName = process.env.AUTH_COOKIE_NAME || "br_auth";
  const cookieValue = process.env.AUTH_COOKIE_VALUE || "ok";
  const cookie = req.cookies.get(cookieName);

  if (!cookie || cookie.value !== cookieValue) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// This matcher ensures middleware runs for all routes except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
