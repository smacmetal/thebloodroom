 // C:\Users\steph\thebloodroom\app\api\workroom\notes\route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

type Note = {
  id: string;
  author: string;
  content: string;
  content_html: string;
  created_at: string;
  user_id?: string;
  author_role?: string;
};

/** GET → list notes */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("workroom_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ ok: true, notes: data as Note[] }, { status: 200 });
  } catch (err: any) {
    console.error("GET /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/** POST → insert note (with optional attachments) */
export async function POST(req: Request) {
  try {
    // Decide: JSON vs FormData
    const contentType = req.headers.get("content-type") || "";
    let notePayload: any = {};
    let attachments: any[] = [];

    if (contentType.includes("application/json")) {
      // Simple JSON payload
      notePayload = await req.json().catch(() => ({}));
    } else {
      // FormData with files
      const form = await req.formData();
      notePayload = {
        author: form.get("author") || "King",
        content: form.get("content") || "",
        content_html: form.get("content_html") || "",
        user_id: form.get("auth_id") || null,
        author_role: form.get("author_role") || null,
      };

      const files = form.getAll("files").filter(
        (f) => typeof f === "object" && "arrayBuffer" in f && f.name
      );
      for (const anyFile of files) {
        const f: any = anyFile;
        const buf = Buffer.from(await f.arrayBuffer());
        const safeName = f.name.replace(/[^\w.\-]+/g, "_");
        const storagePath = `workroom/${Date.now()}-${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from("attachments")
          .upload(storagePath, buf, {
            contentType: f.type || "application/octet-stream",
            upsert: true,
          });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from("attachments")
            .getPublicUrl(storagePath);

          attachments.push({
            name: safeName,
            url: publicUrlData.publicUrl,
            path: storagePath,
            type: f.type || undefined,
          });
        } else {
          console.error("Workroom note upload failed:", uploadErr.message);
        }
      }
    }

    // Guard against empties
    const plain = (notePayload.content_html || "").replace(/<[^>]+>/g, "").trim();
    if (!plain && !notePayload.content && attachments.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty note" }, { status: 400 });
    }

    // Insert note
    const { error } = await supabase.from("workroom_notes").insert([
      {
        author: notePayload.author || "King",
        content: notePayload.content || plain,
        content_html: notePayload.content_html || notePayload.content || "",
        user_id: notePayload.user_id || null,
        author_role: notePayload.author_role || null,
        attachments: attachments.length ? attachments : null, // store refs inline
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error("POST /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

/** DELETE → remove a note by id */
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
