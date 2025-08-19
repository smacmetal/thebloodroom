 import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { contentTypeFor, roleFilesDir, safeJoin, Role } from "@/lib/file-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { role: Role; filename: string } }
) {
  try {
    const dir = roleFilesDir(params.role);
    const abs = safeJoin(dir, decodeURIComponent(params.filename));

    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buff = fs.readFileSync(abs);
    const headers = new Headers();
    headers.set("Content-Type", contentTypeFor(abs));
    // inline display; change to attachment if you want download prompts:
    // headers.set("Content-Disposition", `attachment; filename="${path.basename(abs)}"`);

    return new NextResponse(buff, { status: 200, headers });
  } catch (err) {
    console.error("[files:get]", err);
    return NextResponse.json({ error: "Unable to fetch file" }, { status: 500 });
  }
}
