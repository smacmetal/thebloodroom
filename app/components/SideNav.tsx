 // C:\Users\steph\thebloodroom\app\components\SideNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const baseNav = [
  { key: 'vault',    href: '/vault',     label: 'The Vault',         emoji: '🔒' },
  { key: 'king',     href: '/king',      label: "King’s Temple",      emoji: '👑' },
  { key: 'queen',    href: '/queen',     label: 'Call Your Queen',    emoji: '💞' },
  { key: 'princess', href: '/princess',  label: 'Call Your Princess', emoji: '🌙' },
  { key: 'memory',   href: '/memory',    label: 'Memory Vault',       emoji: '🧠' },
  { key: 'new',      href: '/memory/new',label: 'New Memory Entry',   emoji: '✍️' },
  { key: 'viewer',   href: '/vault/json',label: 'Vault JSON Viewer',  emoji: '📂' },
  { key: 'monitor',  href: '/messages/monitor', label: 'Messaging Monitor', emoji: '📡' },
  { key: 'settings', href: '/settings',  label: 'System Settings',    emoji: '⚙️' },
];

const devOnly = [
  { key: 'test',  href: '/test',  label: 'Idempotency Test', emoji: '🧪' },
  { key: 'debug', href: '/debug', label: 'Debug Console',    emoji: '🛠️' },
];

type Stats = {
  ok: boolean;
  roles?: {
    King?: { count: number; latest: string | null };
    Queen?: { count: number; latest: string | null };
    Princess?: { count: number; latest: string | null };
  };
  vault?: { count: number; latest: string | null };
  error?: string;
};

function Badge({
  value,
  pulse,
  title,
}: {
  value: number | null | undefined;
  pulse?: boolean;
  title?: string;
}) {
  if (value == null) return null;
  return (
    <span
      title={title}
      className={`ml-auto inline-flex min-w-[1.5rem] justify-center rounded-full px-2 py-0.5 text-xs
        ${pulse ? 'animate-pulse bg-pink-600/80 text-white' : 'bg-white/10 text-white/80'}`}
    >
      {value}
    </span>
  );
}

export default function SideNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  // Show dev links when explicitly enabled, or always in local dev
  const showDevLinks =
    process.env.NEXT_PUBLIC_DEV_LINKS === 'true' || process.env.NODE_ENV !== 'production';

  const items = showDevLinks ? [...baseNav, ...devOnly] : baseNav;

  // ---- live stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [tick, setTick] = useState(0);
  const prevRef = useRef<{ king?: number; queen?: number; princess?: number; vault?: number }>({});

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const r = await fetch('/api/stats/messages', { cache: 'no-store' });
        const j: Stats = await r.json().catch(() => ({ ok: false }));
        if (!alive) return;
        setStats(j);
      } catch {
        if (!alive) return;
        setStats({ ok: false });
      }
    }
    load();
    const id = setInterval(() => {
      setTick((t) => t + 1);
      load();
    }, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const counts = useMemo(() => {
    const k = stats?.roles?.King?.count ?? null;
    const q = stats?.roles?.Queen?.count ?? null;
    const p = stats?.roles?.Princess?.count ?? null;
    const v = stats?.vault?.count ?? null;

    const pulse = {
      k: prevRef.current.king != null && k != null && k > (prevRef.current.king ?? -1),
      q: prevRef.current.queen != null && q != null && q > (prevRef.current.queen ?? -1),
      p: prevRef.current.princess != null && p != null && p > (prevRef.current.princess ?? -1),
      v: prevRef.current.vault != null && v != null && v > (prevRef.current.vault ?? -1),
    };

    prevRef.current = {
      king: k ?? undefined,
      queen: q ?? undefined,
      princess: p ?? undefined,
      vault: v ?? undefined,
    };

    return { k, q, p, v, pulse };
  }, [stats, tick]);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-60 border-r border-gray-800 bg-black/95
        transition-transform lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
      >
        <div className="p-4 space-y-2">
          {items.map((item) => {
            const active = pathname?.startsWith(item.href);

            let badge: React.ReactNode = null;
            if (item.key === 'king') {
              badge = <Badge value={counts.k} pulse={counts.pulse.k} title="King messages" />;
            } else if (item.key === 'queen') {
              badge = <Badge value={counts.q} pulse={counts.pulse.q} title="Queen messages" />;
            } else if (item.key === 'princess') {
              badge = <Badge value={counts.p} pulse={counts.pulse.p} title="Princess messages" />;
            } else if (item.key === 'vault') {
              badge = <Badge value={counts.v} pulse={counts.pulse.v} title="Vault entries" />;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active
                    ? 'bg-pink-600/20 text-pink-300 border border-pink-600/40'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1">{item.emoji}</span>
                <span className="truncate">{item.label}</span>
                <span className="flex-1" />
                {badge}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

