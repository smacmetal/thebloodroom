 'use client';

import { useEffect, useState } from 'react';

type Mode = 'steady' | 'quick' | 'lapse';
type RitualState = 'sanctified' | 'sealed' | 'unbound';

export default function TrinityKey() {
  const [dim, setDim] = useState<number>(0);
  const [pulse, setPulse] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>('steady');
  const [ritual, setRitual] = useState<RitualState>('unbound');

  // Restore settings
  useEffect(() => {
    const d = localStorage.getItem('bloodroom:dim');
    const p = localStorage.getItem('bloodroom:pulse');
    const m = localStorage.getItem('bloodroom:mode') as Mode | null;
    const r = localStorage.getItem('bloodroom:ritual') as RitualState | null;

    if (d) setDim(parseFloat(d));
    if (p) setPulse(p === '1');
    if (m) setMode(m);
    if (r) setRitual(r);
  }, []);

  // Sync to DOM + persist
  useEffect(() => {
    document.documentElement.style.setProperty('--room-dim', String(dim));
    localStorage.setItem('bloodroom:dim', String(dim));
  }, [dim]);

  useEffect(() => {
    const key = document.querySelector<HTMLDivElement>('.trinity-key');
    if (key) key.classList.toggle('tk-pulse', pulse);
    localStorage.setItem('bloodroom:pulse', pulse ? '1' : '0');
  }, [pulse]);

  useEffect(() => {
    document.documentElement.style.setProperty('--pulse-mode', mode);
    localStorage.setItem('bloodroom:mode', mode);
  }, [mode]);

  useEffect(() => {
    // Remove all ritual classes, add current
    document.body.classList.remove('state-sanctified','state-sealed','state-unbound');
    document.body.classList.add(`state-${ritual}`);
    localStorage.setItem('bloodroom:ritual', ritual);
  }, [ritual]);

  // Flash helpers
  function flashBodyClass(cls: string, ms = 500) {
    document.body.classList.add(cls);
    setTimeout(() => document.body.classList.remove(cls), ms);
  }

  return (
    <div className="trinity-key-wrap">
      <div className="trinity-key select-none" title="Trinity Key">
        <span className="tk-emoji text-[18px]">♾️</span>
      </div>

      <div className="trinity-key-meta">
        <span className="tk-label">Ambient</span>

        <label className="flex items-center gap-2">
          <span className="text-xs text-neutral-300/80">Dim</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={dim}
            onChange={(e) => setDim(parseFloat(e.target.value))}
          />
        </label>

        <label className="tk-pulse-toggle">
          <input
            type="checkbox"
            checked={pulse}
            onChange={(e) => setPulse(e.target.checked)}
          />
          Pulse
        </label>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="rounded-md bg-black/40 px-2 py-1 text-xs"
        >
          <option value="steady">Steady</option>
          <option value="quick">Quick</option>
          <option value="lapse">Lapse</option>
        </select>

        {/* Ritual State Selector */}
        <select
          value={ritual}
          onChange={(e) => setRitual(e.target.value as RitualState)}
          className="rounded-md bg-black/40 px-2 py-1 text-xs"
          title="Ritual State"
        >
          <option value="sanctified">Sanctified</option>
          <option value="sealed">Sealed</option>
          <option value="unbound">Unbound</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => flashBodyClass('tk-arriving', 3000)}
            className="rounded-md border border-rose-900/50 bg-rose-950/30 px-2 py-1 text-[11px]"
          >
            Arrive
          </button>
          <button
            onClick={() => flashBodyClass('tk-anchored', 600)}
            className="rounded-md border border-amber-900/50 bg-amber-950/30 px-2 py-1 text-[11px]"
          >
            Anchor
          </button>
          <button
            onClick={() => document.body.classList.toggle('tk-present')}
            className="rounded-md border border-red-900/50 bg-red-950/30 px-2 py-1 text-[11px]"
          >
            Present
          </button>
        </div>
      </div>
    </div>
  );
}

