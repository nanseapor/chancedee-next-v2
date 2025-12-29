"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface RichTextEditorProps {
  value: string; // HTML
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  minLength?: number;
  error?: string;
  label?: string;
}

/**
 * Rich text editor component using Tiptap
 * Supports basic formatting: bold, italic, lists
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "เริ่มพิมพ์...",
  minLength = 0,
  error,
  label,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange(html, text);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const characterCount = editor.getText().length;
  const isMinLengthMet = minLength === 0 || characterCount >= minLength;

  return (
    <div className="space-y-2">
      {label && (
        <Label className={error ? "text-red-600" : ""}>
          {label}
          {minLength > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({characterCount}/{minLength} ตัวอักษร)
            </span>
          )}
        </Label>
      )}

      <div
        className={`rounded-lg border ${
          error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-gray-200 p-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded p-2 hover:bg-gray-100 ${
              editor.isActive("bold") ? "bg-gray-200" : ""
            }`}
            title="ตัวหนา"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded p-2 hover:bg-gray-100 ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
            title="ตัวเอียง"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-gray-300" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded p-2 hover:bg-gray-100 ${
              editor.isActive("bulletList") ? "bg-gray-200" : ""
            }`}
            title="รายการสัญลักษณ์แสดงหัวข้อย่อย"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded p-2 hover:bg-gray-100 ${
              editor.isActive("orderedList") ? "bg-gray-200" : ""
            }`}
            title="รายการลำดับเลข"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      {/* Error or character count */}
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        minLength > 0 && (
          <p
            className={`text-xs ${
              isMinLengthMet ? "text-gray-500" : "text-amber-600"
            }`}
          >
            {isMinLengthMet
              ? `เขียนครบ ${minLength} ตัวอักษรแล้ว`
              : `ต้องการอย่างน้อย ${minLength} ตัวอักษร`}
          </p>
        )
      )}
    </div>
  );
}
