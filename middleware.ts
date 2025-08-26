 import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // Create a Supabase client using the anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // If user not logged in → always redirect to /login
  if (!user && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based rules
  if (pathname.startsWith("/queen") && user?.email !== "queen@thebloodroom.com") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/princess") && user?.email !== "princess@thebloodroom.com") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/king") && user?.email !== "king@thebloodroom.com") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
