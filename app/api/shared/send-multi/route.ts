 // C:\Users\steph\thebloodroom\app\api\shared\send-multi\route.ts
import { NextResponse } from "next/server";
import { sendToRoles, MessagePayload } from "@/lib/sendToRoles";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { author, recipients, content, attachments, meta } = await req.json();

    if (!author || !recipients || recipients.length === 0 || !content) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize recipients into array
    const recipientArray = Array.isArray(recipients)
      ? recipients
      : [recipients];

    // Build canonical payload
    const payload: MessagePayload = {
      author,
      text: String(content).trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments || [],
      meta: meta || {},
    };

    // Send to roles (S3 persistence + Twilio SMS/MMS delivery)
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
    console.error("[send-multi] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
