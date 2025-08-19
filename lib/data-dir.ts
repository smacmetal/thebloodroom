 import fs from "fs";
import path from "path";

/**
 * Writable base:
 * - Vercel/AWS lambda => /tmp
 * - Local dev => <project>/data
 * Override with DATA_DIR if desired.
 */
function getBaseDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  const isLambda = !!process.env.LAMBDA_TASK_ROOT || !!process.env.VERCEL;
  return isLambda ? "/tmp" : path.join(process.cwd(), "data");
}

export function ensureDataDir(relative: string): string {
  if (typeof relative !== "string" || !relative.length) {
    throw new TypeError("ensureDataDir(relative) needs a non-empty string");
  }
  const base = getBaseDataDir();
  const full = path.join(base, relative);
  fs.mkdirSync(full, { recursive: true });
  return full;
}
