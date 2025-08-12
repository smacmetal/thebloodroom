 // C:\Users\steph\thebloodroom\app\api\memory\entries\route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSignedGetUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ENTRIES_DIR = path.join(process.cwd(), 'data', 'memory', 'entries');

type RawEntry = {
  id?: string;
  title?: string;
  story?: string;         // plain or HTML
  html?: string;          // optional rich HTML
  category?: string;      // tattoo | album | declaration | ritual | symbol | other
  date?: string;          // human-friendly or ISO
  timestamp?: string;     // ISO
  attachments?: { name?: string; path?: string }[]; // S3 keys
};

const isImage = (p?: string) => !!p && /\.(png|jpe?g|gif|webp|avif)$/i.test(p);
const isPdf   = (p?: string) => !!p && /\.pdf$/i.test(p);

function safeTitle(x: any, fallback: string) {
  const s = typeof x === 'string' && x.trim() ? x.trim() : '';
  return s || fallback;
}

function safeCategory(x: any) {
  const s = typeof x === 'string' ? x.toLowerCase() : '';
  return ['declaration','ritual','tattoo','album','symbol','other'].includes(s) ? s : 'other';
}

function toSortableDate(e: RawEntry) {
  // Prefer strict ISO timestamp, then date (if parseable), else empty for bottom
  const t = e.timestamp || e.date || '';
  const d = new Date(t);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get('limit') || '200', 10)));

    await fs.mkdir(ENTRIES_DIR, { recursive: true });

    const files = (await fs.readdir(ENTRIES_DIR)).filter(f => f.toLowerCase().endsWith('.json'));
    // Sort newest-first by filename (common pattern if filenames include timestamps)
    files.sort().reverse();

    const results: any[] = [];
    for (const file of files) {
      if (results.length >= limit) break;

      try {
        const raw = await fs.readFile(path.join(ENTRIES_DIR, file), 'utf8');
        const data = JSON.parse(raw) as RawEntry;

        // Normalize basic fields
        const id = data.id || file;
        const title = safeTitle(data.title, file.replace(/\.json$/i, ''));
        const category = safeCategory(data.category);
        const story = typeof data.html === 'string' && data.html.trim()
          ? data.html
          : (typeof data.story === 'string' ? data.story : '');

        // Pick a primary attachment (first image/pdf if present)
        let fileUrl: string | undefined = undefined;
        const primary = (Array.isArray(data.attachments) ? data.attachments : []).find(a =>
          isImage(a?.path) || isPdf(a?.path)
        );
        if (primary?.path) {
          try {
            // Sign S3 key for short-lived preview
            fileUrl = await getSignedGetUrl(primary.path, 600);
          } catch {
            // If signing fails, we just omit the file URL
          }
        }

        results.push({
          id,
          title,
          story,                // your page renders plain text; if you want to render HTML, check for tags
          category,
          date: data.date || undefined,
          timestamp: toSortableDate(data) || undefined,
          file: fileUrl,        // optional, used for inline image/pdf preview
        });
      } catch (err) {
        // Malformed or unreadable entry — log and skip
        console.error('[memory/entries] Skipping malformed file:', file, err);
        continue;
      }
    }

    // Secondary sort by derived timestamp (newest first), then title
    results.sort((a, b) => {
      const ta = a.timestamp || '';
      const tb = b.timestamp || '';
      if (ta < tb) return 1;
      if (ta > tb) return -1;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });

    return NextResponse.json(results.slice(0, limit));
  } catch (e: any) {
    console.error('[memory/entries] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to load entries' }, { status: 500 });
  }
}
