 // C:\Users\steph\thebloodroom\app\api\attachments\sign\route.ts

import { NextResponse } from "next/server";

/**
 * attachments/sign
 * - Returns a "signed URL" or a "pathname" the uploader can use.
 * - Here we fake a signer: in production you’d integrate with Vercel Blob, AWS S3, or Supabase.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filename = body.filename as string;
    const contentType = body.contentType as string;
    const prefix = body.prefix as string;
    const access = body.access || "public";

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "Missing filename" },
        { status: 400 }
      );
    }

    // Build a pathname (server-fallback mode)
    const safeName = filename.replace(/[^\w\.\-]/g, "_");
    const pathname = `${prefix}/${Date.now()}-${safeName}`;

    // Example: toggle between vercel-blob mode and fallback
    const mode: "vercel-blob" | "fallback" = process.env.BLOB_MODE
      ? "vercel-blob"
      : "fallback";

    if (mode === "vercel-blob") {
      // If you had Vercel Blob configured, you’d call its SDK here
      // and return { mode: "vercel-blob", url: signedUrl }
      return NextResponse.json({
        ok: true,
        mode,
        url: "https://example.com/fake-signed-url",
        pathname,
      });
    }

    // Fallback: just tell the client to POST to /api/workroom/upload
    return NextResponse.json({
      ok: true,
      mode: "fallback",
      pathname,
      access,
      hint: "No blob service set, will fallback to /api/workroom/upload",
    });
  } catch (err: any) {
    console.error("[attachments/sign] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
