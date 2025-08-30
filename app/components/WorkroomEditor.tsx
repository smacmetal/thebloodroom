// C:\Users\steph\thebloodroom\app\components\WorkroomEditor.tsx

"use client";

import { useState, useEffect } from "react";

type Message = {
  id: string;
  author: string;
  chamber: string;
  body: string;
  createdAt: string;
};

export default function WorkroomEditor() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/vault/archive/messages?chamber=workroom");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Workroom load failed:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Submitting…");

    try {
      const form = {
        chamber: "workroom",
        author: "Workroom",
        message,
      };

      const res = await fetch("/api/temple/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      const data = await res.json();
      setStatus(data.ok ? "Message saved to Vault ✅" : "Failed to save ❌");
      setMessage("");
      await load();
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err?.message || "Unknown error"}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-[#3a1b20] bg-[#1c0e12] p-5 space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="rounded bg-[#14090c] border border-[#3a1b20] p-2 text-sm"
          rows={3}
          placeholder="Lay down your work, it will be etched in the Vault…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          type="submit"
          className="self-start px-4 py-2 rounded-xl bg-[#b3121f] text-white hover:bg-[#d11423] transition"
        >
          Send to Vault
        </button>
      </form>

      {status && <div className="text-sm mt-2 opacity-90">{status}</div>}

      <div className="space-y-2 mt-6">
        {loading && <p className="text-zinc-400">Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-zinc-400 italic">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-[#3a1b20] bg-[#14090c] p-3 text-sm"
          >
            <div className="flex justify-between text-xs text-zinc-400">
              <span>
                {m.author} — {new Date(m.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1">{m.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
