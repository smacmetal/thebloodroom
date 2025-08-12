 // C:\Users\steph\thebloodroom\app\components\RichTextEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Type your devotion…',
  role,
  idempotencyKey,
  onAttached, // { name, path }
}: {
  value?: string;
  onChange: (html: string, plain: string) => void;
  placeholder?: string;
  role: 'King' | 'Queen' | 'Princess';
  idempotencyKey: string;
  onAttached?: (att: { name: string; path: string }) => void;
}) {
  // Avoid hydration mismatch: delay paint until mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false, // ⬅️ required in SSR environments
    editorProps: {
      attributes: {
        class:
          'min-h-[140px] w-full rounded border border-white/10 bg-black/60 p-3 outline-none prose prose-invert max-w-none',
      },
    },
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [2, 3, 4] }),
      Bold,
      Italic,
      Underline,
      Link.configure({ openOnClick: true, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const plain = editor.getText();
      onChange(html, plain);
    },
  });

  // Keep external value in sync after mount
  useEffect(() => {
    if (!editor || !mounted) return;
    if ((value || '') !== editor.getHTML()) editor.commands.setContent(value || '', false);
  }, [value, editor, mounted]);

  async function handlePickInlineImage() {
    fileRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputEl = e.currentTarget;          // capture before awaits
    const file = inputEl.files?.[0];
    if (!file) return;
    try {
      // 1) Upload to S3
      const fd = new FormData();
      fd.append('file', file);
      fd.append('role', role);
      fd.append('group', 'wall');
      fd.append('idempotencyKey', idempotencyKey);
      const up = await fetch('/api/attachments/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok || !upJson?.ok || !upJson?.key) throw new Error(upJson?.error || `Upload failed (${up.status})`);

      // 2) Sign for immediate display
      const sign = await fetch('/api/attachments/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: upJson.key, expiresIn: 900 }),
      });
      const sig = await sign.json();
      if (!sign.ok || !sig?.ok || !sig?.url) throw new Error(sig?.error || `Sign failed (${sign.status})`);

      // 3) Insert image
      editor?.chain().focus().setImage({ src: sig.url, alt: file.name }).run();

      // 4) Save attachment info for the message JSON
      onAttached?.({ name: file.name, path: upJson.key });
    } catch (err) {
      console.error('[RichTextEditor] inline image error', err);
      alert('Image upload failed.');
    } finally {
      try { inputEl.value = ''; } catch {}
    }
  }

  // Don’t render editor DOM until mounted to avoid hydration mismatch
  if (!mounted || !editor) return null;

  const btn = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm border border-white/10 ${active ? 'bg-pink-500 text-black' : 'hover:bg-white/10'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        {btn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
        {btn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run())}
        {btn('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run())}
        {btn('H2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {btn('H3', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run())}
        {btn('•', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run())}
        {btn('1.', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run())}
        {btn('Link', editor.isActive('link'), () => {
          const url = prompt('Enter URL');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        })}
        {btn('🖼 Image', false, handlePickInlineImage)}
        {btn('Clear', false, () => editor.commands.clearContent())}
      </div>

      {/* Editor */}
      <div data-placeholder={placeholder}>
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input for inline image */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

