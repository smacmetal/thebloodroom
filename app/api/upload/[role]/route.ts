 import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ensureDataDir } from "@/lib/data-dir";

type Role = "king" | "queen" | "princess";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ role: Role }> }
) {
  try {
    const { role } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadDir = ensureDataDir(`${role}/files`);
    const filePath = path.join(uploadDir, file.name);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ ok: true, path: filePath });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
