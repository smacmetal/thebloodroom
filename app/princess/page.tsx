'use client';

import { useEffect, useState } from "react";
import MultiRoleMessageForm from "../components/MultiRoleMessageForm";

export default function PrincessTemple() {
  const [messages, setMessages] = useState<any[]>([]);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [selectedRole, setSelectedRole] = useState("All");
  const [query, setQuery] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/princess/messages");
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (timestamp: string) => {
    await fetch(`/api/princess/messages?timestamp=${timestamp}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((msg) => msg.timestamp !== timestamp));
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesRole = selectedRole === "All" || msg.author === selectedRole;
    const matchesQuery = msg.message?.toLowerCase().includes(query.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const handleDownload = () => {
    const text = filteredMessages
      .map((msg) => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.author}: ${msg.message}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "princess-temple-messages.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-purple-400 mb-2 flex items-center gap-2">
        Princess’s Temple <span role="img" aria-label="princess-shoes">👡</span>
      </h1>
      <div className="mb-6 text-lg text-purple-200">
        Messages of joy, innocence, and bright devotion.
      </div>

      {/* Role filter pills */}
      <div className="flex gap-2 mb-4">
        {["All", "King", "Queen", "Princess"].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1 rounded border ${
              selectedRole === role ? "bg-purple-400 text-black" : "border-purple-400"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search messages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-2 px-3 py-1 border border-purple-400 bg-black text-white rounded w/full mb-4"
      />

      {/* Multi-role sender with attachments */}
      <MultiRoleMessageForm
        author="Princess"
        defaultRecipients={["King", "Queen"]}
        onSent={loadMessages}
      />

      <div className="flex items-center justify-between mt-4 mb-2">
        <button className="underline" onClick={() => setShowTimestamps(!showTimestamps)}>
          {showTimestamps ? "Hide Timestamps" : "Show Timestamps"}
        </button>
        <button className="underline" onClick={handleDownload}>
          ⬇️ Download All Messages as Text
        </button>
      </div>

      {/* Message list */}
      {filteredMessages.map((msg, index) => (
        <div key={index} className="border p-3 mb-2 rounded border-purple-400">
          {showTimestamps && (
            <div className="text-xs text-gray-400 mb-1">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          )}
          <p>
            <strong>{msg.author}:</strong> {msg.message}
          </p>

          {/* Attachments with image previews */}
          {msg.files?.length > 0 && (
            <div className="mt-2 space-y-2">
              {msg.files.map((f: any, i: number) => {
                const isImage = /\.(png|jpe?g|gif|webp)$/i.test(f.name);
                return isImage ? (
                  <div key={i}>
                    <img
                      src={f.url}
                      alt={f.name}
                      className="max-w-xs rounded border border-purple-400"
                    />
                    <a href={f.url} download className="block text-purple-300 hover:underline mt-1">
                      📎 {f.name}
                    </a>
                  </div>
                ) : (
                  <a key={i} href={f.url} className="text-purple-300 hover:underline" download>
                    📎 {f.name}
                  </a>
                );
              })}
            </div>
          )}

          <button
            onClick={() => handleDelete(msg.timestamp)}
            className="mt-2 text-sm text-purple-300 underline"
          >
            Delete
          </button>
        </div>
      ))}
    </main>
  );
}
