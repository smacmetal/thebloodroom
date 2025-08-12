// C:\Users\steph\thebloodroom\lib\sendToRoles.ts

import crypto from 'crypto';
import { putJson } from '@/lib/s3';

type Role = 'King' | 'Queen' | 'Princess';

export interface MessagePayload {
  text: string;
  author: Role;       // enforce role typing
  timestamp: string;  // ISO string
  attachments?: { name: string; path: string }[];
  meta?: Record<string, any>;
}

/**
 * NEW behavior:
 * - ONE canonical S3 write under messages/canonical/<id>.json
 * - OPTIONAL lightweight per-role index records under messages/index/<role>/<id>.json
 *   (Safe if your consumers only watch messages/canonical/)
 * - Idempotency key based on (author, recipients, text, timestamp)
 */
export async function sendToRoles(
  message: MessagePayload,
  recipients: Role[],
  options?: { writeRoleIndexes?: boolean }
): Promise<{
  id: string;
  idempotencyKey: string;
  canonicalKey: string;
  indexKeys: string[];
}> {
  const text = String(message.text || '').trim();
  if (!text) throw new Error('sendToRoles: empty message text');
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('sendToRoles: recipients required');
  }
  if (!message.timestamp) {
    throw new Error('sendToRoles: timestamp (ISO) required');
  }

  // Create a stable idempotency key for this logical send
  const idempotencyKey = computeIdempotencyKey({
    author: message.author,
    recipients: [...recipients].sort(),
    text,
    timestamp: message.timestamp,
  });

  // Create a unique id for storage & tracing
  const id = crypto.randomUUID();

  // Canonical envelope stored ONCE
  const canonical = {
    id,
    idempotencyKey,
    author: message.author,
    recipients,
    text,
    timestamp: message.timestamp,
    attachments: message.attachments || [],
    meta: message.meta || {},
  };

  // ---- SINGLE canonical write (the only key your processors should watch)
  const canonicalKey = `messages/canonical/${safeStamp(message.timestamp)}-${id}.json`;
  await putJson(canonicalKey, canonical);

  // ---- OPTIONAL: per-role lightweight indexes (do NOT hook processors to these)
  const indexKeys: string[] = [];
  if (options?.writeRoleIndexes) {
    for (const role of recipients) {
      const idx = {
        id,
        idempotencyKey,
        role,
        ref: canonicalKey, // pointer to canonical
        timestamp: message.timestamp,
      };
      const key = `messages/index/${role.toLowerCase()}/${safeStamp(message.timestamp)}-${id}.json`;
      await putJson(key, idx);
      indexKeys.push(key);
    }
  }

  return { id, idempotencyKey, canonicalKey, indexKeys };
}

// ---------- helpers ----------
function computeIdempotencyKey(input: {
  author: Role;
  recipients: Role[];
  text: string;
  timestamp: string;
}) {
  const h = crypto.createHash('sha256');
  h.update(
    JSON.stringify({
      a: input.author,
      r: input.recipients, // already sorted by caller
      t: input.text.trim(),
      ts: input.timestamp,
    })
  );
  return h.digest('hex');
}

function safeStamp(iso: string) {
  // S3 keys can include ":" but keeping it filesystem-friendly helps consistency
  return iso.replace(/[:.]/g, '-');
}
