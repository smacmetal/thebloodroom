 // C:\Users\steph\thebloodroom\lib\s3.ts
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET!;

// Save JSON to S3
export async function putJson(key: string, data: any): Promise<void> {
  const body = Buffer.from(JSON.stringify(data, null, 2));
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "application/json",
    })
  );
}

// List all objects (optionally filtered by prefix)
export async function listObjects(bucket: string = S3_BUCKET, prefix: string = ""): Promise<string[]> {
  const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
  const out = await s3.send(cmd);
  return out.Contents?.map(o => o.Key!).filter(Boolean) ?? [];
}

// Get and parse JSON object
export async function getObjectJSON<T = any>(bucket: string = S3_BUCKET, key: string): Promise<T> {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  const out = await s3.send(cmd);
  const body = await out.Body?.transformToString("utf-8");
  return body ? (JSON.parse(body) as T) : ({} as T);
}

// Convenience: return presigned image URLs
export async function listImages(params: { bucket?: string; prefix?: string }) {
  const bucket = params.bucket || S3_BUCKET;
  const prefix = params.prefix || "";
  const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });

  const out = await s3.send(cmd);
  const keys =
    out.Contents?.filter(o => !!o.Key && !o.Key.endsWith("/")).map(o => o.Key!) ?? [];

  return keys.map(k => `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${k}`);
}
