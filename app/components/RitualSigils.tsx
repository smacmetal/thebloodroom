 'use client';

import { usePathname } from 'next/navigation';

type Tint = { stroke: string; glow: string };

function tintFor(path: string): Tint {
  if (path.startsWith('/queen'))    return { stroke: 'rgba(220,40,80,0.26)',  glow: 'rgba(255,60,120,0.09)' };
  if (path.startsWith('/princess')) return { stroke: 'rgba(245,90,165,0.28)', glow: 'rgba(255,120,185,0.10)' };
  if (path.startsWith('/king'))     return { stroke: 'rgba(255,195,70,0.22)', glow: 'rgba(255,205,110,0.08)' };
  if (path.startsWith('/vault'))    return { stroke: 'rgba(185,190,200,0.20)', glow: 'rgba(170,40,60,0.06)' };
  return { stroke: 'rgba(220,40,80,0.24)', glow: 'rgba(245,80,130,0.08)' };
}

export default function RitualSigils() {
  const pathname = usePathname();
  const tint = tintFor(pathname);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-25 overflow-hidden">
      {/* Stars */}
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.06,
          backgroundImage:
            'radial-gradient(1.4px 1.4px at 10% 20%, rgba(255,255,255,0.32) 0, transparent 60%),' +
            'radial-gradient(1.4px 1.4px at 80% 35%, rgba(255,255,255,0.28) 0, transparent 60%),' +
            'radial-gradient(1.4px 1.4px at 45% 70%, rgba(255,255,255,0.26) 0, transparent 60%),' +
            'radial-gradient(1.4px 1.4px at 70% 80%, rgba(255,255,255,0.24) 0, transparent 60%)',
        }}
      />
      {/* Seal */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{
          opacity: 0.18,
          mixBlendMode: 'screen',
          filter: `blur(0.6px) drop-shadow(0 0 6px ${tint.glow})`,
        }}
      >
        <defs>
          <radialGradient id="sigil-vignette" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </radialGradient>
        </defs>

        <g stroke={tint.stroke} strokeWidth="1.5" fill="none">
          <circle cx="960" cy="540" r="360" />
          <circle cx="960" cy="540" r="520" />
          <circle cx="960" cy="540" r="720" />
        </g>
        <g stroke={tint.stroke} strokeWidth="1" fill="none" opacity="0.95">
          <path d="M 0 540 C 320 120, 1600 120, 1920 540" />
          <path d="M 0 540 C 320 960, 1600 960, 1920 540" />
          <path d="M 960 0 C 540 320, 540 760, 960 1080" />
          <path d="M 960 0 C 1380 320, 1380 760, 960 1080" />
        </g>
        <rect x="0" y="0" width="1920" height="1080" fill="url(#sigil-vignette)" />
      </svg>
    </div>
  );
}

