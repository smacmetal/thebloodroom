// C:\Users\steph\thebloodroom\lib\client\sendMessage.ts
import type { Role } from '@/lib/messages';

export type PostMultiInput = {
  author: Role;                 // 'King' | 'Queen' | 'Princess'
  recipients: Role[];           // e.g., ['Queen','Princess']
  text: string;
  attachments?: { name: string; path: string }[];
  meta?: Record<string, any>;
  createdAt?: string;           // optional; will be generated if omitted
};

export type PostMultiResult = {
  ok: boolean;
  id?: string;
  idempotencyKey?: string;
  author?: Role;
  recipients?: Role[];
  createdAt?: string;
  s3?: {
    id?: string;
    idempotencyKey?: string;
    canonicalKey?: string;
    indexKeys?: string[];
  };
  vaultPath?: string;
  rolePaths?: string[];
  ms?: number;
  error?: string;
};

export function genIsoNow() {
  return new Date().toISOString();
}

/**
 * Posts a multi-recipient message to /api/shared/send-multi with a stable createdAt.
 * Button disabling should be handled by the caller via the returned promise.
 */
export async function postMultiMessage(input: PostMultiInput): Promise<PostMultiResult> {
  const payload = {
    author: input.author,
    recipients: input.recipients,
    text: String(input.text || '').trim(),
    createdAt: input.createdAt || genIsoNow(),
    attachments: input.attachments || [],
    meta: input.meta || {},
  };

  const res = await fetch('/api/shared/send-multi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: PostMultiResult;
  try {
    data = await res.json();
  } catch (e: any) {
    return { ok: false, error: `Bad JSON from server: ${e?.message || e}` };
  }

  if (!res.ok || !data.ok) {
    return { ok: false, error: data?.error || `HTTP ${res.status}` };
  }
  return data;
}
