 import { NextResponse } from "next/server";
import { saveToVault, deleteFromVault } from "@/app/lib/vault";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const saved = await saveToVault({
      chamber: "workroom", // force all Workroom entries here
      author: body.author || "King",
      content: body.content,
      content_html: body.content_html,
      auth_id: body.auth_id,
      recipients: body.recipients || [],
      attachments: body.attachments || [],
      smsResults: body.smsResults || [],
    });

    return NextResponse.json({ ok: true, saved });
  } catch (err: any) {
    console.error("[workroom/notes POST] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing note id" },
        { status: 400 }
      );
    }

    const deleted = await deleteFromVault(id);
    return NextResponse.json({ ok: deleted });
  } catch (err: any) {
    console.error("[workroom/notes DELETE] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
