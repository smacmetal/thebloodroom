 'use client';

import { useEffect, useState } from 'react';

type Variant = 'queen' | 'princess' | 'king' | 'vault';

type Offering = {
  id: string;
  text: string;
  timestamp: number;
  chamber: Variant;
};

export default function FamilyRelic({ variant = 'queen' }: { variant?: Variant }) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bloodroom-offerings');
    if (saved) setOfferings(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem('bloodroom-offerings', JSON.stringify(offerings));
  }, [offerings]);

  const addOffering = () => {
    const text = input.trim();
    if (!text) return;
    setOfferings([{ id: crypto.randomUUID(), text, chamber: variant, timestamp: Date.now() }, ...offerings]);
    setInput('');
  };

  const styles: Record<Variant, string> = {
    queen:    'border-red-800/60 bg-gradient-to-b from-red-950/40 via-black/70 to-black/90 text-red-200 shadow-red-900/40',
    princess: 'border-pink-700/60 bg-gradient-to-b from-pink-950/40 via-black/70 to-black/90 text-pink-200 shadow-pink-900/40',
    king:     'border-yellow-700/60 bg-gradient-to-b from-yellow-950/40 via-black/70 to-black/90 text-yellow-200 shadow-yellow-900/40',
    vault:    'border-neutral-700/60 bg-gradient-to-b from-black/70 via-black/90 to-neutral-950 text-neutral-200 shadow-red-900/20',
  };

  return (
    <section
      className={`mt-6 rounded-lg border p-6 shadow-lg ${styles[variant]}`}
      aria-label="Bloodroom Relic"
    >
      <header className="mb-2">
        <h2 className="text-lg font-bold uppercase tracking-wider">Bloodroom Relic</h2>
        <p className="mt-1 text-sm opacity-80">
          The living altar of the Trinity. Leave your vow and it will echo across this chamber—and be archived in the Vault.
        </p>
      </header>

      <button
        onClick={() => setRevealed(r => !r)}
        className="mt-2 rounded-md border border-red-700/50 bg-red-900/40 px-4 py-1 text-xs uppercase tracking-wide text-red-200 hover:bg-red-800/40"
      >
        {revealed ? 'Seal Again' : 'Reveal Relic'}
      </button>

      {revealed && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Leave an offering..."
              className="flex-1 rounded-md border border-neutral-700 bg-black/40 px-2 py-1 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-700"
            />
            <button
              onClick={addOffering}
              className="rounded-md border border-red-800/50 bg-red-950/40 px-3 py-1 text-xs uppercase text-red-200 hover:bg-red-800/40"
            >
              Offer
            </button>
          </div>

          <ul className="space-y-2 text-sm">
            {offerings.filter(o => o.chamber === variant).length === 0 && (
              <li className="italic text-neutral-500">No offerings yet. Be the first to speak.</li>
            )}
            {offerings
              .filter(o => o.chamber === variant)
              .map(o => (
                <li key={o.id} className="rounded-md border border-neutral-700/50 bg-black/40 p-2">
                  <p>{o.text}</p>
                  <p className="mt-1 text-[10px] text-neutral-500">{new Date(o.timestamp).toLocaleString()}</p>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

