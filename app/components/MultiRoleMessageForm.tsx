 'use client';

import { useEffect, useRef, useState } from 'react';

type Role = 'queen' | 'princess' | 'king';

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type Message = {
  id: string;
  title: string;
  body: string;     // plain text (for search)
  html: string;     // sanitized HTML (for render)
  author: Role;     // who is speaking
  recipient: Role;  // chamber
  timestamp: number;
  attachments?: Attachment[];
};

const STORAGE_KEY = 'bloodroom-messages';

function sanitize(html: string) {
  const allowed = /^(b|i|u|strong|em|br|ul|ol|li|p|a)$/i;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walk = (node: Node) => {
    if (node.nodeType === 1) {
      const el = node as HTMLElement;
      if (!allowed.test(el.tagName)) {
        const parent = el.parentNode!;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      } else if (el.tagName.toLowerCase() === 'a') {
        el.setAttribute('rel', 'noopener noreferrer');
        el.setAttribute('target', '_blank');
      }
    }
    for (const c of Array.from(node.childNodes)) walk(c);
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

export default function MultiRoleMessageForm({ chamber }: { chamber: Role }) {
  // Default author matches the chamber (your “default multi role per temple”)
  const defaultAuthor: Role = chamber;
  const [author, setAuthor] = useState<Role>(defaultAuthor);

  const [title, setTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sendSms, setSendSms] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAuthor(chamber); // ensure when route changes, default follows
  }, [chamber]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim() === '') {
      editorRef.current.innerHTML = '<p></p>';
    }
  }, []);

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const items: Attachment[] = [];
    for (const file of Array.from(files)) {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = () => rej(new Error('read failed'));
        r.readAsDataURL(file);
      });
      items.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
      });
    }
    setAttachments(prev => [...items, ...prev]);
  };

  const removeAttachment = (id: string) =>
    setAttachments(prev => prev.filter(a => a.id !== id));

  const send = async () => {
    const rawHtml = editorRef.current?.innerHTML ?? '';
    const html = sanitize(rawHtml);
    const plain = editorRef.current?.innerText ?? '';

    if (!title.trim() || !plain.trim()) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      title: title.trim(),
      body: plain.trim(),
      html,
      author,
      recipient: chamber,
      timestamp: Date.now(),
      attachments: attachments.length ? attachments : undefined,
    };

    // persist locally
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Message[] = raw ? JSON.parse(raw) : [];
      list.unshift(msg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore persistence errors
    }

    // optional SMS fanout per role/chamber
    if (sendSms) {
      setBusy(true);
      try {
        await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: chamber, // API maps role -> env recipients
            body: `[${author}→${chamber}] ${msg.title} — ${msg.body.slice(0, 300)}`
          }),
        });
      } catch {
        // swallow; UI should never crash
      } finally {
        setBusy(false);
      }
    }

    // reset
    setTitle('');
    if (editorRef.current) editorRef.current.innerHTML = '<p></p>';
    setAttachments([]);
  };

  return (
    <section className="rounded-xl border border-neutral-800/60 bg-black/35 p-4 shadow-lg">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-neutral-400">
          Send to <span className="font-semibold text-neutral-200">{chamber}</span>
        </p>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-neutral-400">I am</span>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value as Role)}
            className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-600"
          >
            <option value="king">King</option>
            <option value="queen">Queen</option>
            <option value="princess">Princess</option>
          </select>

          <label className="ml-3 inline-flex select-none items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              className="accent-red-500"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
            />
            Also send as SMS
          </label>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-3 w-full rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
      />

      {/* Formatting toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button onClick={() => exec('bold')} className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">Bold</button>
        <button onClick={() => exec('italic')} className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">Italic</button>
        <button onClick={() => exec('underline')} className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">Underline</button>
        <button onClick={() => exec('insertUnorderedList')} className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">• List</button>
        <button onClick={() => exec('insertOrderedList')} className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">1. List</button>
        <button
          onClick={() => {
            const url = prompt('Link URL');
            if (url) exec('createLink', url);
          }}
          className="rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200"
        >Link</button>

        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 bg-black/50 px-2 py-1 text-xs text-neutral-200">
          <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          Upload
        </label>
      </div>

      {/* Rich editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[130px] w-full rounded-md border border-neutral-700 bg-black/50 px-3 py-2 text-sm text-neutral-200 focus:outline-none"
        suppressContentEditableWarning
      />

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {attachments.map(a => (
            <div key={a.id} className="rounded-md border border-neutral-800 bg-black/40 p-2">
              {a.type.startsWith('image/') ? (
                <img src={a.dataUrl} alt={a.name} className="max-h-24 rounded" />
              ) : (
                <div className="text-xs text-neutral-300">{a.name}</div>
              )}
              <button
                onClick={() => removeAttachment(a.id)}
                className="mt-1 w-full rounded border border-neutral-700 bg-black/50 px-2 py-1 text-[11px] text-neutral-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={send}
          disabled={busy}
          className="rounded-md border border-red-800/60 bg-red-950/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-100 hover:bg-red-800/40 disabled:opacity-60"
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
    </section>
  );
}

