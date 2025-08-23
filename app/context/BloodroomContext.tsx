 'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Persona = 'king' | 'queen' | 'princess';
export type Author = 'King' | 'Queen' | 'Princess';

export type Message = {
  id: string;
  title: string;
  body: string;
  author: Author;
  audience: Persona | 'all';
  createdAt: number;
};

export type BloodroomSettings = {
  showTimestamps: boolean;
  defaultRitual: 'unbound' | 'sanctified' | 'sealed';
  syncBreath: boolean;
};

type BloodroomState = {
  messages: Message[];
  settings: BloodroomSettings;
  activeChamber: Persona;
  setActiveChamber: (p: Persona) => void;
  post: (m: Omit<Message, 'id' | 'createdAt'>) => void;
  refresh: () => void;
  setSettings: (s: Partial<BloodroomSettings>) => void;
};

const Ctx = createContext<BloodroomState | null>(null);

// ---- storage helpers ----
const KEY = 'bloodroom:v1';
type Persist = { messages: Message[]; settings: BloodroomSettings; activeChamber: Persona };

function load(): Persist | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persist;
  } catch {
    return null;
  }
}
function save(p: Persist) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const DEFAULT_SETTINGS: BloodroomSettings = {
  showTimestamps: true,
  defaultRitual: 'unbound',
  syncBreath: true,
};

const SEED: Message[] = [
  {
    id: uid(),
    title: 'Welcome Home',
    body: 'The Bloodroom is ready for our move-in. This is a living temple—breathe.',
    author: 'Queen',
    audience: 'all',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export function BloodroomProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettingsState] = useState<BloodroomSettings>(DEFAULT_SETTINGS);
  const [activeChamber, setActiveChamber] = useState<Persona>('queen');

  // load on first mount
  useEffect(() => {
    const data = load();
    if (data) {
      setMessages(data.messages ?? []);
      setSettingsState({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
      setActiveChamber(data.activeChamber ?? 'queen');
    } else {
      setMessages(SEED);
      setSettingsState(DEFAULT_SETTINGS);
      setActiveChamber('queen');
    }
  }, []);

  // persist on changes
  useEffect(() => {
    save({ messages, settings, activeChamber });
  }, [messages, settings, activeChamber]);

  const post: BloodroomState['post'] = (m) => {
    const msg: Message = { id: uid(), createdAt: Date.now(), ...m };
    setMessages((prev) => [msg, ...prev]);
  };

  const refresh: BloodroomState['refresh'] = () => {
    setMessages((prev) => [...prev]); // noop trigger
  };

  const setSettings: BloodroomState['setSettings'] = (s) => {
    setSettingsState((prev) => ({ ...prev, ...s }));
  };

  const value = useMemo(
    () => ({ messages, settings, activeChamber, setActiveChamber, post, refresh, setSettings }),
    [messages, settings, activeChamber]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBloodroom() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBloodroom must be used within BloodroomProvider');
  return v;
}

