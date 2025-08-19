 // C:\Users\steph\thebloodroom\app\components\WallGallery.tsx
'use client';

import { useEffect, useState } from 'react';

type Item = { title: string; url: string; key: string };

function normalize(j: any, limit: number): Item[] {
  // Supports:
  //  - { ok:true, items:[{title,key,url}] }
  //  - { ok:true, files:[ 'url', ... ] }
  //  - [ 'url', ... ]
  if (Array.isArray(j)) {
    return j.slice(0, limit).map((u: string, i: number) => ({ title: 'image', url: u, key: `${u}:${i}` }));
  }
  if (j?.items && Array.isArray(j.items)) return j.items.slice(0, limit);
  if (j?.files && Array.isArray(j.files)) {
    return j.files.slice(0, limit).map((u: string, i: number) => ({ title: 'image', url: u, key: `${u}:${i}` }));
  }
  return [];
}

export default function WallGallery({
  role,
  variant = 'strip',
  limit = 18,
}: {
  role: 'King' | 'Queen' | 'Princess';
  variant?: 'grid' | 'strip';
  limit?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch(`/api/walls/${role}/images`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        const arr = normalize(j, limit);
        if (alive) { setItems(arr); setErr(null); }
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    }
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, [role, limit]);

  if (err) return <div className="text-red-400 text-sm">Wall error: {err}</div>;
  if (!items.length) return <div className="text-gray-400 text-sm">No images on the wall… yet.</div>;

  if (variant === 'strip') {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar pr-1">
        {items.map((it) => (
          <a
            key={it.key}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            title={it.title}
            className="group relative block h-[180px] w-[140px] shrink-0 overflow-hidden rounded-xl border border-white/10"
          >
            <img
              src={it.url}
              alt={it.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <a
          key={it.key}
          href={it.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-xl border border-white/10"
          title={it.title}
        >
          <img
            src={it.url}
            alt={it.title}
            className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

