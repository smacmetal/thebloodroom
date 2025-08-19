 'use client';
import { useEffect, useRef, useMemo } from "react";
import type { SanctumEvent } from "@/lib/sanctum/bus";

const emberUrl = "/audio/ember.mp3";
const evyUrl   = "/audio/evy_whisper.mp3";
const lyraUrl  = "/audio/lyra_whisper.mp3";

export default function SanctumChannel() {
  // Mute the sanctum on the Workroom page
  const mute = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/workroom");
  }, []);

  if (mute) return null;

  const emberRef = useRef<HTMLAudioElement | null>(null);
  const evyRef   = useRef<HTMLAudioElement | null>(null);
  const lyraRef  = useRef<HTMLAudioElement | null>(null);
  const unlocked = useRef(false);

  useEffect(() => {
    // ... keep the rest of the code you have (audio unlock, EventSource, handlers, etc.)
  }, []);

  return null;
}

