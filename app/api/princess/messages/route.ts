import { NextRequest, NextResponse } from 'next/server';
import multiparty from 'multiparty';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import {
  putJson,
  listJsonUnder,
  getJson,
  uploadFileToS3,
  getSignedGetUrl,
  s3,
} from '@/lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME || '';

export const runtime = 'nodejs';
export const config = { api: { bodyParser: false } };

// GET — return all Princess messages with signed file URLs (if any)
export async function GET() {
  try {
    const keys = await listJsonUnder('messages/princess/');
    if (!Array.isArray(keys)) return NextResponse.json([]);

    const messages = await Promise.all(
      keys.map(async (key) => {
        try {
          const rec = await getJson<Record<string, any>>(key);
          if (rec?.filename) {
            const s3Key = `messages/princess/files/${rec.filename}`;
            const url = await getSignedGetUrl(s3Key, 3600);
            rec.files = [{ name: rec.filename, url }];
          } else {
            rec.files = [];
          }
          return rec;
        } catch (err) {
          console.error(`Error reading ${key}:`, err);
          return null;
        }
      })
    );

    const filtered = messages.filter(Boolean) as any[];
    filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return NextResponse.json(filtered);
  } catch (err) {
    console.error('GET /princess/messages failed:', err);
    return NextResponse.json([], { status: 200 });
  }
}

// POST — supports application/json (no file) and multipart/form-data (with file)
export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || '';
    const timestamp = new Date().toISOString();

    // JSON path
    if (ct.includes('application/json')) {
      const body = await req.json();
      const record = {
        message: String(body.message ?? ''),
        author: String(body.author ?? 'Unknown'),
        timestamp,
        filename: null as string | null,
      };
      await putJson(`messages/princess/${timestamp}.json`, record);
      return NextResponse.json({ success: true });
    }

    // Multipart path
    if (ct.includes('multipart/form-data')) {
      const cl = req.headers.get('content-length') || '';
      const buf = Buffer.from(await req.arrayBuffer());
      const stream: any = Readable.from(buf);
      stream.headers = { 'content-type': ct, 'content-length': cl };

      const form = new multiparty.Form();
      const { fields, files } = await new Promise<any>((resolve, reject) => {
        form.parse(stream, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
      });

      const message = fields.message?.[0] ?? '';
      const author = fields.author?.[0] ?? 'Unknown';

      let filename: string | null = null;
      const incoming = files?.file?.[0];
      if (incoming) {
        const unique = `${uuidv4()}-${incoming.originalFilename}`;
        const fileBuffer = await import('fs').then((fs) => fs.promises.readFile(incoming.path));
        await uploadFileToS3(`messages/princess/files/${unique}`, fileBuffer, incoming.headers['content-type']);
        filename = unique;
      }

      const record = { message, author, timestamp, filename };
      await putJson(`messages/princess/${timestamp}.json`, record);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
  } catch (err) {
    console.error('POST /princess/messages failed:', err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

// DELETE — ?timestamp=ISO — removes JSON and attached file (if present)
export async function DELETE(req: NextRequest) {
  try {
    const ts = req.nextUrl.searchParams.get('timestamp');
    if (!ts) return NextResponse.json({ error: 'Missing timestamp' }, { status: 400 });

    const jsonKey = `messages/princess/${ts}.json`;

    // read record to discover attached filename (ignore errors)
    let filename: string | null = null;
    try {
      const rec = await getJson<Record<string, any>>(jsonKey);
      if (rec?.filename) filename = String(rec.filename);
    } catch {}

    if (!BUCKET) return NextResponse.json({ error: 'Missing S3 bucket' }, { status: 500 });

    // delete JSON file
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: jsonKey }));

    // delete attachment if it exists
    if (filename) {
      const fileKey = `messages/princess/files/${filename}`;
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey }));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /princess/messages failed:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
