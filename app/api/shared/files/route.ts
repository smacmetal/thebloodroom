import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fsp } from 'fs';

const ROOT = path.join(process.cwd(), 'data');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || '';
    const id = searchParams.get('id') || '';
    const name = searchParams.get('name') || '';

    if (!role || !id || !name) {
      return NextResponse.json({ error: 'role, id, and name required' }, { status: 400 });
    }

    const abs = path.join(ROOT, role, 'messages', 'files', id, name);
    const data = await fsp.readFile(abs);
    // Simple content-type guess
    const contentType =
      name.endsWith('.png') ? 'image/png' :
      name.endsWith('.jpg') || name.endsWith('.jpeg') ? 'image/jpeg' :
      name.endsWith('.gif') ? 'image/gif' :
      'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
      },
    });
  } catch (e) {
    console.error('file serve error:', e);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
