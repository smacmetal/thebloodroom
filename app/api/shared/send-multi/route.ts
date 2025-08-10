import { NextRequest, NextResponse } from 'next/server';
import { sendToRoles } from '@/lib/sendToRoles';

type Body = {
  author: 'King' | 'Queen' | 'Princess';
  message: string;
  timestamp: string; // ISO string from the client
  roles: ('King' | 'Queen' | 'Princess')[];
};

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Expected application/json' }, { status: 400 });
    }

    const body = (await req.json()) as Partial<Body>;
    const { author, message, timestamp, roles } = body || {};

    if (!author || !message || !timestamp || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Map to our S3 writer (expects { text, author, timestamp })
    await sendToRoles(
      { text: String(message), author: String(author), timestamp: String(timestamp) },
      roles as Body['roles']
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/shared/send-multi failed:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
