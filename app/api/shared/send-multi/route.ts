 // C:\Users\steph\thebloodroom\app\api\shared\send-multi\route.ts
import { NextResponse } from 'next/server';
import type { SavedMessage, Role } from '@/lib/messages';
import { writeMessageToRole, writeSingleVaultCopy } from '@/lib/messages';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize inbound payload from MultiRoleMessageForm
    const msg: SavedMessage = {
      author: body.author as Role,
      recipients: Array.isArray(body.recipients) ? body.recipients as Role[] : [],
      text: String(body.text || ''),
      html: typeof body.html === 'string' ? body.html : undefined,
      createdAt: String(body.createdAt || new Date().toISOString()),
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      meta: body.meta || {},
    };

    if (!msg.author || !msg.createdAt) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    // 1) Write a single canonical copy to the Memory Vault
    const vaultId = await writeSingleVaultCopy(msg);

    // 2) Write one copy per recipient role (deterministic but unique file per write)
    const writes = await Promise.all(
      (msg.recipients || []).map((r) => writeMessageToRole(r as Role, msg))
    );

    return NextResponse.json({ ok: true, vaultId, writes });
  } catch (e: any) {
    console.error('[send-multi] ERROR', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
