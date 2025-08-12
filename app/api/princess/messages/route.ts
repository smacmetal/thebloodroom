 import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { getSignedGetUrl } from '@/lib/s3';
import { safeStamp } from '@/lib/idempotency';

const ROOT = path.join(process.cwd(), 'data', 'princess', 'messages');

type Saved = {
  author: 'King'|'Queen'|'Princess';
  recipients: ('King'|'Queen'|'Princess')[];
  text: string;
  createdAt: string;
  attachments?: { name: string; path: string }[];
  meta?: any;
};

export async function GET() {
  await fs.mkdir(ROOT, { recursive: true });
  const files = (await fs.readdir(ROOT)).filter(f => f.endsWith('.json')).sort().reverse();
  const out: any[] = [];

  for (const f of files.slice(0, 200)) {
    try {
      const raw = await fs.readFile(path.join(ROOT, f), 'utf8');
      const msg: Saved = JSON.parse(raw);
      const filesSigned = await Promise.all(
        (msg.attachments || []).map(async a => ({
          name: a.name,
          url: await getSignedGetUrl(a.path, 600),
        }))
      );
      out.push({
        author: msg.author,
        message: msg.text,
        timestamp: msg.createdAt,
        files: filesSigned,
      });
    } catch {}
  }
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload: Saved = {
      author: body.author,
      recipients: Array.isArray(body.recipients) ? body.recipients : [],
      text: String(body.text || ''),
      createdAt: String(body.createdAt || new Date().toISOString()),
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      meta: body.meta || {},
    };

    await fs.mkdir(ROOT, { recursive: true });
    const base = safeStamp(payload.createdAt || new Date().toISOString());
    const file = `${base}-${randomUUID()}.json`;
    await fs.writeFile(path.join(ROOT, file), JSON.stringify(payload, null, 2), 'utf8');

    return NextResponse.json({ ok: true, id: file });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const ts = url.searchParams.get('timestamp');
  if (!ts) return NextResponse.json({ ok: false, error: 'Missing timestamp' }, { status: 400 });
  try {
    const prefix = `${safeStamp(ts)}`;
    const files = (await fs.readdir(ROOT)).filter(f => f.startsWith(prefix) && f.endsWith('.json'));
    await Promise.all(files.map(f => fs.unlink(path.join(ROOT, f))));
    return NextResponse.json({ ok: true, deleted: files.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Delete failed' }, { status: 500 });
  }
}
