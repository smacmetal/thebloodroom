 // app/api/whoami/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "br_auth";
const COOKIE_VALUE = process.env.AUTH_COOKIE_VALUE || "ok";
const USER_COOKIE = "br_user";

export async function GET() {
  try {
    // 1. Validate session cookie
    const authCookie = cookies().get(COOKIE_NAME);
    if (!authCookie || authCookie.value !== COOKIE_VALUE) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // 2. Grab username from user cookie
    const userCookie = cookies().get(USER_COOKIE);
    const username = userCookie?.value || "";

    if (!username) {
      return NextResponse.json({ ok: false, error: "Missing username cookie" }, { status: 401 });
    }

    // 3. Lookup in Supabase
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role, created_at")
      .eq("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // 4. Return full info
    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        username: data.username,
        role: data.role,
        created_at: data.created_at,
      },
    });
  } catch (err: any) {
    console.error("[whoami] error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected error" }, { status: 500 });
  }
}
