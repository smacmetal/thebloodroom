// C:\Users\steph\thebloodroom\app\api\login\route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // Optional: env-driven credentials
  const expectedUser = process.env.LOGIN_USER || "king";
  const expectedPass = process.env.LOGIN_PASS || "trinity";

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieName = process.env.AUTH_COOKIE_NAME || "br_auth";
  const cookieValue = process.env.AUTH_COOKIE_VALUE || "ok";

  const res = NextResponse.json({ success: true });
  res.cookies.set(cookieName, cookieValue, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
