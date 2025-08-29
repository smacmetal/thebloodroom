 import { NextResponse } from "next/server";
import { sendToRoles, MessagePayload } from "@/lib/sendToRoles";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { author, recipients, note, attachments, meta } = await req.json();

    if (!author || !recipients || recipients.length === 0 || !note) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload: MessagePayload = {
      author,
      text: String(note).trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments || [],
      meta: meta || {},
    };

    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];

    const result = await sendToRoles(payload, recipientArray, {
      writeRoleIndexes: true,
    });

    return NextResponse.json({
      ok: true,
      id: result.id,
      idempotencyKey: result.idempotencyKey,
      author,
      recipients: recipientArray,
      createdAt: payload.timestamp,
      s3: {
        canonicalKey: result.canonicalKey,
        indexKeys: result.indexKeys,
      },
    });
  } catch (err: any) {
    console.error("[workroom/notes] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to save workroom note" },
      { status: 500 }
    );
  }
}
