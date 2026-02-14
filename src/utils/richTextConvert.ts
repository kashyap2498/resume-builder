import DOMPurify from 'dompurify';

/**
 * Escape HTML special characters in plain text so it can be safely
 * embedded inside HTML tags (stored resume data is plain text).
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert the store's `description` (string) + `highlights` (string[])
 * into the HTML expected by the Tiptap editor.
 *
 * - description → `<p>…</p>`
 * - highlights  → `<ul><li>…</li>…</ul>`
 * - Empty inputs → empty string (Tiptap shows placeholder)
 */
export function toEditorHtml(
  description: string,
  highlights: string[],
): string {
  const parts: string[] = [];

  if (description) {
    parts.push(`<p>${escapeHtml(description)}</p>`);
  }

  const nonEmpty = highlights.filter((h) => h.length > 0);
  if (nonEmpty.length > 0) {
    const items = nonEmpty.map((h) => `<li><p>${escapeHtml(h)}</p></li>`).join('');
    parts.push(`<ul>${items}</ul>`);
  }

  return parts.join('');
}

/**
 * Parse the Tiptap editor's HTML back into the store shape:
 * `{ description: string; highlights: string[] }`
 *
 * - Top-level `<p>` text → concatenated into `description`
 * - `<li>` items from any `<ul>` → `highlights[]`
 * - HTML is sanitised via DOMPurify; tags are stripped to plain text.
 */
export function fromEditorHtml(html: string): {
  description: string;
  highlights: string[];
} {
  if (!html || html === '<p></p>') {
    return { description: '', highlights: [] };
  }

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'ul', 'ol', 'li', 'br', 'strong', 'em', 'b', 'i'],
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${clean}</body>`, 'text/html');

  const descParts: string[] = [];
  const highlights: string[] = [];

  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        for (const li of Array.from(el.querySelectorAll('li'))) {
          const text = (li.textContent ?? '').trim();
          if (text) highlights.push(text);
        }
      } else {
        const text = (el.textContent ?? '').trim();
        if (text) descParts.push(text);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').trim();
      if (text) descParts.push(text);
    }
  }

  return {
    description: descParts.join('\n'),
    highlights,
  };
}
