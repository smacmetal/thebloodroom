import { NextResponse } from 'next/server';
import { listJsonUnder, getJson } from '@/lib/s3';

type VaultEntry = {
  id?: string;          // will be injected = S3 key
  title: string;
  story?: string;
  category?: string;
  date?: string;        // human-friendly date
  timestamp?: string;   // ISO timestamp
  file?: string;        // optional attachment URL
};

// Prefixes we’ll scan (keeps us compatible with any existing layout)
const PREFIXES = [
  'memory/entries/',  // preferred
  'vault/entries/',   // legacy
  'vault/',           // ultra-legacy (broad)
];

export async function GET() {
  try {
    // Gather keys from all known prefixes (de-duplicated)
    const keySet = new Set<string>();
    for (const p of PREFIXES) {
      try {
        const keys = await listJsonUnder(p);
        if (Array.isArray(keys)) keys.forEach(k => keySet.add(k));
      } catch (e) {
        // ignore missing prefixes; continue
      }
    }

    const keys = Array.from(keySet);

    // Pull and normalize entries; inject a stable id = S3 key
    const rawEntries = await Promise.all(
      keys.map(async (key) => {
        try {
          const obj = await getJson<Record<string, unknown>>(key);
          const entry: VaultEntry = {
            id: key,
            title: String(obj?.title ?? 'Untitled'),
            story: obj?.story ? String(obj.story) : undefined,
            category: obj?.category ? String(obj.category) : undefined,
            date: obj?.date ? String(obj.date) : undefined,
            timestamp: obj?.timestamp ? String(obj.timestamp) : undefined,
            file: obj?.file ? String(obj.file) : undefined,
          };
          return entry;
        } catch (err) {
          console.error('Failed to read entry:', key, err);
          return null;
        }
      })
    );

    const entries = rawEntries.filter((e): e is VaultEntry => Boolean(e));

    // Sort newest-first by timestamp (fallback to date/title)
    entries.sort((a, b) => {
      const ta = a.timestamp ?? a.date ?? '';
      const tb = b.timestamp ?? b.date ?? '';
      if (ta < tb) return 1;
      if (ta > tb) return -1;
      return (a.title || '').localeCompare(b.title || '');
    });

    return NextResponse.json(entries, { status: 200 });
  } catch (err) {
    console.error('GET /api/memory/entries failed:', err);
    // Always return an array so the UI never breaks
    return NextResponse.json([], { status: 200 });
  }
}
