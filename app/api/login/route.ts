// C:\Users\steph\thebloodroom\app\api\login\route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/lib/supabaseClient";

// POST /api/login
export async function POST(req: Request) {
  try {
    const { username, password, remember } = await req.json();

    // Verify against environment creds (for MVP simple auth)
    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    if (username === adminUser && password === adminPass) {
      // Fetch user row from Supabase
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("id, role, username, email")
        .eq("username", username)
        .single();

      if (error || !user) {
        return NextResponse.json(
          { error: "User not found in database" },
          { status: 401 }
        );
      }

      // Set cookies
      const cookieStore = cookies();
      cookieStore.set("br_auth", "ok", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60, // 30d or 1h
      });
      cookieStore.set("br_user", username, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60,
      });

      return NextResponse.json({ ok: true, user });
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (err) {
    console.error("❌ Login error:", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}

