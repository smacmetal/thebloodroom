 // C:\Users\steph\thebloodroom\app\api\attachments\upload\route.ts
import { NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/lib/s3';

const ALLOWED = /\.(png|jpe?g|gif|webp|avif)$/i;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const role = String(form.get('role') || 'shared');            // 'King'|'Queen'|'Princess'|'shared'
    const group = String(form.get('group') || 'wall');            // namespacing, default "wall"
    const idempotencyKey = String(form.get('idempotencyKey') || '');
    if (!file) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });

    const name = file.name || 'upload';
    if (!ALLOWED.test(name)) {
      return NextResponse.json({ ok: false, error: 'Unsupported file type' }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safe = name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);

    const prefix = idempotencyKey
      ? `attachments/${group}/${role}/${idempotencyKey}`
      : `attachments/${group}/${role}`;

    const key = `${prefix}/${stamp}-${safe}`;
    await uploadFileToS3(key, buf, file.type || 'application/octet-stream');

    return NextResponse.json({ ok: true, key, name: safe });
  } catch (e: any) {
    console.error('[attachments/upload] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
