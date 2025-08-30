 // C:\Users\steph\thebloodroom\app\api\vault\route.ts

import { NextResponse } from "next/server";

// temporary in-memory store (replace with Supabase/DB later)
let VAULT: any[] = [];

/**
 * POST /api/vault
 * Accepts { chamber, author, content, content_html, auth_id, sms, recipients }
 * Stamps a timestamp + uid and saves into Vault.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      chamber = "workroom",
      author = "unknown",
      content = "",
      content_html = "",
      auth_id = "",
      sms = false,
      recipients = [],
    } = body;

    if (!content && !content_html) {
      return NextResponse.json(
        { ok: false, error: "Missing message content." },
        { status: 400 }
      );
    }

    const saved = {
      id: Date.now().toString(), // unique enough for now
      chamber,
      author,
      content,
      content_html,
      auth_id,
      recipients,
      sms,
      createdAt: new Date().toISOString(),
    };

    VAULT.unshift(saved); // add to top
    console.log("[vault] Saved:", saved);

    return NextResponse.json({ ok: true, saved });
  } catch (err: any) {
    console.error("[vault POST] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vault
 * Returns everything in the Vault.
 */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, messages: VAULT });
  } catch (err: any) {
    console.error("[vault GET] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
