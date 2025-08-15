 'use client';

import { useEffect, useMemo, useState } from 'react';

type Msg = {
  id: string;
  author: string;
  title: string;
  body: string;
  timestamp: string; // ISO
  files: string[];
  recipients: string[];
};

export default function KingTemplePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All'|'King'|'Queen'|'Princess'>('All');
  const [showTimestamps, setShowTimestamps] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/king/messages', { cache: 'no-store' });
      if (!res.ok) throw new Error(`GET failed ${res.status}`);
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(m => {
      const roleOk = roleFilter === 'All' ? true : m.author === roleFilter;
      const qOk =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.body?.toLowerCase().includes(q) ||
        m.author?.toLowerCase().includes(q);
      return roleOk && qOk;
    });
  }, [messages, query, roleFilter]);

  const sendMessage = async () => {
    const payload = {
      author: 'King',
      title: title.trim(),
      body: body.trim(),
      recipients: ['King'],
    };
    if (!payload.title && !payload.body) return;

    const res = await fetch('/api/king/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Send failed: ${res.status} ${txt}`);
      return;
    }
    setTitle('');
    setBody('');
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    const ok = confirm('Delete this message?');
    if (!ok) return;
    const res = await fetch(`/api/king/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Delete failed: ${res.status} ${txt}`);
      return;
    }
    fetchMessages();
  };

  const downloadMessage = (m: Msg) => {
    const blob = new Blob([JSON.stringify(m, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${m.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-black text-pink-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">King Messages</h1>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, body, author…"
              className="w-full rounded-xl border border-pink-500 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2">
            {(['All','King','Queen','Princess'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                  roleFilter === r
                    ? 'border-pink-500 bg-pink-600/20'
                    : 'border-pink-500/40 hover:border-pink-500/80'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="accent-pink-500"
            />
            <span className="text-sm">Show timestamps</span>
          </label>
        </div>

        {/* Compose */}
        <div className="rounded-xl border border-pink-600 p-4 mb-8">
          <label className="block text-sm mb-2">Send to King</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-pink-600 bg-black/60 px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-pink-500"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            rows={6}
            className="w-full rounded-lg border border-pink-600 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={sendMessage}
              className="rounded-xl bg-pink-600 px-4 py-2 font-semibold hover:bg-pink-500"
            >
              Send
            </button>
            <button
              onClick={fetchMessages}
              className="rounded-xl border border-pink-600 px-3 py-2 hover:bg-pink-600/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          {loading && <div className="text-sm opacity-70">Loading…</div>}
          {error && <div className="text-sm text-red-400">Error: {error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-sm opacity-70">No messages found.</div>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="rounded-xl border border-pink-600/70 p-4 bg-black/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">
                  {m.title || '(no title)'} <span className="opacity-70 text-sm">— {m.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadMessage(m)}
                    className="rounded-lg border border-pink-600 px-2 py-1 text-xs hover:bg-pink-600/10"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="rounded-lg border border-pink-600 px-2 py-1 text-xs hover:bg-pink-600/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {showTimestamps && (
                <div className="text-xs opacity-60 mt-1">
                  {new Date(m.timestamp).toLocaleString()}
                </div>
              )}
              <div className="mt-3 whitespace-pre-wrap leading-relaxed">{m.body}</div>
              {m.recipients?.length > 0 && (
                <div className="mt-2 text-xs opacity-70">To: {m.recipients.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

