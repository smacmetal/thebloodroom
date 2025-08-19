 import { promises as fs } from "fs";
import path from "path";

type ChamberLabel = "King" | "Queen" | "Princess";

type Attachment = {
  name?: string;
  path: string;
  type?: string;
  url: string;
  thumbUrl: string;
};

type Msg = {
  id: string;
  uid: string;
  author: string;
  recipients: string[];
  content: string;
  attachments: Attachment[];
  timestamp: number;
  chamber: ChamberLabel;
};

const ROOT = process.cwd();
const CHAMBERS: Array<{ key: "queen" | "princess" | "king"; label: ChamberLabel }> = [
  { key: "queen", label: "Queen" },
  { key: "princess", label: "Princess" },
  { key: "king", label: "King" },
];

/* ------------ helpers ------------ */

function toPublicUrl(p: string): string {
  const s = String(p || "").replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${s}`;
}

function normalizeRecipients(val: any): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    return val.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeContent(obj: any): string {
  if (!obj) return "";
  const top = [obj.content, obj.message, obj.text, obj.body, obj.msg];
  for (const c of top) {
    if (typeof c === "string" && c.trim() !== "") return c;
  }
  return "";
}

// deep attachment scan (attachments/files/media/images/photos)
function normalizeAttachmentsDeep(obj: any): Attachment[] {
  const out: Attachment[] = [];
  if (!obj || typeof obj !== "object") return out;

  const KEYS = new Set(["attachments", "files", "media", "images", "photos"]);
  const queue: any[] = [obj];
  const seen = new Set<any>();
  let depth = 0;

  const pushOne = (a: any) => {
    if (!a) return;
    if (typeof a === "string") {
      const url = toPublicUrl(a);
      out.push({ path: a, url, thumbUrl: url, name: undefined, type: undefined });
    } else if (typeof a === "object") {
      const p = (a as any).path ?? (a as any).url ?? (a as any).href ?? (a as any).src;
      if (typeof p === "string" && p.trim() !== "") {
        const url = toPublicUrl(p);
        out.push({
          name: (a as any).name ?? undefined,
          path: p,
          type: (a as any).type ?? undefined,
          url,
          thumbUrl: url,
        });
      }
    }
  };

  while (queue.length && depth < 5) {
    const n = queue.length;
    for (let i = 0; i < n; i++) {
      const node = queue.shift();
      if (!node || typeof node !== "object" || seen.has(node)) continue;
      seen.add(node);

      for (const [k, v] of Object.entries(node)) {
        const kl = k.toLowerCase();
        if (KEYS.has(kl)) {
          if (Array.isArray(v)) v.forEach(pushOne);
          else pushOne(v);
        }
        if (v && typeof v === "object") queue.push(v);
      }
    }
    depth++;
  }
  return out;
}

function numberFromFilename(name: string): number {
  const m = name.match(/\d{10,}/);
  return m ? Number(m[0]) : NaN;
}

function fromISO(iso: any): number | NaN {
  if (typeof iso !== "string") return NaN;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : NaN;
}

async function readDirJSON(dir: string, label: ChamberLabel): Promise<Msg[]> {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    const out: Msg[] = [];

    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith(".json")) continue;
      const filePath = path.join(dir, f.name);

      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const obj: any = JSON.parse(raw);
        const stat = await fs.stat(filePath);

        const fromJson = typeof obj?.timestamp === "number" ? obj.timestamp : NaN;
        const fromISOTime = fromISO(obj?.createdAt);
        const fromName = numberFromFilename(f.name);
        const ts =
          (Number.isFinite(fromJson) && fromJson > 0 ? fromJson : NaN) ||
          (Number.isFinite(fromISOTime) && fromISOTime > 0 ? fromISOTime : NaN) ||
          (Number.isFinite(fromName) && fromName > 0 ? fromName : NaN) ||
          (Number.isFinite(stat.mtimeMs) && stat.mtimeMs > 0 ? stat.mtimeMs : NaN) ||
          (Number.isFinite(stat.ctimeMs) && stat.ctimeMs > 0 ? stat.ctimeMs : Date.now());

        const id = String(obj?.messageId ?? obj?.id ?? f.name.replace(/\.json$/i, ""));
        const uid = `${id}-${label}`;

        const author =
          typeof obj?.author === "string" && obj.author.trim() !== "" ? obj.author : (label as string);
        const recipients = normalizeRecipients(obj?.recipients ?? obj?.to ?? obj?.recipient ?? obj?.targets);
        const content = normalizeContent(obj);
        const attachments = normalizeAttachmentsDeep(obj);

        out.push({
          id,
          uid,
          author,
          recipients,
          content,
          attachments,
          timestamp: ts,
          chamber: label,
        });
      } catch {
        // skip malformed file
      }
    }
    return out;
  } catch {
    return [];
  }
}

/* ------------ GET ------------ */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chamberParam = url.searchParams.get("chamber"); // queen|princess|king|All
    const q = (url.searchParams.get("q") || "").toLowerCase();

    let all: Msg[] = [];
    for (const c of CHAMBERS) {
      const dir = path.join(ROOT, "data", c.key, "messages");
      const list = await readDirJSON(dir, c.label);
      all = all.concat(list);
    }

    all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (chamberParam && chamberParam !== "All") {
      const want =
        chamberParam.toLowerCase() === "queen"
          ? "Queen"
          : chamberParam.toLowerCase() === "princess"
          ? "Princess"
          : "King";
      all = all.filter((m) => m.chamber === (want as ChamberLabel));
    }

    if (q) {
      all = all.filter((m) => {
        const recips = (m.recipients ?? []).join(",").toLowerCase();
        return (
          m.author.toLowerCase().includes(q) ||
          (m.content || "").toLowerCase().includes(q) ||
          recips.includes(q)
        );
      });
    }

    return new Response(JSON.stringify({ messages: all }), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Archive load failed", details: err.message }),
      { status: 500 }
    );
  }
}

/* ------------ DELETE by uid ------------ */

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let uid = url.searchParams.get("uid") || "";

    if (!uid) {
      try {
        const body = await req.json();
        uid = body?.uid || "";
      } catch {
        // ignore
      }
    }
    if (!uid) {
      return new Response(JSON.stringify({ error: "uid required" }), { status: 400 });
    }

    // uid = `${id}-${label}` (label is King|Queen|Princess)
    const parts = uid.split("-");
    if (parts.length < 2) {
      return new Response(JSON.stringify({ error: "invalid uid" }), { status: 400 });
    }
    const label = parts[parts.length - 1] as ChamberLabel;
    const id = parts.slice(0, -1).join("-"); // id can contain '-'

    const chamber = CHAMBERS.find((c) => c.label === label);
    if (!chamber) {
      return new Response(JSON.stringify({ error: "invalid chamber" }), { status: 400 });
    }

    const dir = path.join(ROOT, "data", chamber.key, "messages");
    const entries = await fs.readdir(dir, { withFileTypes: true });

    let deleted = 0;
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith(".json")) continue;
      const base = e.name.replace(/\.json$/i, "");
      if (base === id) {
        await fs.unlink(path.join(dir, e.name));
        deleted++;
        break;
      }
      // fallback: match file whose parsed id in JSON equals `id`
      // (best-effort: read minimal)
      try {
        const raw = await fs.readFile(path.join(dir, e.name), "utf-8");
        const obj = JSON.parse(raw);
        const mid = String(obj?.messageId ?? obj?.id ?? base);
        if (mid === id) {
          await fs.unlink(path.join(dir, e.name));
          deleted++;
          break;
        }
      } catch {
        // ignore
      }
    }

    if (!deleted) {
      return new Response(JSON.stringify({ ok: false, deleted: 0 }), { status: 404 });
    }
    return new Response(JSON.stringify({ ok: true, deleted }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "delete failed" }), { status: 500 });
  }
}
