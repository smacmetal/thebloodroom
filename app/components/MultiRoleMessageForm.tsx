 'use client';

import { useState } from 'react';

type Props = {
  author: string;                 // e.g., "Queen"
  apiUrl: string;                 // e.g., "/api/queen/messages"
  defaultRecipients?: string[];   // optional
  onSent?: () => void;            // optional
};

export default function MultiRoleMessageForm({
  author,
  apiUrl,
  defaultRecipients = [],
  onSent,
}: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    const bodyText = (message ?? '').trim();
    if (!bodyText) {
      setError('Please enter a message.');
      return;
    }

    const payload = {
      author,                         // always provided
      message: bodyText,              // <- standardize on "message"
      timestamp: new Date().toISOString(),
      recipients: defaultRecipients,  // optional
      files: [],                      // reserved for future attachments
    };

    try {
      setSending(true);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setMessage('');
      onSent?.();
    } catch (e: any) {
      setError(e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border border-pink-500 rounded p-3 space-y-2">
      <label className="block text-sm text-gray-300 mb-1">Send to {apiUrl} API</label>
      <input
        className="w-full px-3 py-2 rounded border border-pink-500 bg-black text-white"
        value={author}
        disabled
      />
      <textarea
        className="w-full h-32 px-3 py-2 rounded border border-pink-500 bg-black text-white"
        placeholder="Write your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {error ? <div className="text-red-400 text-sm">{error}</div> : null}
      <button
        onClick={handleSend}
        disabled={sending}
        className="px-4 py-2 rounded bg-pink-500 text-black font-semibold disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}

