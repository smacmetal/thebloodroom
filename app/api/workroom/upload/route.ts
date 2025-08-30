// C:\Users\steph\thebloodroom\app\api\workroom\upload\route.ts

import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import path from "path";

// Ensure we run in a Node.js runtime so we can write to /tmp locally/Vercel
export const runtime = "nodejs";

/**
 * Server-side fallback uploader for RoleImageUploader.
 * Expects multipart/form-data with fields:
 *  - file: File
 *  - chamber: "King" | "Queen" | "Princess" (any case; we normalize)
 *  - pathname: suggested relative path (e.g., "attachments/wall/king/IMG_1234.jpg")
 *
 * For now, we persist to /tmp (works locally and on Vercel’s /tmp).
 * You can later swap the write to S3/Vercel Blob without changing the caller.
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: 'Content-Type must be "multipart/form-data".' },
        { status: 400 }
      );
    }

    const form = await req.formData();

    const file = form.get("file") as unknown as File | null;
    const chamberRaw = (form.get("chamber")?.toString() || "king").trim();
    const chamber = chamberRaw.toLowerCase(); // normalize: king|queen|princess
    const suggestedPath =
      form.get("pathname")?.toString() ||
      `attachments/wall/${chamber}/${Date.now()}.bin`;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Missing 'file' in form-data." },
        { status: 400 }
      );
    }

    // Sanitize/normalize path for local /tmp storage
    const safeRel = suggestedPath.replace(/[:\\]/g, "_").replace(/^\/*/, "");
    const destAbs = path.join("/tmp", safeRel);

    const dir = path.dirname(destAbs);
    await fs.mkdir(dir, { recursive: true });

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    await fs.writeFile(destAbs, buf);

    return NextResponse.json({
      ok: true,
      chamber,
      filename: path.basename(destAbs),
      storedAt: destAbs,
      size: buf.length,
      hint: "File saved to /tmp. Swap this write for S3/Vercel Blob later without changing the client.",
    });
  } catch (err: any) {
    console.error("[workroom/upload] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
