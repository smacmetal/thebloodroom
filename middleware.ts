 // middleware.ts
export const runtime = "nodejs"; // force Node runtime

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ...rest of your middleware

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🍪 Grab cookies
  const brAuth = req.cookies.get("br_auth")?.value;
  const brUser = req.cookies.get("br_user")?.value;

  // Not logged in → force login
  if (brAuth !== "ok" && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based page guards
  if (pathname.startsWith("/king") && brUser !== "stephen") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/queen") && brUser !== "Kat") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/princess") && brUser !== "lyra") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
