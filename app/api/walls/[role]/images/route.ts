 import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Role = "king" | "queen" | "princess";

/**
 * Absolute dir for a role's image files.
 * We only READ here, so no need to create the directory.
 */
function roleFilesDir(role: Role): string {
  return path.resolve(process.cwd(), "data", role, "files");
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ role: Role }> }
) {
  try {
    // ⬇️ Next.js (App Router) dynamic routes: params is async; must await
    const { role } = await ctx.params;

    const dir = roleFilesDir(role);
    if (!fs.existsSync(dir)) {
      // If folder doesn't exist yet, just return an empty list
      return NextResponse.json({ files: [] });
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const rows = entries
      .filter((e) => e.isFile())
      .map((e) => {
        const filePath = path.join(dir, e.name);
        const stat = fs.statSync(filePath);
        return {
          name: e.name,
          size: stat.size,
          mtime: stat.mtime.getTime(),
        };
      })
      // newest first (optional; change as you like)
      .sort((a, b) => b.mtime - a.mtime);

    // Build file URLs that the file-serving route below will handle
    const items = rows.map((r) => ({
      name: r.name,
      size: r.size,
      mtime: r.mtime,
      url: `/api/files/${role}/${encodeURIComponent(r.name)}`,
    }));

    return NextResponse.json({ files: items });
  } catch (err) {
    console.error("walls/[role]/images GET error:", err);
    return NextResponse.json({ error: "Unable to list images" }, { status: 500 });
  }
}
