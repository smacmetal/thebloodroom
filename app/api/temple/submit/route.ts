 // app/api/temple/submit/route.ts
// Saves the author's message, fans out to recipients' chambers,
// and (optionally) sends SMS using per-role numbers if feature flag is ON.

import { promises as fs } from "fs";
import path from "path";
import twilio from "twilio";

export const runtime = "nodejs";

type ChamberKey = "king" | "queen" | "princess";
type ChamberLabel = "King" | "Queen" | "Princess";
const ROOT = process.cwd();

const KEY_TO_LABEL: Record<ChamberKey, ChamberLabel> = {
  king: "King",
  queen: "Queen",
  princess: "Princess",
};

// Feature flag
const SMS_ENABLED = (process.env.BLOODROOM_SMS_ENABLED || "false") === "true";

// Per-role FROM numbers (Twilio)
const FROM_BY_AUTHOR: Record<ChamberLabel, string | undefined> = {
  King: (process.env.TWILIO_KING_NUMBER || "").trim() || (process.env.TWILIO_PHONE_NUMBER || "").trim(),
  Queen: (process.env.TWILIO_QUEEN_NUMBER || "").trim() || (process.env.TWILIO_PHONE_NUMBER || "").trim(),
  Princess: (process.env.TWILIO_PRINCESS_NUMBER || "").trim() || (process.env.TWILIO_PHONE_NUMBER || "").trim(),
};

// Per-role personal cell numbers (SMS destinations)
const TO_BY_ROLE: Record<ChamberLabel, string | undefined> = {
  King: (process.env.SMS_KING_NUMBER || process.env.SMS_TARGET_NUMBER || "").trim(),
  Queen: (process.env.SMS_QUEEN_NUMBER || "").trim(),
  Princess: (process.env.SMS_PRINCESS_NUMBER || "").trim(),
};

const SID = (process.env.TWILIO_ACCOUNT_SID || "").trim();
const TOKEN = (process.env.TWILIO_AUTH_TOKEN || "").trim();
const canSms = !!(SID && TOKEN) && SMS_ENABLED;
const smsClient = canSms ? twilio(SID, TOKEN) : null;

function randomId(n = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
const toPublicUrl = (p: string) => `/${p.replace(/\\/g, "/").replace(/^\/+/, "")}`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const chamberRaw = String(form.get("chamber") || "").toLowerCase(); // king|queen|princess
    const chamber: ChamberKey = (["king", "queen", "princess"].includes(chamberRaw) ? chamberRaw : "king") as ChamberKey;
    const author = (String(form.get("author") || KEY_TO_LABEL[chamber]).trim() || KEY_TO_LABEL[chamber]) as ChamberLabel;

    const smsFlagRequested = String(form.get("sms") || "false") === "true";
    const smsFlag = smsFlagRequested && SMS_ENABLED; // force OFF when feature flag is false

    const format = String(form.get("format") || "text");

    // recipients (array of 'King'|'Queen'|'Princess')
    const recipients: ChamberLabel[] = [];
    form.getAll("recipients").forEach((r) => {
      if (typeof r === "string") {
        const v = r.trim();
        if (v === "King" || v === "Queen" || v === "Princess") recipients.push(v);
      }
    });

    const contentHtml = String(form.get("contentHtml") || "");
    const content = String(form.get("content") || "");

    const ts = Date.now();
    const id = `${ts}-${randomId(6)}`;
    const label = KEY_TO_LABEL[chamber];

    // Save attachments under attachments/wall/<Label>/<id>/
    const baseAttachDir = path.join(ROOT, "attachments", "wall", label, id);
    await fs.mkdir(baseAttachDir, { recursive: true });

    const attachments: Array<{ name?: string; path: string; type?: string; url: string; thumbUrl: string }> = [];
    const files = form.getAll("files");

    for (const anyFile of files) {
      const f: any = anyFile as any;
      if (!f || typeof f.arrayBuffer !== "function" || !f.name) continue;

      const arrayBuf = await f.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      const safeName = String(f.name).replace(/[^\w.\-]+/g, "_");
      const abs = path.join(baseAttachDir, safeName);
      await fs.writeFile(abs, buf);

      const rel = path.join("attachments", "wall", label, id, safeName);
      const url = toPublicUrl(rel);

      attachments.push({
        name: safeName,
        path: rel,
        type: f.type || undefined,
        url,
        thumbUrl: url,
      });
    }

    // Base payload
    const basePayload = {
      id,
      messageId: id,
      author,
      recipients,
      content,
      contentHtml,
      format,
      sms: smsFlag,
      attachments,
      timestamp: ts,
      createdAt: new Date(ts).toISOString(),
      chamber: label,
    };

    // 1) Write to the author's chamber
    const authorDir = path.join(ROOT, "data", chamber, "messages");
    await fs.mkdir(authorDir, { recursive: true });
    await fs.writeFile(path.join(authorDir, `${id}.json`), JSON.stringify(basePayload, null, 2), "utf-8");

    // 2) Fan out copies to recipients' chambers so they appear in their temples
    for (const r of recipients) {
      const key = r.toLowerCase() as ChamberKey;
      const recipDir = path.join(ROOT, "data", key, "messages");
      await fs.mkdir(recipDir, { recursive: true });
      const copy = { ...basePayload, chamber: r }; // set chamber label to recipient
      await fs.writeFile(path.join(recipDir, `${id}.json`), JSON.stringify(copy, null, 2), "utf-8");
    }

    // 3) SMS sending (per recipient), only if feature flag + creds
    if (smsFlag && canSms && recipients.length) {
      const from = FROM_BY_AUTHOR[author];
      const raw = (content || contentHtml || "").toString();
      const stripped = content ? content : raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const body = `[${author}] ${stripped}`.slice(0, 1500);

      if (!from) {
        console.warn(`[sms] No FROM number for ${author}. Skipping SMS.`);
      } else {
        await Promise.all(
          recipients.map(async (r) => {
            const to = TO_BY_ROLE[r];
            if (!to) {
              console.warn(`[sms] No TO number configured for ${r}. Skipping.`);
              return;
            }
            try {
              await smsClient!.messages.create({ from, to, body });
            } catch (e: any) {
              console.warn(`[sms] failed ${author} -> ${r}:`, e?.message || e);
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
