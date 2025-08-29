 import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "br_auth";
  const AUTH_COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE || "ok";

  const cookie = req.cookies.get(AUTH_COOKIE_NAME);

  // If cookie missing or wrong, redirect to login
  if (!cookie || cookie.value !== AUTH_COOKIE_VALUE) {
    if (!req.nextUrl.pathname.startsWith("/login")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
