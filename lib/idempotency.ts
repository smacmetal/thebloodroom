// C:\Users\steph\thebloodroom\lib\idempotency.ts
import crypto from 'crypto';

export type Role = 'King' | 'Queen' | 'Princess';

export function computeIdempotencyKey(input: {
  author: Role;
  recipients: Role[];
  text: string;
  createdAt: string; // ISO
}) {
  const h = crypto.createHash('sha256');
  h.update(
    JSON.stringify({
      a: input.author,
      r: [...input.recipients].sort(),
      t: String(input.text || '').trim(),
      c: input.createdAt,
    })
  );
  return h.digest('hex'); // hex-safe for filenames/keys
}

export function safeStamp(iso: string) {
  return iso.replace(/[:.]/g, '-');
}
