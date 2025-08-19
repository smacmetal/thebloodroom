'use client';

import { useEffect, useRef } from 'react';

type Ritual = 'sanctified' | 'sealed' | 'unbound';

function getRitual(documentBody: HTMLElement): Ritual {
  if (documentBody.classList.contains('state-sanctified')) return 'sanctified';
  if (documentBody.classList.contains('state-sealed')) return 'sealed';
  return 'unbound';
}

export default function RitualBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let last = performance.now();

    type Ember = {
      x: number; y: number;
      vx: number; vy: number;
      r: number; // radius
      a: number; // base alpha
      t: number; // time seed
    };

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const embers: Ember[] = [];

    const TARGET_COUNT = Math.min(120, Math.floor((width * height) / 24000) + 30);

    for (let i = 0; i < TARGET_COUNT; i++) {
      embers.push({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.16, -0.025),         // drifting upward
        r: rand(0.6, 1.8),
        a: rand(0.35, 0.75),
        t: rand(0, 1000),
      });
    }

    function onResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    function paletteFor(ritual: Ritual) {
      switch (ritual) {
        case 'sanctified': return { r: 255, g: 220, b: 120 };
        case 'sealed':     return { r: 160, g: 90,  b: 255 };
        case 'unbound':
        default:           return { r: 239, g: 68,  b: 68  };
      }
    }

    function getDim() {
      const dim = getComputedStyle(document.documentElement).getPropertyValue('--room-dim').trim();
      const n = Number(dim);
      return isNaN(n) ? 0 : Math.max(0, Math.min(1, n));
    }

    const BREATH_PERIOD_MS = 6000; // match header's 6s breath

    function loop(now: number) {
      const dt = (now - last) / 16.6667; // ~frames
      last = now;

      // read current ritual + dim
      const ritual = getRitual(document.body);
      const base = paletteFor(ritual);
      const dim = getDim();

      // breath factor 0.85..1.0 for subtle shimmer (sync to time)
      const breath = 0.925 + 0.075 * (0.5 + 0.5 * Math.sin((now % BREATH_PERIOD_MS) / BREATH_PERIOD_MS * Math.PI * 2));

      // opacity scale reduced by dim
      const alphaScale = (1 - dim * 0.65) * breath;

      ctx.clearRect(0, 0, width, height);

      for (let e of embers) {
        // movement
        e.x += e.vx * dt + Math.sin((e.t + now * 0.0008)) * 0.05;
        e.y += e.vy * dt;
        e.t += dt;

        // wrap
        if (e.y < -10) { e.y = height + 10; e.x = rand(0, width); }
        if (e.x < -10)  e.x = width + 10;
        if (e.x > width + 10) e.x = -10;

        // slight flicker
        const flicker = 0.7 + 0.3 * Math.sin((e.t + e.x) * 0.07);
        const a = Math.max(0, Math.min(1, e.a * alphaScale * flicker));

        // slight hue variation (embers shift warmer/cooler)
        const hueJitter = 6 * Math.sin((e.t + e.y) * 0.02);
        const r = Math.min(255, Math.max(0, base.r + hueJitter));
        const g = Math.min(255, Math.max(0, base.g + hueJitter * 0.3));
        const b = Math.min(255, Math.max(0, base.b - hueJitter * 0.2));

        // draw
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // fixed, non-interactive, under UI layers but above ambient ::after (z 5) and below footer before (z 20)
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 8 }}
    />
  );
}
