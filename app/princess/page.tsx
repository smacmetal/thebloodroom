'use client';

import { useEffect, useState } from "react";
import MultiRoleMessageForm from "../components/MultiRoleMessageForm";

type Msg = {
  author: string;
  message: string;
  timestamp: string;
  files?: { name: string; url: string }[];
};

export default function PrincessTemple() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [selectedRole, setSelectedRole] = useState("All");
  const [query, setQuery] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/princess/messages");
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (timestamp: string) => {
    await fetch(`/api/princess/messages?timestamp=${timestamp}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((msg) => msg.timestamp !== timestamp));
  };

  const filtered = messages.filter((msg) => {
    const matchesRole = selectedRole === "All" || msg.author === selectedRole;
    const matchesQuery = msg.message?.toLowerCase().includes(query.toLowerCase());
    return matchesRole && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-pink-400 mb-2 flex items-center gap-2">
        Princess’s Temple <span role="img" aria-label="princess">👧</span>
      </h1>
      <div className="mb-6 text-lg text-pink-200">
        Notes of wonder, joy, and bright curiosity.
      </div>

      <div className="flex gap-2 mb-4">
        {["All", "King", "Queen", "Princess"].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded border ${
              selectedRole === role ? "bg-pink-400 text-black" : "border-pink-400"
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
        className="mt-2 px-3 py-1 border border-pink-400 bg-black text-white rounded w/full mb-4"
      />

      <MultiRoleMessageForm
        author="Princess"
        defaultRecipients={["King", "Queen"]}
        apiUrl="/api/princess/messages"
        onSent={loadMessages}
      />

      <div className="flex items-center justify-between mt-4 mb-2">
        <button className="underline" onClick={() => setShowTimestamps(!showTimestamps)}>
          {showTimestamps ? "Hide Timestamps" : "Show Timestamps"}
        </button>
      </div>

      {filtered.map((msg) => (
        <div key={msg.timestamp} className="border p-3 mb-2 rounded border-pink-400">
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
                          className="max-w-xs rounded border border-pink-400"
                        />
                        <a href={f.url} download className="block text-pink-300 hover:underline mt-1">
                          📎 {f.name}
                        </a>
                      </>
                    ) : isPdf ? (
                      <>
                        <iframe
                          src={f.url}
                          className="w-full max-w-md h-64 rounded border border-pink-400"
                          title={f.name}
                        />
                        <a href={f.url} download className="block text-pink-300 hover:underline mt-1">
                          📎 {f.name}
                        </a>
                      </>
                    ) : (
                      <a href={f.url} className="text-pink-300 hover:underline" download>
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
            className="mt-2 text-sm text-pink-300 underline"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
