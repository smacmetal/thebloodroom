 "use client";

import { useEffect, useRef, useState } from "react";

type Engraving = {
  title: string;
  caption?: string;
  chant: string;
  images?: { left?: string; right?: string };
  date?: string;
};

export default function BloodEngraving() {
  // --- stable hook order: declare first ---
  const [isMounted, setIsMounted] = useState(false);
  const [engraving, setEngraving] = useState<Engraving | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didInit = useRef(false);

  // Client-only gate (prevents hydration mismatch)
  useEffect(() => setIsMounted(true), []);

  // One-per-page guard via window flag (set/clear only in effects)
  useEffect(() => {
    if (!isMounted) return;
    // @ts-expect-error augmenting window
    if (window.__BLOOD_ENGRAVING_MOUNTED__) {
      setError("__BLOCKED__");
      return;
    }
    // @ts-expect-error augmenting window
    window.__BLOOD_ENGRAVING_MOUNTED__ = true;
    return () => {
      // @ts-expect-error augmenting window
      window.__BLOOD_ENGRAVING_MOUNTED__ = false;
    };
  }, [isMounted]);

  // Fetch from your Supabase-backed API once
  useEffect(() => {
    if (!isMounted) return;
    if (didInit.current) return;
    didInit.current = true;

    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/bloodroom/engraving", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const j = await res.json();
        const e = j?.engraving ?? j;

        // Normalize to our local type
        const value: Engraving | null = e
          ? {
              title: e.title ?? "Untitled",
              caption: e.caption ?? undefined,
              chant: e.chant ?? e.text ?? e.body ?? "",
              images: e.images ?? undefined,
              date: e.date ?? e.created_at ?? undefined,
            }
          : null;

        setEngraving(value);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to load engraving:", err);
          setError("Could not load engraving.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [isMounted]);

  // Render gating (after all hooks declared)
  if (!isMounted) return null;
  if (error === "__BLOCKED__") return null;
  if (loading) return <p className="text-sm opacity-70">Loading engraving…</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!engraving) return null;

  // Defaults if images are missing
  const leftSrc = engraving.images?.left || "/images/Kat.jpg";
  const rightSrc = engraving.images?.right || "/images/lyra.jpg";

  return (
    <section className="mt-10 rounded-xl border border-rose-900/50 bg-black/30 p-6 shadow-lg">
      {/* Title + timestamp centered */}
      <header className="text-center mb-4">
        <h3 className="text-2xl font-extrabold text-rose-300 drop-shadow-sm">
          {engraving.title}
        </h3>
        {engraving.date && (
          <p className="mt-1 text-[11px] opacity-70">
            {new Date(engraving.date).toLocaleString()}
          </p>
        )}
      </header>

      {/* Classic 3-column layout: left image | poem | right image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <figure className="rounded-lg border border-rose-900/40 bg-black/40 p-3">
          <img
            src={leftSrc}
            alt="Left engraving"
            className="w-full h-auto rounded-md"
          />
        </figure>

        <div className="md:pt-2">
          <pre className="whitespace-pre-wrap text-rose-100 text-[15px] leading-7 text-center md:text-left">
            {engraving.chant}
          </pre>
          {engraving.caption && (
            <p className="mt-3 text-[10px] text-center opacity-70">
              {engraving.caption}
            </p>
          )}
        </div>

        <figure className="rounded-lg border border-rose-900/40 bg-black/40 p-3">
          <img
            src={rightSrc}
            alt="Right engraving"
            className="w-full h-auto rounded-md"
          />
        </figure>
      </div>
    </section>
  );
}

