 import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME  = process.env.AUTH_COOKIE_NAME  || "br_auth";
const COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE || "ok";
// Optional: configure remember-me duration (seconds). Default 14 days.
const REMEMBER_MAX_AGE =
  Number(process.env.AUTH_REMEMBER_MAX_AGE_SEC || 60 * 60 * 24 * 14);

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";

  let username = "";
  let password = "";
  let remember = false;

  // Form-encoded
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      username = String(form.get("username") ?? "");
      password = String(form.get("password") ?? "");
      remember = String(form.get("remember") ?? "") === "on";
    } catch {}
  }

  // JSON
  if (!username && !password && ct.includes("application/json")) {
    try {
      const json = await req.json();
      username = String(json?.username ?? "");
      password = String(json?.password ?? "");
      remember = Boolean(json?.remember ?? false);
    } catch {}
  }

  // TODO: replace with real auth check
  const valid = username.length > 0 && password.length > 0;
  if (!valid) {
    if (ct.includes("application/json")) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login?error=1", req.url));
  }

  // Build cookie options
  const baseCookie = {
    name: COOKIE_NAME,
    value: COOKIE_VALUE, // must match middleware expectation
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  // Session cookie (no maxAge) vs persistent
  const res = ct.includes("application/json")
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/", req.url));

  if (remember) {
    res.cookies.set({ ...baseCookie, maxAge: REMEMBER_MAX_AGE });
  } else {
    res.cookies.set(baseCookie); // session cookie
  }

  return res;
}
