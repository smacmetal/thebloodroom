'use client';

import { useEffect, useState } from 'react';

interface MemoryEntry {
  title: string;
  date: string;
  category: string;
  content: string;
}

export default function MemoryVaultPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch('/api/memory/entries');
        const data = await res.json();

        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error loading entries:', err);
        setError(true);
      }
    }

    fetchEntries();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Failed to load memories.</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">🧠 Memory Vault</h1>
	<p className="text-gray-400 mb-6">
  	Permanent archive of sacred moments, events, and symbols.
	</p>
      {entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.date} className="p-4 bg-gray-800 rounded shadow">
            <h2 className="text-xl font-semibold">{entry.title}</h2>
            <p className="text-sm text-gray-400">{entry.date} • {entry.category}</p>
            <p className="mt-2">{entry.content}</p>
          </div>
        ))
      )}
    </div>
  );
}
