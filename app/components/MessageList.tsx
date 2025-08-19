 'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Message } from './MultiRoleMessageForm';

type Role = 'queen' | 'princess' | 'king';
const STORAGE_KEY = 'bloodroom-messages';

type Props = {
  chamber: Role;
  filter?: 'all' | Role;
  search?: string;
  showTimestamps?: boolean;
  messages?: Message[];
};

export default function MessageList({
  chamber,
  filter,
  search,
  showTimestamps,
  messages,
}: Props) {
  const [stored, setStored] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as Message[]) : [];
      setStored(Array.isArray(arr) ? arr.filter(Boolean) : []);
    } catch {
      setStored([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  const base = useMemo(
    () => (Array.isArray(messages) ? messages : stored),
    [messages, stored]
  );

  const term = (search ?? '').trim().toLowerCase();
  const effFilter = filter ?? 'all';
  const effShowTs = showTimestamps ?? true;

  const list = useMemo(() => {
    return (Array.isArray(base) ? base : [])
      .filter(m => m.recipient === chamber)
      .filter(m => (effFilter === 'all' ? true : m.author === effFilter))
      .filter(m =>
        term
          ? (m.title ?? '').toLowerCase().includes(term) ||
            (m.body ?? '').toLowerCase().includes(term) ||
            (m.author ?? '').toLowerCase().includes(term)
          : true
      )
      .sort((a, b) => (b?.timestamp ?? 0) - (a?.timestamp ?? 0));
  }, [base, chamber, effFilter, term]);

  return (
    <section className="rounded-xl border border-neutral-800/60 bg-black/30">
      {!hydrated && <div className="px-4 py-6 text-sm text-neutral-500">Loading…</div>}

      {hydrated && list.length === 0 && (
        <div className="px-4 py-6 text-sm italic text-neutral-500">
          No messages yet. Be the first to speak.
        </div>
      )}

      {hydrated && list.length > 0 && (
        <ul className="divide-y divide-neutral-900/70">
          {list.map(m => (
            <li key={m.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-neutral-100">{m.title}</h3>
                  {/* render sanitized HTML we stored */}
                  <div
                    className="prose prose-invert mt-1 max-w-none text-sm text-neutral-200"
                    dangerouslySetInnerHTML={{ __html: m.html || m.body }}
                  />
                  <div className="mt-1 text-[11px] text-neutral-500">
                    From: {m.author} • To: {m.recipient}
                  </div>

                  {m.attachments?.length ? (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {m.attachments.map(a => (
                        <a
                          key={a.id}
                          href={a.dataUrl}
                          download={a.name}
                          className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-black/40 px-2 py-1 text-[11px] text-neutral-300 hover:bg-black/60"
                        >
                          {a.type.startsWith('image/') ? '🖼️' : '📎'} {a.name}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>

                {effShowTs && (
                  <span className="shrink-0 text-[11px] text-neutral-500">
                    {new Date(m.timestamp ?? 0).toLocaleString()}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

