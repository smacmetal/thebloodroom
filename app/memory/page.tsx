 // C:\Users\steph\thebloodroom\app\memory\page.tsx
"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  title?: string;
  text?: string;
  content?: string;
  timestamp: number | string;
};

export default function MemoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchEntries() {
    setError(null);
    try {
      const res = await fetch("/api/memory/entries", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Accept either { entries: [...] } or just [...]
      const list: unknown = Array.isArray(json) ? json : json?.entries;
      if (!Array.isArray(list)) throw new Error("Invalid data format");

      const normalized: Entry[] = list.map((e: any) => ({
        id: String(e.id ?? crypto.randomUUID()),
        title: e.title ?? "",
        text: e.text ?? e.content ?? "",
        timestamp: e.timestamp ?? Date.now(),
      }));

      setEntries(normalized);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
      setEntries([]);
    }
  }

  useEffect(() => { fetchEntries(); }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">Memory Entries</h1>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="border border-pink-500 rounded p-3">
            <div className="text-xs opacity-60">
              {new Date(Number(e.timestamp)).toLocaleString()}
            </div>
            {e.title ? <div className="font-semibold">{e.title}</div> : null}
            <div className="whitespace-pre-wrap">{e.text}</div>
          </div>
        ))}
        {!entries.length && !error ? (
          <div className="opacity-70">No entries yet.</div>
        ) : null}
      </div>
    </main>
  );
}

