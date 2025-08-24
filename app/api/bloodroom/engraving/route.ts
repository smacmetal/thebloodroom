// C:\Users\steph\thebloodroom\app\api\bloodroom\engraving\route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET latest engraving
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("engravings")
      .select("id, title, caption, chant, images, date, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: "Supabase GET failed", detail: error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { engraving: null, message: "No engravings yet" },
        { status: 200 }
      );
    }

    return NextResponse.json({ engraving: data[0] }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected GET error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

// POST new engraving
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, caption, chant, images, date } = body;

    if (!title && !chant) {
      return NextResponse.json(
        { error: "At least a title or chant is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("engravings")
      .insert([{ title, caption, chant, images, date }])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ error: "Supabase POST failed", detail: error }, { status: 500 });
    }

    return NextResponse.json({ engraving: data }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected POST error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
 