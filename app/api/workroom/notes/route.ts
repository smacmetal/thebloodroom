 import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Local file storage (dev)
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "workroom");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

// Vercel Blob (prod)
const BLOB_KEY = "workroom/notes.json";

type Notes = { contentHtml: string; updatedAt: string };

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function defaultNotes(): Notes {
  return { contentHtml: "", updatedAt: new Date().toISOString() };
}

/** -------- Local FS (dev) -------- */
function readNotesLocal(): Notes {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(NOTES_FILE)) {
    const d = defaultNotes();
    fs.writeFileSync(NOTES_FILE, JSON.stringify(d, null, 2), "utf8");
    return d;
  }
  try {
    const raw = fs.readFileSync(NOTES_FILE, "utf8");
    const j = JSON.parse(raw);
    return {
      contentHtml: typeof j.contentHtml === "string" ? j.contentHtml : "",
      updatedAt: typeof j.updatedAt === "string" ? j.updatedAt : new Date().toISOString(),
    };
  } catch {
    const d = defaultNotes();
    fs.writeFileSync(NOTES_FILE, JSON.stringify(d, null, 2), "utf8");
    return d;
  }
}

function writeNotesLocal(next: Notes): Notes {
  ensureDir(DATA_DIR);
  fs.writeFileSync(NOTES_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

/** -------- Vercel Blob (prod) -------- */
async function readNotesBlob(): Promise<Notes> {
  try {
    const { get } = await import("@vercel/blob");
    const res = await get(BLOB_KEY);
    if (!res) return defaultNotes();
    const j = await res.json();
    return {
      contentHtml: typeof j.contentHtml === "string" ? j.contentHtml : "",
      updatedAt: typeof j.updatedAt === "string" ? j.updatedAt : new Date().toISOString(),
    };
  } catch {
    return defaultNotes();
  }
}

async function writeNotesBlob(next: Notes): Promise<Notes> {
  const { put } = await import("@vercel/blob");
  await put(BLOB_KEY, JSON.stringify(next), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return next;
}

/** -------- Route handlers -------- */
export async function GET() {
  try {
    if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
      const notes = await readNotesBlob();
      return NextResponse.json({ notes }, { status: 200 });
    } else {
      const notes = readNotesLocal();
      return NextResponse.json({ notes }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to read notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content : "";
    const next: Notes = { contentHtml: content, updatedAt: new Date().toISOString() };

    if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
      const saved = await writeNotesBlob(next);
      return NextResponse.json({ notes: saved }, { status: 200 });
    } else {
      const saved = writeNotesLocal(next);
      return NextResponse.json({ notes: saved }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  }
}
