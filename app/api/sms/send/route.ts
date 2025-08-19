 // app/api/sms/send/route.ts
import { NextRequest } from "next/server";
import twilio from "twilio";

const SID = process.env.TWILIO_ACCOUNT_SID!;
const TOKEN = process.env.TWILIO_AUTH_TOKEN!;

const FROM_BY_AUTHOR: Record<string, string | undefined> = {
  King: process.env.TWILIO_KING_NUMBER,
  Queen: process.env.TWILIO_QUEEN_NUMBER,
  Princess: process.env.TWILIO_PRINCESS_NUMBER,
  Bloodroom: process.env.TWILIO_BLOODROOM_NUMBER || process.env.TWILIO_KING_NUMBER,
};

// Recipient handset mapping (who receives)
const TO_BY_ROLE: Record<string, string | undefined> = {
  King: process.env.SMS_TO_KING,
  Queen: process.env.SMS_TO_QUEEN,
  Princess: process.env.SMS_TO_PRINCESS,
};

type Payload = {
  author: "King" | "Queen" | "Princess" | "Bloodroom";
  recipients: string[]; // e.g. ["King","Princess"]
  content: string;      // plain text (we’ll strip HTML outside)
};

export async function POST(req: NextRequest) {
  try {
    if (!SID || !TOKEN) {
      return new Response(JSON.stringify({ ok: false, error: "Twilio ENV missing" }), { status: 500 });
    }

    const body = (await req.json()) as Payload;
    const author = body.author || "Bloodroom";
    const content = (body.content || "").toString().trim();
    const recipients = Array.from(new Set(body.recipients || [])).filter(Boolean);

    if (!content) {
      return new Response(JSON.stringify({ ok: false, error: "Empty content" }), { status: 400 });
    }
    if (!recipients.length) {
      return new Response(JSON.stringify({ ok: false, error: "No recipients" }), { status: 400 });
    }

    const fromNumber =
      FROM_BY_AUTHOR[author] ||
      process.env.TWILIO_BLOODROOM_NUMBER ||
      process.env.TWILIO_KING_NUMBER;

    if (!fromNumber) {
      return new Response(JSON.stringify({ ok: false, error: "No FROM number configured" }), { status: 500 });
    }

    const client = twilio(SID, TOKEN);

    // Normalize message header so the handset knows author at a glance
    const text = `[Bloodroom] ${author}:\n${content}`;

    const results: Array<{ to: string; sid?: string; error?: string }> = [];

    for (const r of recipients) {
      const toNum = TO_BY_ROLE[r];
      if (!toNum) {
        results.push({ to: r, error: "Missing recipient handset ENV" });
        continue;
      }

      try {
        const msg = await client.messages.create({
          from: fromNumber,
          to: toNum,
          body: text,
        });
        results.push({ to: toNum, sid: msg.sid });
      } catch (e: any) {
        results.push({ to: toNum, error: e?.message || "Twilio send failed" });
      }
    }

    const ok = results.some(r => !!r.sid);
    return new Response(JSON.stringify({ ok, results }), { status: ok ? 200 : 207 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "server error" }), { status: 500 });
  }
}
