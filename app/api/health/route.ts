import { NextResponse } from 'next/server';

export async function GET() {
  // Extend here later to check filesystem, DB, etc.
  return NextResponse.json({ ok: true, timestamp: Date.now() });
}
