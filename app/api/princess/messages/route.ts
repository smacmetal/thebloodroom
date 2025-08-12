 import { NextResponse } from 'next/server';
import { listObjects, getObjectJSON } from '@/lib/s3-listing';

export async function GET() {
  try {
    const prefix = `walls/Princess/messages/`; // where your Princess messages live
    const keys = await listObjects(prefix, '.json');

    const out: any[] = [];
    for (const key of keys.slice(-150).reverse()) {
      try {
        out.push({ id: key, ...(await getObjectJSON(key)) });
      } catch {}
    }

    return NextResponse.json({ ok: true, items: out });
  } catch (e: any) {
    console.error('[princess/messages] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
