 // app/api/temple/submit/route.ts
export const runtime = "nodejs"; // ✅ keep only once

import { promises as fs } from "fs";
import path from "path";
import twilio from "twilio";
import { supabase } from "@/lib/supabaseClient";

type ChamberKey = "king" | "queen" | "princess";
type ChamberLabel = "King" | "Queen" | "Princess";
const ROOT = process.cwd();

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
const toPublicUrl = (p: string) => `/${p.replace(/\\/g, "/").replace(/^\/+/, "")}`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const chamberRaw = String(form.get("chamber") || "").toLowerCase();
    const chamber: ChamberKey = (["king", "queen", "princess"].includes(chamberRaw) ? chamberRaw : "king") as ChamberKey;
    const author = (String(form.get("author") || KEY_TO_LABEL[chamber]).trim() || KEY_TO_LABEL[chamber]) as ChamberLabel;

    const auth_id = String(form.get("auth_id") || ""); // 👈 NEW (passed from frontend)

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

    // Attachments to local FS
    const baseAttachDir = path.join(ROOT, "attachments", "wall", label, id);
    await fs.mkdir(baseAttachDir, { recursive: true });

    const attachments: Array<{ name?: string; path: string; type?: string; url: string; thumbUrl: string }> = [];
    const files = form.getAll("files");
    for (const anyFile of files) {
      const f: any = anyFile as any;
      if (!f?.arrayBuffer || !f.name) continue;
      const buf = Buffer.from(await f.arrayBuffer());
      const safeName = f.name.replace(/[^\w.\-]+/g, "_");
      const abs = path.join(baseAttachDir, safeName);
      await fs.writeFile(abs, buf);
      const rel = path.join("attachments", "wall", label, id, safeName);
      const url = toPublicUrl(rel);
      attachments.push({ name: safeName, path: rel, type: f.type || undefined, url, thumbUrl: url });
    }

    const basePayload = {
      id,
      author,
      recipients,
      content,
      contentHtml,
      format,
      sms: smsFlag,
      attachments,
      timestamp: ts,
      chamber: label,
      auth_id, // 👈 anchor message to user account
    };

    // Write JSON locally (legacy)
    const authorDir = path.join(ROOT, "data", chamber, "messages");
    await fs.mkdir(authorDir, { recursive: true });
    await fs.writeFile(path.join(authorDir, `${id}.json`), JSON.stringify(basePayload, null, 2), "utf-8");

    // Fan out locally
    for (const r of recipients) {
      const key = r.toLowerCase() as ChamberKey;
      const recipDir = path.join(ROOT, "data", key, "messages");
      await fs.mkdir(recipDir, { recursive: true });
      const copy = { ...basePayload, chamber: r };
      await fs.writeFile(path.join(recipDir, `${id}.json`), JSON.stringify(copy, null, 2), "utf-8");
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
      },
    ]);
    if (error) console.error("Supabase insert error:", error);

    // SMS
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
