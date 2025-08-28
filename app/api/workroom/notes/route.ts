 // C:\Users\steph\thebloodroom\app\api\workroom\notes\route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const ROOT = process.cwd();
const ATTACH_DIR = path.join(ROOT, "attachments", "workroom");

type NoteInsert = {
  author: string;
  content: string;
  content_html: string;
  attachments?: Array<{ name?: string; url: string; type?: string }> | null;
  user_id?: string | null;
  author_role?: string | null;
};

// Utils
function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}
const toPublicUrl = (p: string) => `/${p.replace(/\\/g, "/").replace(/^\/+/, "")}`;

/** GET → list notes */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("workroom_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, notes: data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/** POST → insert note (JSON or FormData w/ attachments) */
export async function POST(req: Request) {
  try {
    const ctype = req.headers.get("content-type") || "";
    let payload: NoteInsert = {
      author: "King",
      content: "",
      content_html: "",
      attachments: null,
    };

    if (ctype.includes("multipart/form-data")) {
      // --- FormData ---
      const form = await req.formData();
      payload.author = String(form.get("author") || "King");
      payload.content_html = String(form.get("content_html") || "");
      payload.content =
        String(form.get("content") || "") ||
        payload.content_html.replace(/<[^>]*>/g, "").trim();
      payload.user_id = form.get("auth_id")?.toString() || null;
      payload.author_role = form.get("author_role")?.toString() || null;

      // Attachments
      const files = form.getAll("files").filter((f) => typeof f === "object" && "arrayBuffer" in f);
      if (files.length) {
        const noteDir = path.join(ATTACH_DIR, Date.now().toString());
        await fs.mkdir(noteDir, { recursive: true });

        const attachments: NoteInsert["attachments"] = [];
        for (const anyFile of files) {
          const f: any = anyFile;
          const buf = Buffer.from(await f.arrayBuffer());
          const fname = safeName(f.name);
          const abs = path.join(noteDir, fname);
          await fs.writeFile(abs, buf);
          const rel = path.join("attachments", "workroom", path.basename(noteDir), fname);
          const url = toPublicUrl(rel);
          attachments.push({ name: fname, url, type: f.type || undefined });
        }
        payload.attachments = attachments;
      }
    } else {
      // --- JSON ---
      const body = await req.json().catch(() => ({}));
      payload.author = body.author || "King";
      payload.content_html = typeof body.content_html === "string" ? body.content_html : "";
      payload.content =
        typeof body.content === "string"
          ? body.content
          : payload.content_html.replace(/<[^>]*>/g, "").trim();
      payload.user_id = body.auth_id || null;
      payload.author_role = body.author_role || null;
    }

    if (!payload.content && !payload.content_html && !payload.attachments) {
      return NextResponse.json({ ok: false, error: "Empty note" }, { status: 400 });
    }

    const { error } = await supabase.from("workroom_notes").insert([payload]);
    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error("POST /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/** DELETE → remove note by id */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing note id" }, { status: 400 });
    }

    const { error } = await supabase.from("workroom_notes").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
