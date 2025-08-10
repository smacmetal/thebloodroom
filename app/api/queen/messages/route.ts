import { NextRequest, NextResponse } from 'next/server';
import multiparty from 'multiparty';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { putJson, listJsonUnder, getJson, uploadFileToS3 } from '@/lib/s3';

export const config = { api: { bodyParser: false } };

export async function GET() {
  try {
    const keys = await listJsonUnder('messages/queen/');

    if (!Array.isArray(keys)) {
      console.error('Expected array of keys from S3, got:', keys);
      return NextResponse.json([]);
    }

    const messages = await Promise.all(
      keys.map(async (key) => {
        try {
          return await getJson(key);
        } catch (err) {
          console.error(`Error reading JSON from key ${key}:`, err);
          return null;
        }
      })
    );

    const filtered = messages.filter(Boolean);
    filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    return NextResponse.json(filtered);
  } catch (err) {
    console.error('GET /queen/messages failed:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || '';
    const cl = req.headers.get('content-length') || '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content-type' }, { status: 400 });
    }

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
      const fileBuffer = await import('fs').then(fs => fs.promises.readFile(incoming.path));
      await uploadFileToS3(`messages/queen/files/${unique}`, fileBuffer, incoming.headers['content-type']);
      filename = unique;
    }

    const record = { message, author, timestamp, filename };
    await putJson(`messages/queen/${timestamp}.json`, record);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /queen/messages failed:', err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
