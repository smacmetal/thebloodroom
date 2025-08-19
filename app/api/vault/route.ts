// /app/api/vault/route.ts

import { promises as fs } from 'fs';
import path from 'path';

const vaultDir = path.resolve(process.cwd(), 'vault');

export async function POST(req: Request) {
  const data = await req.json();
  const { id, title, content, author, archived } = data;

  const newMemory = {
    id,
    title,
    body: content,
    author,
    date: new Date().toISOString(),
    tags: [],
    status: archived ? 'archived' : 'active',
  };

  const filePath = path.join(vaultDir, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(newMemory, null, 2), 'utf8');

  return new Response(JSON.stringify({ message: 'Memory saved' }), { status: 200 });
}
