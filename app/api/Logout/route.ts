import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  // 🩸 Delete known auth cookies (customize names later if needed)
  cookieStore.delete("auth");       // example token cookie
  cookieStore.delete("session");    // example session cookie

  return NextResponse.json({ ok: true });
}
