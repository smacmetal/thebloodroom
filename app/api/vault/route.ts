  import { NextResponse } from "next/server";
import { putJson } from "@/lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { id, title, content, author, archived } = await req.json();

    if (!id || !title || !content || !author) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newMemory = {
      id,
      title,
      body: content,
      author,
      date: new Date().toISOString(),
      tags: [],
      status: archived ? "archived" : "active",
    };

    const key = `vault/${id}.json`;
    await putJson(key, newMemory);

    return NextResponse.json({ ok: true, message: "Memory saved", key });
  } catch (err: any) {
    console.error("[vault] Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to save memory" },
      { status: 500 }
    );
  }
}
