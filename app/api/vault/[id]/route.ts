import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new NextResponse('Memory ID is required', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'app/vault/_samples', `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({ message: `Memory ${id} created successfully.` });
  } catch (error) {
    console.error('Error creating memory:', error);
    return new NextResponse('Failed to create memory.', { status: 500 });
  }
}
