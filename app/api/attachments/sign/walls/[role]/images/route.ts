// C:\Users\steph\thebloodroom\app\api\walls/[role]/images/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSignedGetUrl } from '@/lib/s3';

const dataRoot = path.join(process.cwd(), 'data');
const isImg = (p: string) => /\.(png|jpe?g|gif|webp|avif)$/i.test(p);

export async function GET(
  _req: Request,
  { params }: { params: { role: 'King'|'Queen'|'Princess' } }
) {
  try {
    const role = params.role;
    const dir = path.join(dataRoot, role.toLowerCase(), 'messages');
    await fs.mkdir(dir, { recursive: true });
    const names = (await fs.readdir(dir)).filter(n => n.toLowerCase().endsWith('.json'));

    // read recent N messages, collect image attachments
    const items: { title: string; key: string; url: string }[] = [];
    const limitMsgs = 150;
    const slice = names.sort().reverse().slice(0, limitMsgs);

    for (const name of slice) {
      const full = path.join(dir, name);
      try {
        const text = await fs.readFile(full, 'utf8');
        const msg = JSON.parse(text) as {
          text?: string;
          attachments?: { name: string; path: string }[];
        };
        const imgs = (msg.attachments || []).filter(a => a?.path && isImg(a.path));
        for (const a of imgs) {
          const url = await getSignedGetUrl(a.path, 600);
          items.push({ title: a.name || msg.text || 'image', key: a.path, url });
        }
      } catch {}
      if (items.length >= 60) break; // cap gallery size
    }

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error('[walls:images] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
