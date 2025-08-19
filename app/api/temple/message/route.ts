 import { promises as fs } from "fs";
import path from "path";

type ChamberKey = "queen" | "princess" | "king";
type ChamberLabel = "Queen" | "Princess" | "King";

const ROOT = process.cwd();
const MAP: Record<ChamberKey, ChamberLabel> = {
  queen: "Queen",
  princess: "Princess",
  king: "King",
};

function randomId(n = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const chamberRaw: string = (body?.chamber || "").toString().toLowerCase();
    const chamber: ChamberKey =
      chamberRaw === "queen" ? "queen" : chamberRaw === "princess" ? "princess" : "king";

    const author: string =
      typeof body?.author === "string" && body.author.trim() !== ""
        ? body.author.trim()
        : MAP[chamber];

    const recipients: string[] = Array.isArray(body?.recipients)
      ? body.recipients.map((r: any) => String(r)).filter(Boolean)
      : [];

    const content: string = typeof body?.content === "string" ? body.content : "";
    const contentHtml: string = typeof body?.contentHtml === "string" ? body.contentHtml : "";
    const format: "rich" | "html" | string = (body?.format || "").toString() || (contentHtml ? "rich" : "text");
    const sms: boolean = !!body?.sms;

    // Ensure directory exists
    const dir = path.join(ROOT, "data", chamber, "messages");
    await fs.mkdir(dir, { recursive: true });

    // Compose message JSON
    const ts = Date.now();
    const iso = new Date(ts).toISOString();
    const id = `${ts}-${randomId(6)}`;
    const file = path.join(dir, `${id}.json`);

    const payload = {
      id,
      messageId: id,
      author,
      recipients,
      content,        // plaintext for search & fallback
      contentHtml,    // optional HTML
      format,         // "rich"|"html"|"text"
      sms,            // store intent only (no gateway wired yet)
      timestamp: ts,
      createdAt: iso,
      chamber: MAP[chamber],
    };

    await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf-8");

    return new Response(JSON.stringify({ ok: true, id }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || "failed" }), {
      status: 500,
    });
  }
}
