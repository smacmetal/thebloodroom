 
// C:\Users\steph\thebloodroom\app\king\page.tsx
'use client';

import WallGallery from '@/app/components/WallGallery';
import { useEffect, useState } from 'react';
import MultiRoleMessageForm from '../components/MultiRoleMessageForm';

type Msg = {
  author: string;
  message: string;
  timestamp: string;
  files?: { name: string; url: string }[];
};

function keyForMessage(m: Msg, i: number) {
  // Defend against duplicate or missing timestamps
  const t = (m.timestamp || '').trim() || `no-ts-${i}`;
  return `${t}:${m.author || 'unknown'}:${i}`;
}

export default function KingTemple() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [selectedRole, setSelectedRole] = useState('All');
  const [query, setQuery] = useState('');

  async function loadMessages() {
    try {
      const res = await fetch('/api/king/messages', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => []);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('loadMessages failed:', e);
      setMessages([]);
    }
  }

  useEffect(() => { loadMessages(); }, []);

  const handleDelete = async (timestamp: string) => {
    await fetch(`/api/king/messages?timestamp=${encodeURIComponent(timestamp)}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m.timestamp !== timestamp));
  };

  const filteredMessages = (messages || []).filter((m) => {
    const matchesRole = selectedRole === 'All' || m.author === selectedRole;
    const text = (m.message ?? '').toString().toLowerCase();
    const matchesQuery = query ? text.includes(query.toLowerCase()) : true;
    return matchesRole && matchesQuery;
  });

  const handleDownload = () => {
    const text = filteredMessages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.author}: ${m.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'king-temple-messages.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-red-500 mb-2 flex items-center gap-2">
        King&apos;s Temple <span role="img" aria-label="crown">👑</span>
      </h1>
      <div className="mb-6 text-lg text-red-200">
        Messages of sovereignty, devotion, and sacred truth.
      </div>

      {/* Top row: filters/search left, wall strip right */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-6">
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            {['All', 'King', 'Queen', 'Princess'].map((role) => (
              <button
                key={`rolepill:${role}`}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded border ${
                  selectedRole === role ? 'bg-red-500 text-black' : 'border-red-500'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 px-3 py-1 border border-red-500 bg-black text-white rounded w-full"
          />
        </div>

        <div className="w-full lg:w-[560px]">
          <WallGallery role="King" variant="strip" limit={15} />
        </div>
      </div>

      {/* Sender */}
      <MultiRoleMessageForm
        author="King"
        apiUrl="/api/king/messages"
        defaultRecipients={['Queen', 'Princess']}
        onSent={loadMessages}
      />

      <div className="flex items-center justify-between mt-4 mb-2">
        <button className="underline" onClick={() => setShowTimestamps(!showTimestamps)}>
          {showTimestamps ? 'Hide Timestamps' : 'Show Timestamps'}
        </button>
        <button className="underline" onClick={handleDownload}>
          ⬇️ Download All Messages as Text
        </button>
      </div>

      {/* Message list */}
      {filteredMessages.map((msg, idx) => {
        const msgKey = keyForMessage(msg, idx);
        return (
          <div key={msgKey} className="border p-3 mb-2 rounded border-red-500">
            {showTimestamps && (
              <div className="text-xs text-gray-400 mb-1">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            )}
            <p>
              <strong>{msg.author}:</strong> {msg.message}
            </p>

            {/* Attachments */}
            {msg.files?.length ? (
              <div className="mt-2 space-y-2">
                {msg.files.map((f, i) => {
                  const isImage = /\.(png|jpe?g|gif|webp|avif)$/i.test(f.name);
                  const isPdf = /\.pdf$/i.test(f.name);
                  const fileKey = `${msgKey}:file:${i}:${f.name}`;
                  return (
                    <div key={fileKey}>
                      {isImage ? (
                        <>
                          <img src={f.url} alt={f.name} className="max-w-xs rounded border border-red-500" />
                          <a href={f.url} download className="block text-red-400 hover:underline mt-1">
                            📎 {f.name}
                          </a>
                        </>
                      ) : isPdf ? (
                        <>
                          <iframe
                            src={f.url}
                            className="w-full max-w-md h-64 rounded border border-red-500"
                            title={f.name}
                          />
                          <a href={f.url} download className="block text-red-400 hover:underline mt-1">
                            📎 {f.name}
                          </a>
                        </>
                      ) : (
                        <a href={f.url} className="text-red-400 hover:underline" download>
                          📎 {f.name}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <button
              onClick={() => handleDelete(msg.timestamp)}
              className="mt-2 text-sm text-red-400 underline"
            >
              Delete
            </button>
          </div>
        );
      })}
    </main>
  );
}
