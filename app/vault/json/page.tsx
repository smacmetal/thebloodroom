'use client';

import { useEffect, useState } from 'react';

type Entry = { file?: string; path?: string; [k: string]: any };

export default function VaultJsonViewer() {
  const [items, setItems] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/memory/entries?limit=200', { cache: 'no-store' });
        if (!r.ok) { setErr(`HTTP ${r.status}`); return; }
        const j = await r.json();
        setItems(Array.isArray(j.entries) ? j.entries : []);
      } catch (e: any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📂 Vault JSON Viewer</h1>
      {err && <div className="text-red-400">Error: {err}</div>}
      <div className="space-y-2">
        {items.map((it, i) => {
          const id = it.file || it.path || `row-${i}`;
          const isOpen = !!open[id];
          return (
            <div key={id} className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold">{it.title || it.file || 'Untitled'}</div>
                  <div className="opacity-70">{it.date} — {it.category}</div>
                </div>
                <button
                  onClick={() => setOpen(o => ({ ...o, [id]: !o[id] }))}
                  className="rounded px-3 py-1 bg-white/10 hover:bg-white/20"
                >
                  {isOpen ? 'Hide JSON' : 'Show JSON'}
                </button>
              </div>
              {isOpen && (
                <pre className="mt-3 text-xs bg-black/10 p-3 rounded overflow-auto max-h-80">
                  {JSON.stringify(it, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
