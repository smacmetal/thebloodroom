 // C:\Users\steph\thebloodroom\app\components\MultiRoleMessageForm.tsx
'use client';

import { useState } from 'react';
import AttachBar from './AttachBar';
import RichTextEditor from './RichTextEditor';

type Role = 'King' | 'Queen' | 'Princess';

function newMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function MultiRoleMessageForm({
  author,
  apiUrl,
  defaultRecipients = [],
  onSent,
}: {
  author: Role;
  apiUrl: string;
  defaultRecipients?: Role[];
  onSent?: () => void;
}) {
  const [html, setHtml] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [recipients, setRecipients] = useState<Role[]>(defaultRecipients as Role[]);
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; path: string }[]>([]);
  const [messageId, setMessageId] = useState<string>(newMessageId());

  function toggleRecipient(r: Role) {
    setRecipients((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  async function send() {
    if (!text.trim() && attachments.length === 0) return;
    setBusy(true);
    try {
      const createdAt = new Date().toISOString();
      const body = {
        author,
        recipients,
        text,    // plain text for search/export
        html,    // rich HTML for rendering
        createdAt,
        attachments,
        meta: { origin: `${author} Temple`, messageId },
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      // reset
      setHtml('');
      setText('');
      setAttachments([]);
      setMessageId(newMessageId());
      onSent?.();
    } catch (e) {
      console.error('[MultiRoleMessageForm] send error', e);
      alert('Send failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 p-4 space-y-3 bg-white/5">
      <div className="text-sm opacity-70">Send from {author}</div>

      <RichTextEditor
        value={html}
        onChange={(h, p) => { setHtml(h); setText(p); }}
        role={author}
        idempotencyKey={messageId}
        onAttached={(att) => setAttachments((a) => [...a, att])}
      />

      {/* recipients */}
      <div className="flex flex-wrap gap-2 text-sm">
        {(['King','Queen','Princess'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => toggleRecipient(r)}
            className={`px-3 py-1 rounded border ${
              recipients.includes(r) ? 'bg-pink-500 text-black' : 'border-white/20 hover:bg-white/10'
            }`}
            type="button"
          >
            {r}
          </button>
        ))}
      </div>

      {/* legacy attach bar still available (optional, complements inline) */}
      <div className="flex items-center gap-3">
        <AttachBar
          role={author}
          idempotencyKey={messageId}
          onAttached={(att) => setAttachments((a) => [...a, att])}
        />
        {attachments.length > 0 && (
          <div className="text-xs opacity-80">
            {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {attachments.map((a, i) => (
            <div key={`${a.path}:${i}`} className="text-xs opacity-80 border border-white/10 rounded px-2 py-1">
              📎 {a.name}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          disabled={busy}
          onClick={send}
          className={`rounded-lg px-4 py-2 font-semibold ${
            busy ? 'opacity-60' : 'bg-pink-500 text-black hover:bg-pink-400'
          }`}
          type="button"
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

