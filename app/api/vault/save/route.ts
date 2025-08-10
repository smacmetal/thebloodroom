import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const memory = await req.json();
  const id = uuidv4(); // Unique file name
  const filePath = path.join(process.cwd(), 'app', 'data', 'vault', 'save', `${id}.json`);

  await fs.writeFile(filePath, JSON.stringify({ id, ...memory }, null, 2));

  return NextResponse.json({ success: true, id });
}
