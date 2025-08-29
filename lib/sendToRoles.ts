 import crypto from "crypto";
import { putJson } from "@/lib/s3";
import twilio from "twilio";

type Role = "King" | "Queen" | "Princess";

export interface MessagePayload {
  text: string;
  author: Role;
  timestamp: string; // ISO string
  attachments?: { name: string; path: string }[];
  meta?: Record<string, any>;
}

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH!);

const roleNumbers: Record<Role, string> = {
  King: process.env.KING_PHONE!,
  Queen: process.env.QUEEN_PHONE!,
  Princess: process.env.PRINCESS_PHONE!,
};

/**
 * Unified behavior:
 * - Canonical S3 write under messages/canonical/<id>.json
 * - Optional per-role index records
 * - Twilio SMS/MMS delivery to recipient roles
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
  const text = String(message.text || "").trim();
  if (!text) throw new Error("sendToRoles: empty message text");
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error("sendToRoles: recipients required");
  }
  if (!message.timestamp) {
    throw new Error("sendToRoles: timestamp (ISO) required");
  }

  // Idempotency key
  const idempotencyKey = computeIdempotencyKey({
    author: message.author,
    recipients: [...recipients].sort(),
    text,
    timestamp: message.timestamp,
  });

  // Unique id
  const id = crypto.randomUUID();

  // Canonical envelope
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

  // ---- Canonical S3 write
  const canonicalKey = `messages/canonical/${safeStamp(message.timestamp)}-${id}.json`;
  await putJson(canonicalKey, canonical);

  // ---- Optional: per-role indexes
  const indexKeys: string[] = [];
  if (options?.writeRoleIndexes) {
    for (const role of recipients) {
      const idx = {
        id,
        idempotencyKey,
        role,
        ref: canonicalKey,
        timestamp: message.timestamp,
      };
      const key = `messages/index/${role.toLowerCase()}/${safeStamp(message.timestamp)}-${id}.json`;
      await putJson(key, idx);
      indexKeys.push(key);
    }
  }

  // ---- Twilio delivery (per recipient)
  for (const role of recipients) {
    const to = roleNumbers[role];
    if (!to) continue;

    await client.messages.create({
      from: process.env.TWILIO_PHONE!,
      to,
      body: `${message.author}: ${text}`,
      ...(message.attachments?.length
        ? { mediaUrl: message.attachments.map((a) => a.path) }
        : {}),
    });
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
  const h = crypto.createHash("sha256");
  h.update(
    JSON.stringify({
      a: input.author,
      r: input.recipients,
      t: input.text.trim(),
      ts: input.timestamp,
    })
  );
  return h.digest("hex");
}

function safeStamp(iso: string) {
  return iso.replace(/[:.]/g, "-");
}
