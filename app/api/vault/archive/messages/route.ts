 import { NextResponse } from "next/server";
import { getVaultMessages, deleteFromVault } from "@/app/lib/vault";

/**
 * GET /api/vault/archive/messages?chamber=king
 * Returns messages filtered by chamber (king, queen, princess, workroom).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chamber = searchParams.get("chamber") || undefined;

    const messages = await getVaultMessages(chamber);
    return NextResponse.json({ ok: true, messages });
  } catch (err: any) {
    console.error("[vault/archive GET] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vault/archive/messages?uid=123
 * Removes a message from Vault by id.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "Missing uid" },
        { status: 400 }
      );
    }

    const deleted = await deleteFromVault(uid);
    return NextResponse.json({ ok: deleted });
  } catch (err: any) {
    console.error("[vault/archive DELETE] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
