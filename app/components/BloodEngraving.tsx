 'use client';

import { useEffect, useState, useCallback } from 'react';

type Engraving = {
  title: string;
  date: string;
  images: { left: string; right: string };
  chant: string;
  caption?: string;
};

const PLACEHOLDER = '/images/placeholder.svg';

export default function BloodEngraving() {
  const [data, setData] = useState<Engraving | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  // editor state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [chant, setChant] = useState('');
  const [caption, setCaption] = useState('');

  // --- fetch engraving -----------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/bloodroom/engraving', { cache: 'no-store' });
        const json = await res.json();
        const e: Engraving = json.engraving ?? json; // support both shapes
        setData(e);
        // seed editor fields
        setTitle(e.title || '');
        setDate(e.date || '');
        setLeft(e.images?.left || '');
        setRight(e.images?.right || '');
        setChant(e.chant || '');
        setCaption(e.caption || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- sanctum commands ----------------------------------------
  const send = useCallback(async (payload: any) => {
    await fetch('/api/sanctum/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }, []);

  const onChantHover = () => send({ type: 'heartbeat', speed: 'quick' });
  const onChantClick = async () => {
    await send({ type: 'flare', room: 'Bloodroom' });
    await send({ type: 'chant', room: 'Bloodroom', voices: 'Braided' });
  };
  const onChantMouseDown = () => send({ type: 'touch', room: 'Bloodroom', duration: 1800 });

  // --- editor actions ------------------------------------------
  async function save() {
    const res = await fetch('/api/bloodroom/engraving', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, date,
        images: { left, right },
        chant, caption
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      alert(`Save failed: ${res.status} ${t}`);
      return;
    }
    const j = await res.json();
    setData(j.engraving);
    setEdit(false);
    // lil celebratory flare
    await send({ type: 'flare', room: 'Bloodroom' });
  }

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch('/api/bloodroom/engraving', { cache: 'no-store' });
      const json = await res.json();
      const e: Engraving = json.engraving ?? json;
      setData(e);
      setTitle(e.title || ''); setDate(e.date || '');
      setLeft(e.images?.left || ''); setRight(e.images?.right || '');
      setChant(e.chant || ''); setCaption(e.caption || '');
    } finally { setLoading(false); }
  }

  function copyChant() {
    const text = `${title || data?.title || ''}\n\n${chant || data?.chant || ''}`.trim();
    navigator.clipboard.writeText(text).then(
      () => alert('Chant copied.'),
      () => alert('Copy failed.')
    );
  }

  async function downloadJson() {
    try {
      const res = await fetch('/api/bloodroom/engraving', { cache: 'no-store' });
      const j = await res.json();
      const blob = new Blob([JSON.stringify(j.engraving ?? j, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'engraving.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Download failed.');
    }
  }

  function openImages() {
    const L = left || data?.images.left || PLACEHOLDER;
    const R = right || data?.images.right || PLACEHOLDER;
    window.open(L, '_blank'); window.open(R, '_blank');
  }

  if (loading) return <div className="text-center py-10 text-rose-300">Engraving loading…</div>;
  if (!data) return <div className="text-center py-10 text-rose-300">Engraving unavailable.</div>;

  return (
    <section className="relative text-rose-200">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={copyChant} className="rounded-lg border border-rose-700/70 px-3 py-1.5 text-sm hover:bg-rose-700/10">
          Copy Chant
        </button>
        <button onClick={downloadJson} className="rounded-lg border border-rose-700/70 px-3 py-1.5 text-sm hover:bg-rose-700/10">
          Download JSON
        </button>
        <button onClick={openImages} className="rounded-lg border border-rose-700/70 px-3 py-1.5 text-sm hover:bg-rose-700/10">
          Open Images
        </button>
        <button onClick={() => setEdit(v => !v)} className="ml-auto rounded-lg border border-rose-700 px-3 py-1.5 text-sm hover:bg-rose-700/10">
          {edit ? 'Close Edit' : 'Edit'}
        </button>
      </div>

      {/* Images + Title/Chant */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left */}
        <div className="rounded-2xl overflow-hidden border border-rose-700/60 shadow-lg shadow-rose-900/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.images.left || PLACEHOLDER}
            alt="Evy-May"
            className="w-full h-[320px] object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>

        {/* Center */}
        <div className="text-center px-2">
          <div className="text-2xl md:text-3xl font-extrabold tracking-wide mb-1 etched">{data.title}</div>
          <div className="text-xs opacity-60 mb-4">
            {(() => { try { return new Date(data.date).toLocaleString(); } catch { return data.date; } })()}
          </div>

          <div
            onMouseEnter={onChantHover}
            onMouseDown={onChantMouseDown}
            onClick={onChantClick}
            className="mx-auto max-w-xl whitespace-pre-wrap leading-relaxed text-[15px] md:text-lg cursor-pointer etched"
          >
            {data.chant}
          </div>

          {data.caption && <div className="text-xs opacity-60 mt-3">{data.caption}</div>}
        </div>

        {/* Right */}
        <div className="rounded-2xl overflow-hidden border border-rose-700/60 shadow-lg shadow-rose-900/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.images.right || PLACEHOLDER}
            alt="Lyra"
            className="w-full h-[320px] object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-rose-600/40 to-transparent" />

      {/* Editor */}
      {edit && (
        <div className="rounded-2xl border border-rose-700/40 p-4 bg-black/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                     className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date (ISO or text)</label>
              <input value={date} onChange={e => setDate(e.target.value)}
                     className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm mb-1">Left image (Evy-May)</label>
              <input value={left} onChange={e => setLeft(e.target.value)}
                     placeholder="/images/evy.jpg or https://…" 
                     className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm mb-1">Right image (Lyra)</label>
              <input value={right} onChange={e => setRight(e.target.value)}
                     placeholder="/images/lyra.jpg or https://…"
                     className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Chant (multiline)</label>
              <textarea rows={6} value={chant} onChange={e => setChant(e.target.value)}
                        className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Caption (optional)</label>
              <input value={caption} onChange={e => setCaption(e.target.value)}
                     className="w-full rounded-lg border border-rose-700 bg-black/60 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500" />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button onClick={save} className="rounded-xl bg-rose-600 px-4 py-2 font-semibold hover:bg-rose-500">
                Save Engraving
              </button>
              <button onClick={reload} className="rounded-xl border border-rose-700 px-3 py-2 hover:bg-rose-700/10">
                Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

