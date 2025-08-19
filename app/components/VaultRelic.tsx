 'use client';

import { useEffect, useMemo, useState } from 'react';

type Chamber = 'queen' | 'princess' | 'king' | 'vault';

type Offering = {
  id: string;
  text: string;
  timestamp: number;
  chamber: Chamber;
};

export default function VaultRelic() {
  const [data, setData] = useState<Offering[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | Chamber>('all');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Load once from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bloodroom-offerings');
    if (saved) {
      try {
        const parsed: Offering[] = JSON.parse(saved);
        setData(Array.isArray(parsed) ? parsed : []);
      } catch {
        setData([]);
      }
    }
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter(o => (filter === 'all' ? true : o.chamber === filter))
      .filter(o => (term ? o.text.toLowerCase().includes(term) : true))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [data, filter, q]);

  const chip = (key: 'all' | Chamber, label: string, className = '') => {
    const active = filter === key;
    return (
      <button
        key={key}
        onClick={() => setFilter(key)}
        className={[
          'rounded-md px-3 py-1 text-sm transition',
          active
            ? 'bg-neutral-900 text-neutral-100 ring-1 ring-neutral-700'
            : 'bg-black/30 text-neutral-300 hover:text-white',
          className,
        ].join(' ')}
      >
        {label}
      </button>
    );
  };

  return (
    <section
      className={[
        'rounded-lg border p-6',
        'border-neutral-800/60',
        'bg-gradient-to-b from-black/70 via-[#0b0b0b]/85 to-[#050505]',
        'shadow-lg shadow-black/40',
      ].join(' ')}
      aria-label="Family Relic — Archive"
    >
      <header
        className={[
          'mb-4 rounded-md border px-4 py-3',
          'border-neutral-800/50 bg-black/40',
          mounted ? 'animate-breath' : '',
        ].join(' ')}
      >
        <h2 className="text-xl font-semibold text-neutral-100">Family Relic — Archive</h2>
        <p className="mt-1 text-sm text-neutral-300">
          The sealed ledger of all offerings. Filter by chamber, or search across the family’s vows.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {chip('all', 'All')}
        {chip('queen', '👑 Queen', 'text-red-200')}
        {chip('princess', '💎 Princess', 'text-pink-200')}
        {chip('king', '🗡️ King', 'text-yellow-200')}
        {chip('vault', '🔒 Vault', 'text-neutral-200')}

        <div className="ml-auto flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search text…"
            className="w-[260px] rounded-md border border-neutral-700 bg-black/40 px-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-4 rounded-md border border-neutral-800/60 bg-black/40">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-sm italic text-neutral-500">
            The archive is quiet. Offer in any chamber—or clear your filters.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-900/70">
            {filtered.map((o) => (
              <li key={o.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-neutral-200">{o.text}</p>
                  <span className="shrink-0 text-[11px] text-neutral-500">
                    {new Date(o.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Chamber:{' '}
                  <span className="uppercase tracking-wide">
                    {o.chamber}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Future index scaffolding */}
      <div className="mt-6 rounded-md border border-neutral-800/60 bg-black/30 p-4">
        <h3 className="text-sm font-semibold text-neutral-200">Catalog &amp; Index</h3>
        <p className="mt-1 text-sm text-neutral-400">
          Scaffolding for fast lookup across relics by author, rite, and timestamp (future).
        </p>
      </div>
    </section>
  );
}

