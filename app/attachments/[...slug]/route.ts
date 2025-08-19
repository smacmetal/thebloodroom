 import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import mime from "mime";

/**
 * Serves attachments from multiple locations:
 * 1) New layout: /attachments/wall/<Chamber>/<messageId>/<filename>
 *    -> <repo>/attachments/wall/<Chamber>/<messageId>/<filename>
 *
 * 2) Legacy layout: data/walls/<chamber>/images/<filename>
 *    (chamber may be King/Queen/Princess or lower-cased)
 */

export const dynamic = "force-static";

function tryGetMime(fp: string) {
  return mime.getType(fp) || "application/octet-stream";
}

async function fileExists(fp: string) {
  try {
    await fs.access(fp);
    return true;
  } catch {
    return false;
  }
}

// Shallow search for filename under a base dir (non-recursive to keep it fast)
async function findInDir(baseDir: string, filename: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.toLowerCase() === filename.toLowerCase()) {
        return path.join(baseDir, e.name);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Light recursive search (1 level deep) to catch dated subfolders if any
async function findOneLevelDeep(baseDir: string, filename: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        const p = path.join(baseDir, e.name);
        const hit = await findInDir(p, filename);
        if (hit) return hit;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  if (slug.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // New scheme candidate:
  // /attachments/wall/<Chamber>/<messageId>/.../<filename>
  const repoRoot = process.cwd();
  const newCandidate = path.join(repoRoot, "attachments", ...slug);

  if (await fileExists(newCandidate)) {
    const data = await fs.readFile(newCandidate);
    const type = tryGetMime(newCandidate);
    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  // LEGACY fallback
  // Derive chamber + filename from slug when possible
  const filename = slug[slug.length - 1];
  // try to infer chamber from slug[1] if pattern is wall/<Chamber>/...
  const inferredChamber =
    slug.length >= 2 && slug[0].toLowerCase() === "wall" ? slug[1] : "";

  const candidates: string[] = [];

  // Known legacy roots
  const legacyRoots = [
    path.join(repoRoot, "data", "walls", "Queen", "images"),
    path.join(repoRoot, "data", "walls", "queen", "images"),
    path.join(repoRoot, "data", "walls", "King", "images"),
    path.join(repoRoot, "data", "walls", "king", "images"),
    path.join(repoRoot, "data", "walls", "Princess", "images"),
    path.join(repoRoot, "data", "walls", "princess", "images"),
  ];

  // If we inferred a chamber, rank its folders first
  const lc = inferredChamber.toLowerCase();
  const prioritized = legacyRoots.sort((a, b) => {
    const aHit = a.toLowerCase().includes(lc);
    const bHit = b.toLowerCase().includes(lc);
    return aHit === bHit ? 0 : aHit ? -1 : 1;
  });

  // 1) Direct filename in the root images folder
  for (const base of prioritized) {
    candidates.push(path.join(base, filename));
  }

  // 2) One-level-deep (some older dumps used dated subfolders)
  for (const base of prioritized) {
    const oneLevel = await findOneLevelDeep(base, filename);
    if (oneLevel) {
      const data = await fs.readFile(oneLevel);
      const type = tryGetMime(oneLevel);
      return new NextResponse(data, {
        status: 200,
        headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
  }

  // Check direct candidates
  for (const fp of candidates) {
    if (await fileExists(fp)) {
      const data = await fs.readFile(fp);
      const type = tryGetMime(fp);
      return new NextResponse(data, {
        status: 200,
        headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
  }

  return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
}
