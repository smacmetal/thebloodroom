 import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensure Next registers this at runtime

const COOKIE = process.env.AUTH_COOKIE_NAME || "br_auth";
const SITE   = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(_req: NextRequest) {
  // Option A: server-side redirect to /login after clearing cookie
  const res = NextResponse.redirect(new URL("/login", SITE));
  res.cookies.set(COOKIE, "", { path: "/", expires: new Date(0) });
  return res;
}

// Optional: GET route to verify from a browser
export async function GET(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COKIE, "", { path: "/", expires: new Date(0) });
  return res;
}
