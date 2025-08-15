import fs from "fs";
import path from "path";
import { ensureDataDir } from "@/lib/data-dir";

export type Role = "king" | "queen" | "princess";

export function roleFilesDir(role: Role): string {
  // data/<role>/messages/files
  return ensureDataDir(path.join(role, "messages", "files"));
}

export function safeJoin(dir: string, filename: string): string {
  // disallow path traversal
  const resolved = path.resolve(dir, filename);
  if (!resolved.startsWith(path.resolve(dir))) {
    throw new Error("Invalid filename");
  }
  return resolved;
}

export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  // tiny built-in map (no extra deps)
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".pdf": "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

export function listDirFiles(absDir: string): { name: string; size: number; mtime: number }[] {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => {
      const full = path.join(absDir, e.name);
      const { size, mtimeMs } = fs.statSync(full);
      return { name: e.name, size, mtime: Math.round(mtimeMs) };
    })
    .sort((a, b) => a.mtime - b.mtime);
}
