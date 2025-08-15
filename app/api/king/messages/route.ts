 import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "data", "king", "messages");

// ---------- helpers ----------
function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function parseIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function epochFromFilenameMs(fname: string): number | null {
  const runs = (fname.match(/\d+/g) || []).sort((a, b) => b.length - a.length);
  if (!runs.length) return null;
  const msRun = runs.find((r) => r.length === 13);
  if (msRun && Number.isFinite(Number(msRun))) return Number(msRun);
  const sRun = runs.find((r) => r.length === 10);
  if (sRun && Number.isFinite(Number(sRun))) return Number(sRun) * 1000;
  return null;
}

function safeTimestamp(fullPath: string, fname: string, j: any): string {
  let iso = parseIsoOrNull(j?.timestamp);
  if (!iso) {
    const ms = epochFromFilenameMs(fname);
    if (ms && Number.isFinite(ms)) {
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) iso = d.toISOString();
    }
  }
  if (!iso) {
    try {
      const stat = fs.statSync(fullPath);
      iso = new Date(stat.mtimeMs).toISOString();
    } catch {
      iso = new Date().toISOString();
    }
  }
  return iso!;
}

// ---------- GET ----------
export async function GET() {
  try {
    ensureDir(MESSAGES_DIR);
    const entries = fs.readdirSync(MESSAGES_DIR, { withFileTypes: true });

    const messages = entries
      .filter((ent) => ent.isFile())
      .filter((ent) => ent.name.toLowerCase().endsWith(".json"))
      .map((ent) => {
        const fname = ent.name;
        const full = path.join(MESSAGES_DIR, fname);
        let j: any = {};
        try {
          j = JSON.parse(fs.readFileSync(full, "utf8"));
        } catch {
          j = { id: path.parse(fname).name, body: "[Invalid JSON]" };
        }
        const timestamp = safeTimestamp(full, fname, j);
        return {
          id: j.id ?? path.parse(fname).name,
          author: j.author ?? "King",
          body: j.body ?? "",
          title: typeof j.title === "string" ? j.title : "",
          timestamp,
          files: Array.isArray(j.files) ? j.files : [],
          recipients: Array.isArray(j.recipients) ? j.recipients : [],
        };
      })
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

    return NextResponse.json({ messages }, { status: 200 });
  } catch (err) {
    console.error("Error reading King messages:", err);
    return NextResponse.json({ error: "Failed to read messages" }, { status: 500 });
  }
}

// ---------- POST ----------
export async function POST(req: Request) {
  try {
    ensureDir(MESSAGES_DIR);
    const data = await req.json().catch(() => ({}));

    const now = Date.now();
    const id = `${now}-king`;
    const payload = {
      id,
      author: data.author ?? "King",
      title: typeof data.title === "string" ? data.title : "",
      body: typeof data.body === "string" ? data.body : "",
      recipients: Array.isArray(data.recipients) ? data.recipients : ["King"],
      files: Array.isArray(data.files) ? data.files : [],
      timestamp: new Date(now).toISOString(),
    };

    const outfile = path.join(MESSAGES_DIR, `${id}.json`);
    fs.writeFileSync(outfile, JSON.stringify(payload, null, 2), "utf8");

    return NextResponse.json({ ok: true, message: payload }, { status: 201 });
  } catch (err) {
    console.error("Error writing King message:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

// ---------- DELETE ?id= ----------
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const target = path.join(MESSAGES_DIR, `${id}.json`);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    console.error("Error deleting King message:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
