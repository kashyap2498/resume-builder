import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';
import { escapeHtml } from '@/utils/richTextConvert';

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
  // Track whether we're programmatically setting content (to suppress onUpdate)
  const isExternalUpdate = useRef(false);
  // Flag set synchronously in onUpdate before React processes state.
  // When the useEffect fires from the resulting re-render, this flag tells us
  // the content change originated from the editor itself — skip setContent.
  const editorDidChange = useRef(false);

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
      if (isExternalUpdate.current) return;
      editorDidChange.current = true;
      onChange(ed.getHTML());
    },
    editorProps: {
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        // If the clipboard has HTML, let Tiptap handle it natively
        if (html) return false;

        // For plain text, detect bullets and convert to list
        if (text) {
          const lines = text.split('\n');
          const bulletPattern = /^[\s]*[-*•]\s+/;
          const hasBullets = lines.some((l) => bulletPattern.test(l));
          // Also detect inline bullet separators (e.g. "sentence one. • sentence two.")
          const hasInlineBullets = !hasBullets && /[^•]•\s/.test(text);

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
              insertHtml += nonBullets.map((l) => `<p>${escapeHtml(l)}</p>`).join('');
            }
            if (bullets.length > 0) {
              insertHtml += `<ul>${bullets.map((b) => `<li><p>${escapeHtml(b)}</p></li>`).join('')}</ul>`;
            }

            editor?.commands.insertContent(insertHtml);
            return true;
          }

          if (hasInlineBullets) {
            event.preventDefault();
            const parts = text.split(/\s*•\s*/).map((s) => s.trim()).filter(Boolean);
            const insertHtml = `<ul>${parts.map((b) => `<li><p>${escapeHtml(b)}</p></li>`).join('')}</ul>`;
            editor?.commands.insertContent(insertHtml);
            return true;
          }
        }

        return false;
      },
    },
  });

  // Sync external content changes (e.g. undo, reset) into the editor.
  // If the editor itself caused this content change (editorDidChange flag),
  // skip — calling setContent would destroy cursor position and formatting.
  useEffect(() => {
    if (!editor) return;
    if (editorDidChange.current) {
      editorDidChange.current = false;
      return;
    }
    isExternalUpdate.current = true;
    editor.commands.setContent(content, { emitUpdate: false });
    isExternalUpdate.current = false;
  }, [content, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-blue-100/70 text-blue-700 dark:bg-dark-overlay dark:text-white'
        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-overlay hover:text-gray-700 dark:hover:text-gray-100'
    }`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="rounded-lg border border-gray-200 dark:border-dark-edge-strong bg-white dark:bg-dark-card focus-within:shadow-[var(--shadow-glow-blue)] focus-within:border-blue-400 dark:focus-within:border-blue-500 overflow-hidden transition-all duration-200">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-dark-edge bg-gray-50/80 dark:bg-dark-raised">
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
          <div className="w-px h-5 bg-gray-200 dark:bg-dark-edge-strong mx-1" />
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
          className="tiptap-editor px-3 py-2 min-h-[80px] text-sm text-gray-900 dark:text-gray-100 prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}
