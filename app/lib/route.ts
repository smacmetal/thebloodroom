import { s3, S3_BUCKET } from '@/lib/s3';

export async function listObjects(prefix: string, endsWith?: string) {
  const keys: string[] = [];
  let ContinuationToken: string | undefined;
  do {
    const r = await s3.listObjectsV2({ Bucket: S3_BUCKET, Prefix: prefix, ContinuationToken }).promise();
    for (const c of r.Contents ?? []) {
      const k = c.Key || '';
      if (!endsWith || k.toLowerCase().endsWith(endsWith)) keys.push(k);
    }
    ContinuationToken = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (ContinuationToken);
  keys.sort();
  return keys;
}

export async function getObjectJSON<T = any>(key: string): Promise<T> {
  const obj = await s3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
  return JSON.parse((obj.Body as Buffer).toString('utf8')) as T;
}
