 // C:\Users\steph\thebloodroom\app\components\RichTextEditor.tsx
"use client";

import "@/app/styles/editor.css"; // <- bring in the styling

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading"; // 👈 NEW

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // disable default heading so we can configure
      }),
      Heading.configure({
        levels: [1, 2, 3], // support H1, H2, H3
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "editor-content outline-none prose prose-invert max-w-none prose-p:m-0 prose-li:my-0",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  const btn = (active: boolean) =>
    `px-2 py-1 rounded border border-[#3a1b20] hover:bg-[#1e0f12] ${
      active ? "bg-[#2a0f12]" : ""
    }`;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border border-[#3a1b20] rounded-md bg-[#170c0f] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
          title="Bold (Ctrl/Cmd+B)"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
          title="Italic (Ctrl/Cmd+I)"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
          title="Underline"
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btn(editor.isActive("code"))}
          title="Inline Code"
        >
          Code
        </button>

        <span className="mx-2 opacity-40">|</span>

        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btn(editor.isActive("paragraph"))}
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={btn(editor.isActive("heading", { level: 1 }))} // H1
          title="H1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btn(editor.isActive("heading", { level: 2 }))} // H2
          title="H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btn(editor.isActive("heading", { level: 3 }))} // H3
          title="H3"
        >
          H3
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive("blockquote"))}
          title="Blockquote"
        >
          “ Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btn(editor.isActive("codeBlock"))}
          title="Code Block"
        >
          {"{ }"} Code Block
        </button>

        <span className="mx-2 opacity-40">|</span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
          title="Bulleted List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
          title="Numbered List"
        >
          1. List
        </button>

        <span className="mx-2 opacity-40">|</span>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          className="px-2 py-1 rounded border border-[#3a1b20] hover:bg-[#1e0f12]"
          title="Clear formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor surface */}
      <div className="rounded-xl border border-[#3a1b20] p-3 bg-[#14090c] text-[#ffd7de] min-h-[180px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

