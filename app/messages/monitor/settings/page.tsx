'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [sse, setSse] = useState<'off'|'AES256'>('off');

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">⚙️ System Settings</h1>

      <div className="space-y-3 max-w-md">
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Theme</div>
          <select value={theme} onChange={e => setTheme(e.target.value as any)}
            className="w-full rounded border border-gray-700 bg-black px-3 py-2">
            <option value="dark">Dark</option>
            <option value="light">Light (placeholder)</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm opacity-70 mb-1">S3 Server-Side Encryption</div>
          <select value={sse} onChange={e => setSse(e.target.value as any)}
            className="w-full rounded border border-gray-700 bg-black px-3 py-2">
            <option value="off">Off</option>
            <option value="AES256">AES256 (recommended)</option>
          </select>
          <p className="text-xs opacity-60 mt-1">To apply, set <code>S3_SSE=AES256</code> in your env.</p>
        </label>

        <div className="text-sm opacity-60">More settings coming soon.</div>
      </div>
    </div>
  );
}
