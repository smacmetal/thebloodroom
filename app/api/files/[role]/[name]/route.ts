 import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Role = "king" | "queen" | "princess";

function contentTypeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  // default
  return "application/octet-stream";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ role: Role; name: string }> }
) {
  try {
    const { role, name } = await ctx.params;

    const base = path.resolve(process.cwd(), "data", role, "files");
    // name could be URL-encoded in the URL
    const safeName = decodeURIComponent(name);

    // prevent path traversal
    if (safeName.includes("..") || safeName.includes("/") || safeName.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(base, safeName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buf = fs.readFileSync(filePath);
    const ct = contentTypeFromName(safeName);

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(safeName)}"`,
      },
    });
  } catch (err) {
    console.error("files/[role]/[name] GET error:", err);
    return NextResponse.json({ error: "Unable to read file" }, { status: 500 });
  }
}
