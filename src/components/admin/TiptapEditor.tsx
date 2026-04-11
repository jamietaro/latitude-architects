"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[200px] p-3 outline-none text-white text-sm",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor border border-[#444] rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-[#444] bg-[#1c1c1f]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer ${
            editor.isActive("bold") ? "bg-[#333]" : "hover:bg-[#333]"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer italic ${
            editor.isActive("italic") ? "bg-[#333]" : "hover:bg-[#333]"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#333]"
              : "hover:bg-[#333]"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#333]"
              : "hover:bg-[#333]"
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer ${
            editor.isActive("bulletList") ? "bg-[#333]" : "hover:bg-[#333]"
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-xs text-white rounded cursor-pointer ${
            editor.isActive("link") ? "bg-[#333]" : "hover:bg-[#333]"
          }`}
        >
          Link
        </button>
      </div>

      {/* Editor */}
      <div className="bg-[#28282c]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
