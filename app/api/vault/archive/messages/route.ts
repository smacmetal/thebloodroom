import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const MESSAGES_DIR = path.join(process.cwd(), 'data', 'vault', 'archive', 'messages');

export async function GET() {
  try {
    const files = await fs.readdir(MESSAGES_DIR);
    const messages = [];

    for (const file of files) {
      const filePath = path.join(MESSAGES_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      messages.push(data);
    }

    // Sort by timestamp descending
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to read messages:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { timestamp } = await req.json();
    const files = await fs.readdir(MESSAGES_DIR);

    for (const file of files) {
      const filePath = path.join(MESSAGES_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (data.timestamp === timestamp) {
        await fs.unlink(filePath);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
