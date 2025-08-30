 import { s3, S3_BUCKET } from '@/lib/s3';
import {
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

export async function listObjects(prefix: string, endsWith?: string) {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;

  do {
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken,
      })
    );

    for (const c of r.Contents ?? []) {
      const k = c.Key || '';
      if (!endsWith || k.toLowerCase().endsWith(endsWith)) {
        keys.push(k);
      }
    }

    ContinuationToken = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (ContinuationToken);

  keys.sort();
  return keys;
}

export async function getObjectJSON<T = any>(key: string): Promise<T> {
  const r = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );

  const body = await streamToString(r.Body as any);
  return JSON.parse(body) as T;
}

// helper: convert stream to string
async function streamToString(stream: any): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}
