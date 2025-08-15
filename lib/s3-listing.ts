// C:\Users\steph\thebloodroom\lib\s3-listing.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function listImages(params: { bucket: string; prefix?: string }) {
  const { bucket, prefix } = params;
  const cmd = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix ?? "",
  });

  const out = await s3.send(cmd);
  const keys =
    out.Contents?.filter(o => !!o.Key && !o.Key.endsWith("/")).map(o => o.Key!) ?? [];

  return keys.map(
    k => `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${k}`
  );
}
