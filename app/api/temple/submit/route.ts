 // C:\Users\steph\thebloodroom\app\api\temple\submit\route.ts
export const runtime = "nodejs";

import twilio from "twilio";
import { supabase } from "@/lib/supabaseClient";

type ChamberKey = "king" | "queen" | "princess";
type ChamberLabel = "King" | "Queen" | "Princess";

const KEY_TO_LABEL: Record<ChamberKey, ChamberLabel> = {
  king: "King",
  queen: "Queen",
  princess: "Princess",
};

const SMS_ENABLED = (process.env.BLOODROOM_SMS_ENABLED || "false") === "true";

const FROM_BY_AUTHOR: Record<ChamberLabel, string | undefined> = {
  King: process.env.TWILIO_KING_NUMBER,
  Queen: process.env.TWILIO_QUEEN_NUMBER,
  Princess: process.env.TWILIO_PRINCESS_NUMBER,
};

const TO_BY_ROLE: Record<ChamberLabel, string | undefined> = {
  King: process.env.SMS_TO_KING,
  Queen: process.env.SMS_TO_QUEEN,
  Princess: process.env.SMS_TO_PRINCESS,
};

const SID = process.env.TWILIO_ACCOUNT_SID || "";
const TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const canSms = !!(SID && TOKEN) && SMS_ENABLED;
const smsClient = canSms ? twilio(SID, TOKEN) : null;

function randomId(n = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const chamberRaw = String(form.get("chamber") || "").toLowerCase();
    const chamber: ChamberKey = (["king", "queen", "princess"].includes(chamberRaw) ? chamberRaw : "king") as ChamberKey;
    const author = (String(form.get("author") || KEY_TO_LABEL[chamber]).trim() || KEY_TO_LABEL[chamber]) as ChamberLabel;

    const auth_id = String(form.get("auth_id") || "");

    const smsFlag = String(form.get("sms") || "false") === "true" && SMS_ENABLED;
    const format = String(form.get("format") || "text");

    const recipients: ChamberLabel[] = [];
    form.getAll("recipients").forEach((r) => {
      if (typeof r === "string" && ["King", "Queen", "Princess"].includes(r)) recipients.push(r as ChamberLabel);
    });

    const contentHtml = String(form.get("contentHtml") || "");
    const content = String(form.get("content") || "");

    const ts = Date.now();
    const id = `${ts}-${randomId(6)}`;
    const label = KEY_TO_LABEL[chamber];

    // ✅ Upload attachments to Supabase storage
    let attachments: Array<{ name?: string; path: string; type?: string; url: string; thumbUrl: string }> = [];
    const files = form.getAll("files").filter((f) => typeof f === "object" && "arrayBuffer" in f && f.name);

    for (const anyFile of files) {
      const f: any = anyFile;
      const buf = Buffer.from(await f.arrayBuffer());
      const ext = f.name.split(".").pop();
      const safeName = f.name.replace(/[^\w.\-]+/g, "_");
      const filePath = `temple/${label}/${id}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments") // 👈 must exist in Supabase
        .upload(filePath, buf, {
          contentType: f.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      attachments.push({
        name: safeName,
        path: filePath,
        type: f.type || undefined,
        url: publicUrlData.publicUrl,
        thumbUrl: publicUrlData.publicUrl,
      });
    }

    // Insert into Supabase "messages" table
    const { error } = await supabase.from("messages").insert([
      {
        uid: id,
        chamber: label,
        author,
        recipients,
        content,
        content_html: contentHtml,
        sms: smsFlag,
        auth_id,
        timestamp: ts,
        attachments, // now stored as JSON
      },
    ]);
    if (error) console.error("Supabase insert error:", error);

    // SMS fanout
    if (smsFlag && canSms && recipients.length) {
      const from = FROM_BY_AUTHOR[author];
      const stripped = content || contentHtml.replace(/<[^>]*>/g, " ").trim();
      const body = `[${author}] ${stripped}`.slice(0, 1500);

      if (from) {
        await Promise.all(
          recipients.map(async (r) => {
            const to = TO_BY_ROLE[r];
            if (to) {
              try {
                await smsClient!.messages.create({ from, to, body });
              } catch (e: any) {
                console.warn(`[sms] failed ${author} -> ${r}:`, e?.message || e);
              }
            }
          })
        );
      }
    }

    return new Response(JSON.stringify({ ok: true, id, attachmentsCount: attachments.length }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[temple/submit] error:", err?.message || err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || "failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
