 // C:\Users\steph\thebloodroom\app\api\whoami\route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/whoami
export async function GET(req: Request) {
  try {
    // Check auth cookie
    const cookieName = process.env.AUTH_COOKIE_NAME || "br_auth";
    const cookieValue = process.env.AUTH_COOKIE_VALUE || "ok";

    const cookie = req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(cookieName + "="));

    if (!cookie) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const value = cookie.split("=")[1];
    if (value !== cookieValue) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    // Success: return user identity
    return NextResponse.json({
      ok: true,
      user: {
        name: "Bloodroom Admin",
        role: "system",
      },
    });
  } catch (err: any) {
    console.error("[whoami] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to resolve identity" },
      { status: 500 }
    );
  }
}
