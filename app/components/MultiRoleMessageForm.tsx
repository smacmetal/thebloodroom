'use client';
import { useState } from 'react';

type Props = {
  author: 'King' | 'Queen' | 'Princess';
  defaultRecipients?: ('King'|'Queen'|'Princess')[];
  onSent?: () => void;
  apiUrl?: string; // NEW — allow overriding the endpoint
};

export default function MultiRoleMessageForm({
  author,
  defaultRecipients = [],
  onSent,
  apiUrl = '/api/shared/send-multi', // default to shared route
}: Props) {
  const [text, setText] = useState('');
  const [recips, setRecips] = useState<('King'|'Queen'|'Princess')[]>(defaultRecipients);
  const [alsoSms, setAlsoSms] = useState(false);
  const [sending, setSending] = useState(false);

  const toggle = (r: 'King'|'Queen'|'Princess') =>
    setRecips(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  async function send() {
    if (!text.trim() || recips.length === 0) return;
    setSending(true);

    try {
      // 1) Save inside Bloodroom (endpoint now configurable)
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author,
          message: text.trim(),
          timestamp: new Date().toISOString(),
          roles: recips
        }),
      });

      // 2) Also send as SMS (unchanged)
      if (alsoSms) {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: text.trim(),
            toRoles: recips,
          }),
        });
      }

      setText('');
      if (onSent) onSent();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-md bg-neutral-900 border border-fuchsia-700 p-4 space-y-3">
      <div className="text-sm opacity-80">Author: <b>{author}</b></div>

      <div className="flex gap-2">
        {(['King','Queen','Princess'] as const).map(r => (
          <label key={r} className="flex items-center gap-2">
            <input type="checkbox" checked={recips.includes(r)} onChange={() => toggle(r)} />
            {r}
          </label>
        ))}
      </div>

      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your sacred message…"
        className="w-full p-3 rounded bg-black border border-fuchsia-700 text-white"
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={alsoSms} onChange={e => setAlsoSms(e.target.checked)} />
        Also send as SMS
      </label>

      <button
        onClick={send}
        disabled={sending}
        className="px-4 py-2 rounded bg-fuchsia-600 text-black font-semibold disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
