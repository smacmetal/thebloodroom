 import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const auth = cookieStore.get("br_auth");

    if (!auth) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, role: auth.value });
  } catch (err: any) {
    console.error("Whoami error:", err);
    return NextResponse.json({ authenticated: false, error: err.message });
  }
}
