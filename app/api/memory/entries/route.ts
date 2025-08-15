 import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { ensureDataDir } from "@/lib/data-dir";

const ENTRIES_DIR = ensureDataDir("memory/entries");

type Entry = {
  id: string;
  title?: string;
  text?: string;
  content?: string;
  timestamp: number | string;
};

export async function GET() {
  try {
    const files = fs.readdirSync(ENTRIES_DIR).filter((f) => f.endsWith(".json"));

    const items: Entry[] = files
      .map((fname) => {
        const filePath = path.join(ENTRIES_DIR, fname);
        try {
          const raw = fs.readFileSync(filePath, "utf8");
          const parsed = JSON.parse(raw);

          // ✅ add parens when mixing ?? with ||
          const ts =
            parsed.timestamp ??
            (Number(fname.replace(/\D/g, "")) || Date.now());

          const id = parsed.id ?? path.parse(fname).name;
          const text = parsed.text ?? parsed.content ?? "";

          return {
            id: String(id),
            title: parsed.title ?? "",
            text,
            timestamp: ts,
          } as Entry;
        } catch {
          return null as any;
        }
      })
      .filter(Boolean);

    items.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    return NextResponse.json({ entries: items });
  } catch (e) {
    console.error("Error reading memory entries:", e);
    return NextResponse.json({ entries: [], error: "read_failed" }, { status: 200 });
  }
}
