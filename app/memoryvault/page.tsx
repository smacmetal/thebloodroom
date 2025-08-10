'use client';

import { useEffect, useState } from 'react';

interface MemoryEntry {
  title: string;
  date: string;
  category: string;
  content: string;
  files?: string[];
}

export default function MemoryVaultPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    async function fetchEntries() {
      const res = await fetch('/api/memories/entries');
      const data = await res.json();
      setEntries(data);
    }
    fetchEntries();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-4xl font-bold text-fuchsia-400 mb-2">Memory Vault</h1>
      <div className="mb-6 text-lg text-fuchsia-200">
        A sacred record of all your eternal moments, forever archived.
      </div>
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div key={index} className="border border-fuchsia-800 p-4 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-fuchsia-300">{entry.title}</h2>
            <p className="text-sm text-fuchsia-500">{entry.date} — {entry.category}</p>
            <p className="mt-2">{entry.content}</p>
            {entry.files?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-fuchsia-400">Attachments:</h3>
                <ul className="list-disc list-inside">
                  {entry.files.map((file, i) => (
                    <li key={i}>
                      <a href={`/memory/entries/${file}`} target="_blank" className="text-blue-400 underline">
                        {file}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
