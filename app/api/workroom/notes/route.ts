 // C:\Users\steph\thebloodroom\app\api\workroom\notes\route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";

type Note = {
  id: string;
  author: string;
  content: string;
  content_html: string;
  created_at: string;
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

// POST → insert note
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const author = body.author || "King";
    const content_html = typeof body.content_html === "string" ? body.content_html : "";
    const content = typeof body.content === "string"
      ? body.content
      : content_html.replace(/<[^>]*>/g, "").trim();
    const auth_id = body.auth_id || null;

    if (!content && !content_html) {
      return NextResponse.json({ ok: false, error: "Empty note" }, { status: 400 });
    }

    const { error } = await supabase.from("workroom_notes").insert([
      { author, content, content_html, user_id: auth_id },
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
      return NextResponse.json(
        { ok: false, error: "Missing note id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("workroom_notes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /workroom/notes error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
