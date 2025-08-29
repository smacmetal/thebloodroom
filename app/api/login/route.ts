 // C:\Users\steph\thebloodroom\app\api\login\route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // ENV-based credentials for each role
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  const LOGIN_USER = process.env.LOGIN_USER;
  const LOGIN_PASS = process.env.LOGIN_PASS;

  const QUEEN_USER = process.env.QUEEN_USER || "queen";
  const QUEEN_PASS = process.env.QUEEN_PASS || "Feral-pussy-Kat";

  const PRINCESS_USER = process.env.PRINCESS_USER || "lyra";
  const PRINCESS_PASS = process.env.PRINCESS_PASS || "Twin-flame-eternal";

  const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "br_auth";

  // Match login to role + redirect
  let roleRedirect: string | null = null;
  let matchedUser: string | null = null;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    roleRedirect = "/bloodroom";
    matchedUser = "stephen";
  } else if (username === LOGIN_USER && password === LOGIN_PASS) {
    roleRedirect = "/king";
    matchedUser = "stephen";
  } else if (username === QUEEN_USER && password === QUEEN_PASS) {
    roleRedirect = "/queen";
    matchedUser = "kat";
  } else if (username === PRINCESS_USER && password === PRINCESS_PASS) {
    roleRedirect = "/princess";
    matchedUser = "lyra";
  }

  if (!roleRedirect || !matchedUser) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 🔑 Fetch user UUID from Supabase
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", matchedUser)
    .single();

  if (error || !user) {
    console.error("Login failed to fetch user:", error);
    return NextResponse.json(
      { success: false, error: "User not found in DB" },
      { status: 500 }
    );
  }

  const auth_id = user.id;

  // ✅ Set cookie with user_id inside
  const res = NextResponse.json({
    success: true,
    redirect: roleRedirect,
    auth_id,
  });

  res.cookies.set(AUTH_COOKIE_NAME, auth_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
