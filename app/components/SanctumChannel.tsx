 'use client';

import { useEffect, useRef, useMemo } from "react";
import type { SanctumEvent } from "@/lib/sanctum/bus";

const emberUrl = "/audio/ember.mp3";
const katUrl   = "/audio/kat_whisper.mp3";  // <- rename or point to your file
const lyraUrl  = "/audio/lyra_whisper.mp3";

export default function SanctumChannel() {
  // Mute the sanctum on the Workroom page
  const mute = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/workroom");
  }, []);
  if (mute) return null;

  const emberRef = useRef<HTMLAudioElement | null>(null);
  const katRef   = useRef<HTMLAudioElement | null>(null);
  const lyraRef  = useRef<HTMLAudioElement | null>(null);
  const unlocked = useRef(false);

  useEffect(() => {
    const ember = new Audio(emberUrl);
    const kat   = new Audio(katUrl);
    const lyra  = new Audio(lyraUrl);

    ember.loop = true;
    ember.volume = 0.18;
    kat.volume   = 0.55;
    lyra.volume  = 0.55;

    emberRef.current = ember;
    katRef.current   = kat;
    lyraRef.current  = lyra;

    function tryUnlock() {
      if (unlocked.current) return;
      unlocked.current = true;
      ember.play().catch(() => {});
      kat.load(); lyra.load();
      window.removeEventListener("click", tryUnlock, true);
      window.removeEventListener("keydown", tryUnlock, true);
      window.removeEventListener("touchstart", tryUnlock, true);
    }
    window.addEventListener("click", tryUnlock, true);
    window.addEventListener("keydown", tryUnlock, true);
    window.addEventListener("touchstart", tryUnlock, true);

    // OLD stream shape: plain "data: {...}\n\n" (no named event)
    const es = new EventSource("/api/sanctum/events");
    es.onmessage = (ev) => {
      let data: SanctumEvent | null = null;
      try { data = JSON.parse(ev.data) as SanctumEvent; } catch { return; }
      if (!data) return;

      // Audio reactions
      if (data.type === "heartbeat") {
        const v = data.speed === "quick" ? 0.24 : data.speed === "lapse" ? 0.12 : 0.18;
        ember.volume = v;
      } else if (data.type === "flare") {
        const v0 = ember.volume;
        ember.volume = Math.min(0.3, v0 + 0.06);
        setTimeout(() => { ember.volume = v0; }, 1200);
      } else if (data.type === "chant") {
        const who = data.voices;
        if (who === "Braided" || who === "Both") {
          kat.currentTime = 0; lyra.currentTime = 0;
          kat.play().catch(()=>{}); lyra.play().catch(()=>{});
        } else if (who === "Kat") {
          kat.currentTime = 0; kat.play().catch(()=>{});
        } else if (who === "Lyra") {
          lyra.currentTime = 0; lyra.play().catch(()=>{});
        }
      } else if (data.type === "touch") {
        const v0 = ember.volume;
        ember.volume = Math.min(0.32, v0 + 0.1);
        setTimeout(() => { ember.volume = v0; }, Math.min(1800, data.duration ?? 900));
      }
    };

    return () => {
      es.close();
      ember.pause(); kat.pause(); lyra.pause();
      window.removeEventListener("click", tryUnlock, true);
      window.removeEventListener("keydown", tryUnlock, true);
      window.removeEventListener("touchstart", tryUnlock, true);
    };
  }, []);

  return null;
}

