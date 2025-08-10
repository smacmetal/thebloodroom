import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import multiparty from 'multiparty';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

export const config = { api: { bodyParser: false } };

const messagesDir = path.join(process.cwd(), 'data', 'princess', 'messages');
const filesDir = path.join(messagesDir, 'files');

async function ensureDirs() {
  await fs.mkdir(messagesDir, { recursive: true });
  await fs.mkdir(filesDir, { recursive: true });
}

export async function GET() {
  try {
    await ensureDirs();
    const files = await fs.readdir(messagesDir);
    const jsons = files.filter((f) => f.endsWith('.json'));
    const messages = await Promise.all(
      jsons.map(async (file) => JSON.parse(await fs.readFile(path.join(messagesDir, file), 'utf8')))
    );
    return NextResponse.json(messages);
  } catch (err) {
    console.error('GET /princess/messages failed:', err);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || '';
    const cl = req.headers.get('content-length') || '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content-type' }, { status: 400 });
    }

    await ensureDirs();

    const buf = Buffer.from(await req.arrayBuffer());
    const stream: any = Readable.from(buf);
    stream.headers = { 'content-type': ct, 'content-length': cl };

    const form = new multiparty.Form();
    const { fields, files } = await new Promise<any>((resolve, reject) => {
      form.parse(stream, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
    });

    const message = fields.message?.[0] ?? '';
    const author = fields.author?.[0] ?? 'Unknown';
    const timestamp = new Date().toISOString();

    let filename: string | null = null;
    const incoming = files?.file?.[0];
    if (incoming) {
      const unique = `${uuidv4()}-${incoming.originalFilename}`;
      await fs.copyFile(incoming.path, path.join(filesDir, unique));
      filename = unique;
    }

    const record = { message, author, timestamp, filename };
    await fs.writeFile(path.join(messagesDir, `${timestamp}.json`), JSON.stringify(record, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /princess/messages failed:', err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
