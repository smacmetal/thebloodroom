'use client';

import { useState } from 'react';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function EditorTestPage() {
  const [value, setValue] = useState<string>('<p>Type here… then try • List and 1. List</p>');

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Bloodroom Editor Test</h1>

      <RichTextEditor value={value} onChange={setValue} />

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="text-sm mb-2 opacity-80">Rendered output:</div>
        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
      </div>
    </div>
  );
}


