// C:\Users\steph\thebloodroom\lib\client\postTempleMessage.ts
import type { Role } from "@/lib/messages";

export type TemplePostInput = {
  author: Role;                 // 'King' | 'Queen' | 'Princess'
  recipients: Role[];           // e.g. ['Queen', 'Princess']
  content: string;
  attachments?: { name: string; path: string }[];
  meta?: Record<string, any>;
};

export type TemplePostResult = {
  ok: boolean;
  id?: string;
  idempotencyKey?: string;
  canonicalKey?: string;
  indexKeys?: string[];
  error?: string;
};

/**
 * Safely post a Temple message to /api/temple/submit
 */
export async function postTempleMessage(
  input: TemplePostInput
): Promise<TemplePostResult> {
  const payload = {
    author: input.author,
    recipients: input.recipients,
    content: String(input.content || "").trim(),
    attachments: input.attachments || [],
    meta: input.meta || {},
  };

  try {
    const res = await fetch("/api/temple/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }

    return { ok: true, ...data };
  } catch (err: any) {
    return { ok: false, error: err.message || "Network error" };
  }
}
