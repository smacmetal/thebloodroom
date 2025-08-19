 // C:\Users\steph\thebloodroom\app\components\AttachBar.tsx
'use client';

import { useState } from 'react';

export default function AttachBar({
  role,
  idempotencyKey,
  onAttached,
}: {
  role: 'King' | 'Queen' | 'Princess';
  idempotencyKey?: string;
  onAttached?: (att: { name: string; path: string }) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget;            // capture BEFORE any awaits
    const f = inputEl.files?.[0];
    if (!f) return;

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('role', role);
      fd.append('group', 'wall');
      if (idempotencyKey) fd.append('idempotencyKey', idempotencyKey);

      const r = await fetch('/api/attachments/upload', { method: 'POST', body: fd });
      const j = await r.json();
      if (j?.ok && j?.key) {
        onAttached?.({ name: f.name, path: j.key }); // store S3 key, not signed URL
      } else {
        console.error('Attach failed', j);
      }
    } catch (err) {
      console.error('Attach error', err);
    } finally {
      setBusy(false);
      // Reset the input safely using the captured element
      try { inputEl.value = ''; } catch {}
    }
  }

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${
        busy ? 'opacity-60' : 'hover:bg-white/5'
      } border-white/10`}
    >
      <span>📎 Attach</span>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        disabled={busy}
      />
    </label>
  );
}

