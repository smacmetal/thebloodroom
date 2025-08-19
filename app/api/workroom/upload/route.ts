 import { NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

/** Vercel Blob (server-side) */
async function uploadToVercelBlob(file: File) {
  const { put } = await import("@vercel/blob");
  const arrayBuffer = await file.arrayBuffer();
  const blob = await put(
    `workroom/${Date.now()}-${file.name}`,
    new Blob([arrayBuffer], { type: file.type }),
    {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    }
  );
  return { url: blob.url };
}

/** Local save for dev */
function saveLocal(file: File) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fullpath = path.join(uploadsDir, filename);
  return file.arrayBuffer().then(buf => {
    fs.writeFileSync(fullpath, Buffer.from(buf));
    return { url: `/uploads/${filename}` };
  });
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const h = headers();
    const contentType = h.get("content-type") || "";
    if (!contentType.includes("multipart/form-data"))
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    let out: { url: string };
    if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
      out = await uploadToVercelBlob(file);
    } else {
      out = await saveLocal(file);
    }

    return NextResponse.json({ url: out.url, type: file.type }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
