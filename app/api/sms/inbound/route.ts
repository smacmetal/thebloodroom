 // app/api/sms/inbound/route.ts
// Receives Twilio webhooks, auto-detects role by the "To" number, and saves the SMS.

import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// E.164 numbers from env, used to detect which chamber this inbound belongs to
const NUM_KING = (process.env.TWILIO_KING_NUMBER || "").trim();
const NUM_QUEEN = (process.env.TWILIO_QUEEN_NUMBER || "").trim();
const NUM_PRINCESS = (process.env.TWILIO_PRINCESS_NUMBER || "").trim();

type ChamberKey = "king" | "queen" | "princess";
type ChamberLabel = "King" | "Queen" | "Princess";
const ROOT = process.cwd();

const MAP_TO_KEY: Record<string, ChamberKey> = {};
if (NUM_KING) MAP_TO_KEY[NUM_KING] = "king";
if (NUM_QUEEN) MAP_TO_KEY[NUM_QUEEN] = "queen";
if (NUM_PRINCESS) MAP_TO_KEY[NUM_PRINCESS] = "princess";

const KEY_TO_LABEL: Record<ChamberKey, ChamberLabel> = {
  king: "King",
  queen: "Queen",
  princess: "Princess",
};

function randomId(n = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const Body = String(form.get("Body") || "").trim();
    const From = String(form.get("From") || "").trim();
    const To = String(form.get("To") || "").trim();

    if (!Body) {
      return new Response("No content", { status: 200 }); // reply 200 so Twilio doesn't retry
    }

    const chamberKey = MAP_TO_KEY[To];
    if (!chamberKey) {
      console.warn("[sms/inbound] No chamber mapping for To:", To);
      return new Response("Unknown number", { status: 200 });
    }
    const chamberLabel = KEY_TO_LABEL[chamberKey];

    const ts = Date.now();
    const id = `${ts}-${randomId(6)}`;

    // minimal payload consistent with vault/messages
    const payload = {
      id,
      messageId: id,
      author: chamberLabel,          // message is FROM the role whose number was texted
      recipients: [],                 // unknown from inbound
      content: Body,
      contentHtml: "",
      format: "text",
      sms: true,
      attachments: [],
      timestamp: ts,
      createdAt: new Date(ts).toISOString(),
      chamber: chamberLabel,
      meta: { inbound: true, from: From, to: To },
    };

    const msgDir = path.join(ROOT, "data", chamberKey, "messages");
    await fs.mkdir(msgDir, { recursive: true });
    await fs.writeFile(path.join(msgDir, `${id}.json`), JSON.stringify(payload, null, 2), "utf-8");

    // TwiML “empty” ok
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (e: any) {
    console.error("[sms/inbound] error:", e?.message || e);
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
