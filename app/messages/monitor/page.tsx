'use client';

import { useEffect, useMemo, useState } from 'react';

type Entry = { title?: string; category?: string; date?: string };

export default function MessagingMonitor() {
  const [items, setItems] = useState<Entry[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const r = await fetch('/api/memory/entries?limit=200', { cache: 'no-store' });
        const j = await r.json();
        if (!alive) return;
        const arr = Array.isArray(j.entries) ? j.entries : [];
        setItems(arr);
      } catch {}
    }
    load();
    const id = setInterval(() => { setTick(t => t+1); load(); }, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const stats = useMemo(() => {
    const byCat: Record<string, number> = {};
    for (const it of items) {
      const c = (it.category || 'other').toLowerCase();
      byCat[c] = (byCat[c] || 0) + 1;
    }
    return byCat;
  }, [items, tick]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📡 Messaging Monitor</h1>
      <p className="text-sm opacity-80">Auto-refreshing every 5s from Vault entries.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(stats).map(([cat, n]) => (
          <div key={cat} className="rounded-xl border border-gray-700 p-4">
            <div className="text-xs uppercase opacity-60">{cat}</div>
            <div className="text-2xl font-bold">{n}</div>
          </div>
        ))}
      </div>

      <div className="text-sm opacity-60">Total entries: {items.length}</div>
    </div>
  );
}
