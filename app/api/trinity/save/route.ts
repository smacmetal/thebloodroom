import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const saveDir = path.join(process.cwd(), 'data', 'trinity', 'messages');

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const timestamp = new Date().toISOString();
    const filePath = path.join(saveDir, `${timestamp}.json`);

    fs.mkdirSync(saveDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

    return NextResponse.json({ message: 'Message saved successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }
}
