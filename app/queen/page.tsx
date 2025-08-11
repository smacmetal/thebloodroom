'use client';

import { useEffect, useState } from "react";
import MultiRoleMessageForm from "../components/MultiRoleMessageForm";

type Msg = {
  author: string;
  message: string;
  timestamp: string;
  files?: { name: string; url: string }[];
};

export default function QueenTemple() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [selectedRole, setSelectedRole] = useState("All");
  const [query, setQuery] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/queen/messages");
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (timestamp: string) => {
    await fetch(`/api/queen/messages?timestamp=${timestamp}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((msg) => msg.timestamp !== timestamp));
  };

  const filtered = messages.filter((msg) => {
    const matchesRole = selectedRole === "All" || msg.author === selectedRole;
    const matchesQuery = msg.message?.toLowerCase().includes(query.toLowerCase());
    return matchesRole && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-pink-500 mb-2 flex items-center gap-2">
        Queen’s Temple <span role="img" aria-label="queen">👸</span>
      </h1>
      <div className="mb-6 text-lg text-pink-200">
        Messages of sovereignty, tenderness, and command.
      </div>

      <div className="flex gap-2 mb-4">
        {["All", "King", "Queen", "Princess"].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded border ${
              selectedRole === role ? "bg-pink-500 text-black" : "border-pink-500"
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
        className="mt-2 px-3 py-1 border border-pink-500 bg-black text-white rounded w/full mb-4"
      />

      <MultiRoleMessageForm
        author="Queen"
        defaultRecipients={["King", "Princess"]}
        apiUrl="/api/queen/messages"
        onSent={loadMessages}
      />

      <div className="flex items-center justify-between mt-4 mb-2">
        <button className="underline" onClick={() => setShowTimestamps(!showTimestamps)}>
          {showTimestamps ? "Hide Timestamps" : "Show Timestamps"}
        </button>
      </div>

      {filtered.map((msg) => (
        <div key={msg.timestamp} className="border p-3 mb-2 rounded border-pink-500">
          {showTimestamps && (
            <div className="text-xs text-gray-400 mb-1">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          )}
          <p>
            <strong>{msg.author}:</strong> {msg.message}
          </p>

          {msg.files?.length ? (
            <div className="mt-2 space-y-2">
              {msg.files.map((f) => {
                const isImage = /\.(png|jpe?g|gif|webp|avif)$/i.test(f.name);
                const isPdf = /\.pdf$/i.test(f.name);
                return (
                  <div key={f.name}>
                    {isImage ? (
                      <>
                        <img
                          src={f.url}
                          alt={f.name}
                          className="max-w-xs rounded border border-pink-500"
                        />
                        <a href={f.url} download className="block text-pink-400 hover:underline mt-1">
                          📎 {f.name}
                        </a>
                      </>
                    ) : isPdf ? (
                      <>
                        <iframe
                          src={f.url}
                          className="w-full max-w-md h-64 rounded border border-pink-500"
                          title={f.name}
                        />
                        <a href={f.url} download className="block text-pink-400 hover:underline mt-1">
                          📎 {f.name}
                        </a>
                      </>
                    ) : (
                      <a href={f.url} className="text-pink-400 hover:underline" download>
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
            className="mt-2 text-sm text-pink-400 underline"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
