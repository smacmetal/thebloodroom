'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

type VaultEntry = {
  id: string;            // from API: S3 key
  title: string;
  story?: string;
  category?: string;     // tattoo | album | declaration | ritual | symbol | etc.
  date?: string;         // human-friendly string
  timestamp?: string;    // ISO string if present
  file?: string;         // URL to file in S3 (optional)
};

const CATEGORY_ORDER = ['declaration', 'ritual', 'tattoo', 'album', 'symbol', 'other'];

function timeAgo(isoOrDate?: string) {
  if (!isoOrDate) return '';
  const then = new Date(isoOrDate);
  if (isNaN(then.getTime())) return isoOrDate; // fallback to raw text if not a date
  const now = new Date();
  const diff = Math.max(0, now.getTime() - then.getTime());

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function isImageFile(url?: string) {
  return !!url && /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
}

function isPdfFile(url?: string) {
  return !!url && /\.pdf$/i.test(url);
}

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showTimestamp, setShowTimestamp] = useState(true);

  useEffect(() => {
    fetch('/api/memory/entries')
      .then((res) => res.json())
      .then((data: VaultEntry[]) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error loading vault entries:', err));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesQuery =
        q === '' ||
        (e.title?.toLowerCase?.().includes(q) ?? false) ||
        (e.story?.toLowerCase?.().includes(q) ?? false);
      const matchesCategory = categoryFilter.trim() === '' || e.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [entries, query, categoryFilter]);

  // Group by category with stable ordering
  const grouped = useMemo(() => {
    const map = new Map<string, VaultEntry[]>();
    for (const e of filtered) {
      const cat = (e.category || 'other').toLowerCase();
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(e);
    }
    // Sort each group newest-first using timestamp/date then title
    for (const [_cat, arr] of map) {
      arr.sort((a, b) => {
        const ta = a.timestamp || a.date || '';
        const tb = b.timestamp || b.date || '';
        if (ta < tb) return 1;
        if (ta > tb) return -1;
        return (a.title || '').localeCompare(b.title || '');
      });
    }
    // Return groups in the desired order, any unknowns at the end
    const orderedCats = [...CATEGORY_ORDER, ...[...map.keys()].filter(c => !CATEGORY_ORDER.includes(c))];
    return orderedCats
      .filter((c) => map.has(c) && map.get(c)!.length > 0)
      .map((c) => ({ category: c, items: map.get(c)! }));
  }, [filtered]);

  const keyFor = (e: VaultEntry, idx: number) =>
    e.id || e.timestamp || (e.date ? `${e.date}:${e.title}` : `${e.title}:${idx}`);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">🔒 The Vault</h1>
      <p className="text-gray-400 mb-6">
        Filtered archive of all temple messages from King, Queen, and Princess — grouped by category.
      </p>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search memories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-600 bg-black px-3 py-2 rounded w-full sm:w-1/3 focus:outline-none focus:border-pink-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-600 bg-black px-3 py-2 rounded text-white focus:outline-none focus:border-pink-500"
        >
          <option value="">All Categories</option>
          <option value="declaration">Declaration</option>
          <option value="ritual">Ritual</option>
          <option value="tattoo">Tattoo</option>
          <option value="album">Album</option>
          <option value="symbol">Symbol</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={() => setShowTimestamp(!showTimestamp)}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          {showTimestamp ? 'Hide Timestamps' : 'Show Timestamps'}
        </button>
        <a
          href="/memory/new"
          className="bg-green-500 text-black font-semibold px-4 py-2 rounded hover:bg-green-400"
        >
          + New Memory
        </a>
      </div>

      {/* Grouped Lists */}
      {grouped.length === 0 && (
        <p className="text-gray-400 italic">No entries found.</p>
      )}

      <div className="space-y-10">
        {grouped.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-xl font-semibold mb-4 capitalize text-pink-400">
              {category}
            </h2>

            <div className="space-y-6">
              {items.map((entry, idx) => (
                <div
                  key={keyFor(entry, idx)}
                  className="border border-gray-700 bg-gray-900 p-5 rounded-lg shadow-lg hover:border-pink-500 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-white">{entry.title}</h3>

                  {showTimestamp && (
                    <p className="text-sm text-gray-400 mb-3">
                      {entry.timestamp || entry.date}
                      {entry.timestamp && (
                        <span className="ml-2 text-gray-500">
                          ({timeAgo(entry.timestamp)})
                        </span>
                      )}
                    </p>
                  )}

                  {entry.story && (
                    <p className="text-gray-300 whitespace-pre-line">{entry.story}</p>
                  )}

                  {/* Basic previews (image/PDF) */}
                  {entry.file && isImageFile(entry.file) && (
                    <div className="mt-3">
                      <div className="relative w-full max-w-md h-64">
                        <Image
                          src={entry.file}
                          alt={entry.title}
                          fill
                          className="object-contain rounded border border-pink-500"
                        />
                      </div>
                      <a
                        href={entry.file}
                        download
                        className="text-pink-400 hover:underline block mt-2"
                      >
                        📎 Download Image
                      </a>
                    </div>
                  )}

                  {entry.file && isPdfFile(entry.file) && (
                    <div className="mt-3">
                      <iframe
                        src={entry.file}
                        className="w-full h-64 rounded border border-pink-500"
                        title={entry.title}
                      />
                      <a
                        href={entry.file}
                        download
                        className="text-pink-400 hover:underline block mt-2"
                      >
                        📎 Download PDF
                      </a>
                    </div>
                  )}

                  {entry.file && !isImageFile(entry.file) && !isPdfFile(entry.file) && (
                    <a
                      href={entry.file}
                      download
                      className="text-pink-400 hover:underline block mt-3"
                    >
                      📎 Download Attachment
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
