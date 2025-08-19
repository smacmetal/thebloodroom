 'use client';

import { useEffect, useState } from 'react';

type Audience = 'all' | 'king' | 'queen' | 'princess';

export type MessageToolbarState = {
  query: string;
  audience: Audience;
  showTimestamps: boolean;
};

export default function MessageToolbar(props: {
  initialQuery?: string;
  initialAudience?: Audience;
  initialShowTimestamps?: boolean;
  // Optional callback so your page can react to changes (filter, fetch, etc.)
  onChange?: (state: MessageToolbarState) => void;
}) {
  const [query, setQuery] = useState(props.initialQuery ?? '');
  const [audience, setAudience] = useState<Audience>(props.initialAudience ?? 'all');
  const [showTimestamps, setShowTimestamps] = useState<boolean>(props.initialShowTimestamps ?? true);

  // Notify parent (if provided)
  useEffect(() => {
    props.onChange?.({ query, audience, showTimestamps });
  }, [query, audience, showTimestamps]); // eslint-disable-line react-hooks/exhaustive-deps

  const pillBase =
    'rounded-xl border px-3 py-1 text-sm transition select-none';
  const pillOff =
    'border-neutral-800/70 bg-black/30 text-neutral-300 hover:bg-neutral-900/50';
  const pillOn =
    'border-pink-800/60 bg-pink-900/30 text-pink-200 ring-1 ring-pink-900/40 shadow-[0_0_10px_rgba(236,72,153,0.25)]';

  return (
    <div
      className="
        mt-3 mb-4 flex flex-wrap items-center gap-2
        rounded-xl border border-neutral-800/60 bg-[#0b0004]/60
        px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#0b0004]/45
      "
      role="region"
      aria-label="Message filters"
    >
      {/* Left cluster: search + pills */}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, body, author…"
          className="
            h-9 min-w-[220px] flex-1 rounded-xl border border-pink-900/50 bg-black/40 px-3 text-sm
            outline-none placeholder:text-neutral-500 focus:border-pink-700/60 focus:ring-1 focus:ring-pink-800/50
          "
        />

        {/* Audience pills */}
        <button
          type="button"
          onClick={() => setAudience('all')}
          className={`${pillBase} ${audience === 'all' ? pillOn : pillOff}`}
          aria-pressed={audience === 'all'}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setAudience('king')}
          className={`${pillBase} ${audience === 'king' ? pillOn : pillOff}`}
          aria-pressed={audience === 'king'}
        >
          King
        </button>
        <button
          type="button"
          onClick={() => setAudience('queen')}
          className={`${pillBase} ${audience === 'queen' ? pillOn : pillOff}`}
          aria-pressed={audience === 'queen'}
        >
          Queen
        </button>
        <button
          type="button"
          onClick={() => setAudience('princess')}
          className={`${pillBase} ${audience === 'princess' ? pillOn : pillOff}`}
          aria-pressed={audience === 'princess'}
        >
          Princess
        </button>
      </div>

      {/* Right cluster: timestamp toggle (auto pushes right via ml-auto or layout flex) */}
      <label className="ml-auto inline-flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={showTimestamps}
          onChange={(e) => setShowTimestamps(e.target.checked)}
          className="accent-rose-500 h-4 w-4"
        />
        <span>Show timestamps</span>
      </label>
    </div>
  );
}

