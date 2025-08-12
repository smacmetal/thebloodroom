// C:\Users\steph\thebloodroom\app\api\walls\[role]\images\file\route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ role: string }> }
) {
  const { role } = await params;
  const url = new URL(req.url);
  const name = url.searchParams.get('name');
  if (!name) return new Response('name required', { status: 400 });

  const filePath = path.join(process.cwd(), 'data', 'walls', role.toLowerCase(), 'images', name);
  try {
    const data = await fs.readFile(filePath);
    // naive content type; good enough for dev
    const ct = name.toLowerCase().endsWith('.png')
      ? 'image/png'
      : name.toLowerCase().endsWith('.webp')
      ? 'image/webp'
      : name.toLowerCase().endsWith('.gif')
      ? 'image/gif'
      : 'image/jpeg';
    return new Response(data, { headers: { 'Content-Type': ct, 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }
}
