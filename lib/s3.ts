// C:\Users\steph\thebloodroom\lib\s3.ts

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_REGION = process.env.AWS_REGION!;
const S3_BUCKET = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME!;
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || '';
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

if (!S3_REGION || !S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
  console.warn('[s3] Missing AWS S3 environment variables.');
}

export const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

/** ===== JSON Helpers ===== **/
export async function putJson(key: string, data: unknown) {
  const Body = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body,
    ContentType: 'application/json',
  }));
}

export async function getJson<T = any>(key: string): Promise<T> {
  const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  const buf = await res.Body?.transformToByteArray();
  const text = buf ? Buffer.from(buf).toString('utf-8') : '';
  return JSON.parse(text);
}

export async function listJsonUnder(prefix: string): Promise<string[]> {
  const out: string[] = [];
  let ContinuationToken: string | undefined = undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
      ContinuationToken,
    }));
    (res.Contents || []).forEach(o => { if (o.Key) out.push(o.Key); });
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return out;
}

/** ===== Generic File Helpers ===== **/
export async function uploadFileToS3(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string
) {
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

export async function getFileFromS3(key: string) {
  return s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

export async function getSignedGetUrl(key: string, expiresIn = 300) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), { expiresIn });
}

export async function listFilesInS3(prefix = '') {
  const command = new ListObjectsV2Command({
    Bucket: S3_BUCKET,
    Prefix: prefix,
  });
  return s3.send(command);
}
