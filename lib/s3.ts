 import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommandOutput,
  _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const S3_REGION = process.env.AWS_REGION!;
export const S3_BUCKET = process.env.S3_BUCKET || process.env.S3_BUCKET_NAME!;
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "";
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const S3_SSE = process.env.S3_SSE || "";

if (!S3_REGION || !S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
  console.warn("[s3] Missing AWS S3 environment variables.");
}

export const s3 = new S3Client({
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  maxAttempts: 3,
});

function toUtf8(data?: Uint8Array | Buffer | undefined) {
  if (!data) return "";
  return Buffer.from(data).toString("utf-8");
}

async function withRetry<T>(fn: () => Promise<T>, label: string, tries = 3, delayMs = 150): Promise<T> {
  let lastErr: any;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const backoff = delayMs * i;
      console.warn(`[s3:${label}] attempt ${i} failed: ${err?.message || err}`);
      if (i < tries) await new Promise((r) => setTimeout(r, backoff));
    }
  }
  console.error(`[s3:${label}] failed after ${tries} attempts`, lastErr);
  throw lastErr;
}

export async function putJson(key: string, data: unknown) {
  const Body = Buffer.from(JSON.stringify(data, null, 2), "utf-8");
  const ContentType = "application/json";
  await withRetry(
    () =>
      s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body,
          ContentType,
          ...(S3_SSE ? { ServerSideEncryption: S3_SSE as any } : {}),
        })
      ),
    `putJson:${key}`
  );
}

export async function putJsonIfAbsent(key: string, data: unknown) {
  const exists = await keyExists(key);
  if (exists) return false;
  await putJson(key, data);
  return true;
}

export async function getJson<T = any>(key: string): Promise<T> {
  return await withRetry(async () => {
    const res: GetObjectCommandOutput = await s3.send(
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
    );
    const buf = await res.Body?.transformToByteArray();
    const text = toUtf8(buf);
    if (!text) throw new Error("Empty object body");
    try {
      return JSON.parse(text) as T;
    } catch (e: any) {
      console.error("[s3:getJson] JSON parse error for key", key, e?.message || e);
      throw e;
    }
  }, `getJson:${key}`);
}

export async function listJsonUnder(prefix: string): Promise<string[]> {
  return await withRetry(async () => {
    const out: string[] = [];
    let ContinuationToken: string | undefined = undefined;
    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: prefix,
          ContinuationToken,
        })
      );
      (res.Contents || []).forEach((o: _Object) => {
        if (o.Key) out.push(o.Key);
      });
      ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (ContinuationToken);
    return out;
  }, `listJsonUnder:${prefix}`);
}

export async function uploadFileToS3(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string
) {
  await withRetry(
    () =>
      s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: body,
          ...(contentType ? { ContentType: contentType } : {}),
          ...(S3_SSE ? { ServerSideEncryption: S3_SSE as any } : {}),
        })
      ),
    `uploadFile:${key}`
  );
}

export async function getFileFromS3(key: string) {
  return await withRetry(
    () => s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })),
    `getFile:${key}`
  );
}

export async function getSignedGetUrl(key: string, expiresIn = 300) {
  return await withRetry(
    () =>
      getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), {
        expiresIn,
      }),
    `signedUrl:${key}`
  );
}

export async function listFilesInS3(prefix = "") {
  return await withRetry(
    () => s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix })),
    `listFiles:${prefix}`
  );
}

export async function keyExists(key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return true;
  } catch (e: any) {
    if (e && (e.$metadata?.httpStatusCode === 404 || e.name === "NotFound")) return false;
    if (e?.Code === "NotFound") return false;
    return false;
  }
}

export async function putJsonDeterministic(key: string, data: unknown) {
  await putJson(key, data);
}
