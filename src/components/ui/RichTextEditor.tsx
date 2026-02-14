import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  label,
}: RichTextEditorProps) {
  // Track whether the content prop changed externally (not from editor typing)
  const isExternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        orderedList: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        // If the clipboard has HTML, let Tiptap handle it natively
        if (html) return false;

        // For plain text, detect bullet-prefixed lines and convert
        if (text) {
          const lines = text.split('\n');
          const bulletPattern = /^[\s]*[-*•]\s+/;
          const hasBullets = lines.some((l) => bulletPattern.test(l));

          if (hasBullets) {
            event.preventDefault();

            const nonBullets: string[] = [];
            const bullets: string[] = [];
            let inBullets = false;

            for (const line of lines) {
              if (bulletPattern.test(line)) {
                inBullets = true;
                bullets.push(line.replace(bulletPattern, '').trim());
              } else if (inBullets && line.trim() === '') {
                // Skip blank lines between bullets
              } else {
                inBullets = false;
                if (line.trim()) nonBullets.push(line.trim());
              }
            }

            let insertHtml = '';
            if (nonBullets.length > 0) {
              insertHtml += nonBullets.map((l) => `<p>${l}</p>`).join('');
            }
            if (bullets.length > 0) {
              insertHtml += `<ul>${bullets.map((b) => `<li><p>${b}</p></li>`).join('')}</ul>`;
            }

            editor?.commands.insertContent(insertHtml);
            return true;
          }
        }

        return false;
      },
    },
  });

  // Sync external content changes (e.g. undo, reset) without fighting editor state
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (content !== currentHtml) {
      isExternalUpdate.current = true;
      editor.commands.setContent(content, false);
      isExternalUpdate.current = false;
    }
  }, [content, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden transition-shadow">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        {/* Editor area */}
        <EditorContent
          editor={editor}
          className="tiptap-editor px-3 py-2 min-h-[80px] text-sm text-gray-900 prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}
