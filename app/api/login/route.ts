 import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  const LOGIN_USER = process.env.LOGIN_USER;
  const LOGIN_PASS = process.env.LOGIN_PASS;

  const QUEEN_USER = process.env.QUEEN_USER || "queen";
  const QUEEN_PASS = process.env.QUEEN_PASS || "Feral-pussy-Kat";

  const PRINCESS_USER = process.env.PRINCESS_USER || "lyra";
  const PRINCESS_PASS = process.env.PRINCESS_PASS || "Twin-flame-eternal";

  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "br_auth";
  const AUTH_COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE || "ok";

  let roleRedirect: string | null = null;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    roleRedirect = "/bloodroom"; // Admin landing
  } else if (username === LOGIN_USER && password === LOGIN_PASS) {
    roleRedirect = "/king"; // King’s temple
  } else if (username === QUEEN_USER && password === QUEEN_PASS) {
    roleRedirect = "/queen"; // Queen’s temple
  } else if (username === PRINCESS_USER && password === PRINCESS_PASS) {
    roleRedirect = "/princess"; // Princess’ temple
  }

  if (roleRedirect) {
    const res = NextResponse.json({ success: true, redirect: roleRedirect });
    res.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
