 // C:\Users\steph\thebloodroom\lib\messages.ts
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { safeStamp } from '@/lib/idempotency';

export type Role = 'King' | 'Queen' | 'Princess';

export type AttachmentRef = { name: string; path: string };

export interface SavedMessage {
  author: Role;
  recipients: Role[];
  text: string;
  html?: string;
  createdAt: string; // ISO
  attachments?: AttachmentRef[];
  meta?: any;
}

function roleDir(role: Role) {
  return path.join(process.cwd(), 'data', role.toLowerCase(), 'messages');
}

/**
 * Write one message JSON under the given role.
 * Uses createdAt + UUID to guarantee no overwrite.
 */
export async function writeMessageToRole(role: Role, msg: SavedMessage): Promise<string> {
  const dir = roleDir(role);
  await fs.mkdir(dir, { recursive: true });
  const stamp = safeStamp(msg.createdAt || new Date().toISOString());
  const file = `${stamp}-${randomUUID()}.json`;
  await fs.writeFile(path.join(dir, file), JSON.stringify(msg, null, 2), 'utf8');
  return file;
}

/**
 * Write a single, canonical copy of the message to the Memory Vault.
 * This prevents one-per-recipient duplicates.
 */
export async function writeSingleVaultCopy(msg: SavedMessage): Promise<string> {
  const vaultDir = path.join(process.cwd(), 'data', 'memory', 'entries');
  await fs.mkdir(vaultDir, { recursive: true });

  const title =
    (msg.text || '').trim().slice(0, 120) ||
    `${msg.author} — ${new Date(msg.createdAt || Date.now()).toLocaleString()}`;

  const entry = {
    id: `${safeStamp(msg.createdAt)}-${randomUUID()}`,
    title,
    // prefer rich html if present
    story: msg.html && msg.html.trim() ? msg.html : msg.text || '',
    category: 'other',
    date: undefined as string | undefined,
    timestamp: msg.createdAt || new Date().toISOString(),
    attachments: (msg.attachments || []).map(a => ({ name: a.name, path: a.path })),
  };

  const file = `${entry.id}.json`;
  await fs.writeFile(path.join(vaultDir, file), JSON.stringify(entry, null, 2), 'utf8');
  return file;
}
