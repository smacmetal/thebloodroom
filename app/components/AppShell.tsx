// C:\Users\steph\thebloodroom\app\components\AppShell.tsx
'use client';

import { useEffect, useState } from 'react';
import SideNav from './SideNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Auto-open on desktop widths
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-black/60 backdrop-blur px-4 py-3">
        <button
          aria-label="Toggle sidebar"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg px-3 py-2 bg-white/10 hover:bg-white/20"
        >
          ☰
        </button>
        <div className="font-semibold">The Bloodroom</div>
      </header>

      <div className="relative flex">
        {/* Slide-in sidebar */}
        <SideNav open={open} onClose={() => setOpen(false)} />

        {/* Page content */}
        <main className="flex-1 p-6 lg:ml-60 transition-[margin]">
          {children}
        </main>
      </div>
    </div>
  );
}
