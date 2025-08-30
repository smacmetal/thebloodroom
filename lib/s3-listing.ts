 // C:\Users\steph\thebloodroom\lib\s3-listing.ts
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

// Helper: stream → string
async function streamToString(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

// List objects with optional suffix filtering
export async function listObjects(prefix: string, endsWith?: string): Promise<string[]> {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;

  do {
    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken,
      })
    );

    for (const o of out.Contents || []) {
      const k = o.Key || "";
      if (!endsWith || k.toLowerCase().endsWith(endsWith.toLowerCase())) {
        keys.push(k);
      }
    }

    ContinuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return keys;
}

// Fetch + parse JSON object
export async function getObjectJSON<T = any>(key: string): Promise<T | null> {
  const out = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  if (!out.Body) return null;

  const bodyString = await streamToString(out.Body as Readable);
  return JSON.parse(bodyString) as T;
}
