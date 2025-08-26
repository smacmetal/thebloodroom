export const runtime = "nodejs"; // force Node runtime

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import bcrypt from "bcryptjs";

// ...rest of your login route unchanged

const COOKIE_NAME   = process.env.AUTH_COOKIE_NAME  || "br_auth";
const COOKIE_VALUE  = process.env.AUTH_COOKIE_VALUE || "ok";
const REMEMBER_MAX_AGE = Number(process.env.AUTH_REMEMBER_MAX_AGE_SEC || 60 * 60 * 24 * 14);

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let username = "";
  let password = "";
  let remember = false;

  // Parse JSON
  if (ct.includes("application/json")) {
    try {
      const json = await req.json();
      username = String(json?.username ?? "").toLowerCase();
      password = String(json?.password ?? "");
      remember = Boolean(json?.remember ?? false);
    } catch {}
  }

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
  }

  // 🔑 Fetch user from Supabase
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password, role")
    .eq("username", username)
    .single();

  if (error || !user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 401 });
  }

  // 🔐 Compare password (plain vs hash)
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  // 🍪 Cookies
  const baseCookie = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  const authCookie = {
    name: COOKIE_NAME,
    value: COOKIE_VALUE,
    ...baseCookie,
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  };

  const userCookie = {
    name: "br_user",
    value: user.role, // 👈 store role directly (king/queen/princess)
    ...baseCookie,
    ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
  };

  // Set cookies
  const res = NextResponse.json({
    ok: true,
    redirect: `/${user.role}`, // 👈 tell client where to go
    user: { id: user.id, username: user.username, role: user.role },
  });

  res.cookies.set(authCookie);
  res.cookies.set(userCookie);

  return res;
}
