 // app/api/walls/[role]/images/route.ts
import { NextResponse } from 'next/server';
import { listJsonUnder, getJson, getSignedGetUrl } from '@/lib/s3';

type Role = 'King' | 'Queen' | 'Princess';
const isImg = (p: string) => /\.(png|jpe?g|gif|webp|avif)$/i.test(p);

/**
 * Next 15 passes dynamic params as a Promise in the app router.
 * We await it once, then list message JSON files in S3 and extract image attachments.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ role: Role }> }
) {
  try {
    const { role } = await ctx.params;
    const prefix = `messages/${role.toLowerCase()}/`;

    // 1) List all message JSON objects for this role (S3 paths like messages/queen/2025-08-11T...json)
    const keys = await listJsonUnder(prefix);
    // Newest-first (filenames are timestamps)
    keys.sort().reverse();

    const items: { title: string; key: string; url: string }[] = [];

    // 2) Read recent messages, collect image attachments, sign URLs
    for (const key of keys.slice(0, 200)) {
      try {
        const msg = await getJson<{
          text?: string;
          attachments?: { name?: string; path: string }[];
        }>(key);

        for (const a of msg.attachments ?? []) {
          if (!a?.path || !isImg(a.path)) continue;
          const url = await getSignedGetUrl(a.path, 600); // 10 minutes
          items.push({
            title: a.name || msg.text || 'image',
            key: a.path,
            url,
          });
          if (items.length >= 60) break;
        }
        if (items.length >= 60) break;
      } catch {
        // ignore a single bad/corrupt message; keep going
      }
    }

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error('[walls:images] ERROR', e);
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed' },
      { status: 500 }
    );
  }
}
