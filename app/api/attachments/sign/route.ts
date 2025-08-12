 // C:\Users\steph\thebloodroom\app\api\attachments\sign\route.ts
import { NextResponse } from 'next/server';
import { getSignedGetUrl } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    const { key, expiresIn } = await req.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ ok: false, error: 'key required' }, { status: 400 });
    }
    const url = await getSignedGetUrl(key, Math.min(Math.max(Number(expiresIn) || 600, 60), 3600));
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    console.error('[attachments/sign] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Sign failed' }, { status: 500 });
  }
}
