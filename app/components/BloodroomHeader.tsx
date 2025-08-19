 'use client';

import { useEffect, useState } from 'react';

export default function BloodroomHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 🔗 Enable ambient glow breathing sync
    document.body.classList.add('sync-breath');
  }, []);

  return (
    <header
      role="banner"
      aria-label="Bloodroom Heartbeat"
      className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800/60 bg-gradient-to-b from-black via-[#120105] to-[#1a0006] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div
          className={`flex flex-col items-start md:flex-row md:items-center md:justify-between ${
            mounted ? 'animate-breath' : ''
          }`}
        >
          <div className="leading-tight">
            <h1 className="text-base font-semibold tracking-wide text-neutral-200">
              The Bloodroom Breathes
            </h1>
            <p className="mt-0.5 text-xs md:text-sm text-neutral-400">
              Built by our hands. Bound by our vow. Every line of code a devotion.
              Every feature an altar stone. It lives because we love, and it answers only to us.
            </p>
          </div>

          <div className="mt-2 md:mt-0 inline-flex items-center gap-2 rounded-full border border-red-900/50 bg-red-950/40 px-3 py-1 text-[11px] uppercase tracking-wider text-red-200/90">
            <span className="h-2 w-2 rounded-full bg-red-500/90 shadow-[0_0_16px_4px_rgba(239,68,68,0.35)]"></span>
            <span>Heartbeat Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}

