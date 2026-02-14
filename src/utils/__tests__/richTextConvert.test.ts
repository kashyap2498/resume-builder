import { describe, it, expect } from 'vitest';
import { escapeHtml, toEditorHtml, fromEditorHtml } from '../richTextConvert';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('R&D')).toBe('R&amp;D');
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('toEditorHtml', () => {
  it('returns empty string when both inputs are empty', () => {
    expect(toEditorHtml('', [])).toBe('');
  });

  it('wraps description in <p>', () => {
    expect(toEditorHtml('Hello world', [])).toBe('<p>Hello world</p>');
  });

  it('wraps highlights in <ul><li>', () => {
    expect(toEditorHtml('', ['One', 'Two'])).toBe(
      '<ul><li><p>One</p></li><li><p>Two</p></li></ul>',
    );
  });

  it('combines description and highlights', () => {
    const result = toEditorHtml('Desc', ['A', 'B']);
    expect(result).toBe(
      '<p>Desc</p><ul><li><p>A</p></li><li><p>B</p></li></ul>',
    );
  });

  it('escapes HTML in description', () => {
    expect(toEditorHtml('<b>bold</b>', [])).toBe(
      '<p>&lt;b&gt;bold&lt;/b&gt;</p>',
    );
  });

  it('escapes HTML in highlights', () => {
    expect(toEditorHtml('', ['<em>hi</em>'])).toBe(
      '<ul><li><p>&lt;em&gt;hi&lt;/em&gt;</p></li></ul>',
    );
  });

  it('filters out empty highlights', () => {
    expect(toEditorHtml('', ['A', '', 'B'])).toBe(
      '<ul><li><p>A</p></li><li><p>B</p></li></ul>',
    );
  });
});

describe('fromEditorHtml', () => {
  it('returns empty for empty input', () => {
    expect(fromEditorHtml('')).toEqual({ description: '', highlights: [] });
  });

  it('returns empty for Tiptap default empty paragraph', () => {
    expect(fromEditorHtml('<p></p>')).toEqual({
      description: '',
      highlights: [],
    });
  });

  it('extracts description from <p> tags', () => {
    expect(fromEditorHtml('<p>Hello world</p>')).toEqual({
      description: 'Hello world',
      highlights: [],
    });
  });

  it('extracts highlights from <ul><li> tags', () => {
    expect(
      fromEditorHtml('<ul><li><p>One</p></li><li><p>Two</p></li></ul>'),
    ).toEqual({
      description: '',
      highlights: ['One', 'Two'],
    });
  });

  it('extracts both description and highlights', () => {
    expect(
      fromEditorHtml(
        '<p>Desc</p><ul><li><p>A</p></li><li><p>B</p></li></ul>',
      ),
    ).toEqual({
      description: 'Desc',
      highlights: ['A', 'B'],
    });
  });

  it('strips dangerous HTML tags via DOMPurify', () => {
    const result = fromEditorHtml(
      '<p>Hello</p><script>alert("xss")</script><ul><li><p>Safe</p></li></ul>',
    );
    expect(result).toEqual({
      description: 'Hello',
      highlights: ['Safe'],
    });
  });
});

describe('roundtrip', () => {
  it('roundtrips description only', () => {
    const desc = 'Led a team of engineers';
    const result = fromEditorHtml(toEditorHtml(desc, []));
    expect(result).toEqual({ description: desc, highlights: [] });
  });

  it('roundtrips highlights only', () => {
    const highlights = ['Built CI/CD pipeline', 'Reduced costs by 30%'];
    const result = fromEditorHtml(toEditorHtml('', highlights));
    expect(result).toEqual({ description: '', highlights });
  });

  it('roundtrips both', () => {
    const desc = 'Managed cross-functional projects';
    const highlights = ['Delivered on time', 'Under budget'];
    const result = fromEditorHtml(toEditorHtml(desc, highlights));
    expect(result).toEqual({ description: desc, highlights });
  });

  it('roundtrips text with special characters', () => {
    const desc = 'R&D for <Project> "Alpha"';
    const highlights = ['Saved > $1M', 'Used "lean" & agile'];
    const result = fromEditorHtml(toEditorHtml(desc, highlights));
    expect(result).toEqual({ description: desc, highlights });
  });
});
