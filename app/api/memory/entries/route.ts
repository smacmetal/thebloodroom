 import { NextResponse } from 'next/server';
import { listObjects, getObjectJSON } from '@/lib/s3-listing';

export async function GET() {
  try {
    const keys = await listObjects('memory/entries/', '.json');

    const items: any[] = [];
    for (const key of keys.slice(-200).reverse()) {
      try {
        items.push({ id: key, ...(await getObjectJSON(key)) });
      } catch {}
    }

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    console.error('[memory/entries] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
