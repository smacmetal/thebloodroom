// C:\Users\steph\thebloodroom\app\test\page.tsx
'use client';

import { useState } from 'react';

type Role = 'King' | 'Queen' | 'Princess';

export default function IdempotencyTestPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [ok1, setOk1] = useState<boolean | null>(null);
  const [ok2, setOk2] = useState<boolean | null>(null);

  const append = (line: string) => setLog((l) => [...l, line]);

  async function runTest() {
    setRunning(true);
    setLog([]);
    setOk1(null);
    setOk2(null);

    const payload = {
      author: 'King' as Role,
      recipients: ['Queen', 'Princess'] as Role[],
      text: 'Idempotency smoke test',
      // 👇 stable timestamp so both sends are exactly the same logical message
      createdAt: '2025-08-12T00:10:00.000Z',
      meta: { origin: 'click-test' },
    };

    try {
      append('First send…');
      const r1 = await fetch('/api/shared/send-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d1 = await r1.json().catch(() => ({}));
      setOk1(r1.ok && d1?.ok);
      append(`Response 1: ${r1.status} ${JSON.stringify(d1, null, 2)}`);

      append('Second send (same payload)…');
      const r2 = await fetch('/api/shared/send-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d2 = await r2.json().catch(() => ({}));
      setOk2(r2.ok && d2?.ok);
      append(`Response 2: ${r2.status} ${JSON.stringify(d2, null, 2)}`);

      append('Done. Now check: data/memory/entries, data/queen/messages, data/princess/messages.');
      append('You should see exactly ONE file in each location for this test payload.');
    } catch (e: any) {
      append(`Error: ${e?.message || e}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Idempotency Test</h1>

      <p className="opacity-80">
        This page sends the <em>same</em> multi-recipient message twice and prints the responses.
        If idempotency is working, S3 will have one canonical object, the Vault one JSON, and each recipient one local JSON.
      </p>

      <button
        onClick={runTest}
        disabled={running}
        className={`rounded-2xl px-4 py-2 shadow ${running ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {running ? 'Running…' : 'Run Idempotency Test'}
      </button>

      <div className="flex gap-3">
        <Status label="First Send" ok={ok1} />
        <Status label="Second Send" ok={ok2} />
      </div>

      <pre className="whitespace-pre-wrap text-sm bg-black/5 rounded-2xl p-4 max-h-[420px] overflow-auto">
        {log.join('\n')}
      </pre>

      <Hints />
    </div>
  );
}

function Status({ label, ok }: { label: string; ok: boolean | null }) {
  return (
    <div className="rounded-2xl px-3 py-2 border">
      <div className="text-sm opacity-70">{label}</div>
      <div className={`font-semibold ${ok === null ? 'opacity-60' : ok ? 'text-green-600' : 'text-red-600'}`}>
        {ok === null ? '—' : ok ? 'ok' : 'error'}
      </div>
    </div>
  );
}

function Hints() {
  return (
    <div className="text-sm opacity-80 space-y-2">
      <div className="font-semibold">Where to look on disk:</div>
      <ul className="list-disc ml-5">
        <li>Vault: <code>data/memory/entries/2025-08-12-message-&lt;sha256&gt;.json</code></li>
        <li>Queen: <code>data/queen/messages/2025-08-12T00-10-00-000Z-&lt;sha256&gt;.json</code></li>
        <li>Princess: <code>data/princess/messages/2025-08-12T00-10-00-000Z-&lt;sha256&gt;.json</code></li>
      </ul>
      <div>In the responses above, look for <code>idempotencyKey</code> and <code>s3.canonicalKey</code>.</div>
    </div>
  );
}
