import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body || !body.content) {
      return NextResponse.json({ error: 'Missing message content' }, { status: 400 });
    }

    const dir = path.join(process.cwd(), 'data', 'princess', 'messages');
    const timestamp = Date.now();
    const filename = `${timestamp}.json`;
    const filePath = path.join(dir, filename);

    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    // Add metadata if needed
    const messageData = {
      ...body,
      author: 'Princess',
      timestamp,
    };

    fs.writeFileSync(filePath, JSON.stringify(messageData, null, 2), 'utf8');

    return NextResponse.json({ status: 'success', file: filename });
  } catch (error) {
    console.error('[Princess SAVE Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
