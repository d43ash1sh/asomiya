/**
 * The keyboard bar shown above a phone's on-screen keyboard in the playground, and the smart
 * inserts behind its keys. DOM-free, so it is unit-tested in tests/website/.
 */

/** One edit: replace the selection with `text`, then put the cursor `cursor` characters into it. */
export interface Insert {
  text: string;
  cursor: number;
}

export type KeyKind = 'indent' | 'block' | 'parens' | 'quotes' | 'symbol' | 'call' | 'word';

export interface BarKey {
  /** What the key shows (and, for a word or call, the Assamese spelling it inserts). */
  label: string;
  /** The English-letters spelling, used when the program is written in English letters. */
  roman?: string;
  kind: KeyKind;
}

const INDENT = '    ';

/** Symbols first (hardest to reach on a phone keyboard), then the words used most often. */
export const BAR_KEYS: readonly BarKey[] = [
  { label: '⇥', kind: 'indent' },
  { label: '{ }', kind: 'block' },
  { label: '( )', kind: 'parens' },
  { label: '" "', kind: 'quotes' },
  { label: '=', kind: 'symbol' },
  { label: '+', kind: 'symbol' },
  { label: '<', kind: 'symbol' },
  { label: '>', kind: 'symbol' },
  { label: ',', kind: 'symbol' },
  { label: 'ধৰা', roman: 'dhora', kind: 'word' },
  { label: 'কোৱা', roman: 'kowa', kind: 'call' },
  { label: 'যদি', roman: 'jodi', kind: 'word' },
  { label: "নহ'লে", roman: 'nohole', kind: 'word' },
  { label: 'যেতিয়ালৈকে', roman: 'jetialoike', kind: 'word' },
  { label: 'প্ৰতিটো', roman: 'protito', kind: 'word' },
  { label: 'মাজত', roman: 'majot', kind: 'word' },
  { label: 'ফাংচন', roman: 'fangchon', kind: 'word' },
  { label: 'ঘূৰাইদিয়া', roman: 'ghuraidiya', kind: 'word' },
  { label: 'সোধা', roman: 'xudha', kind: 'call' },
  { label: 'সঁচা', roman: 'xosa', kind: 'word' },
  { label: 'মিছা', roman: 'misa', kind: 'word' },
  { label: 'আৰু', roman: 'aru', kind: 'word' },
  { label: 'বা', roman: 'ba', kind: 'word' },
  { label: 'নহয়', roman: 'nohoy', kind: 'word' },
];

const ASSAMESE_LETTER = /[ঀ-৿]/;
const LATIN_LETTER = /[A-Za-z]/;

/**
 * Whether the keys should insert English-letter spellings: only when the program has English
 * letters outside comments and strings, and no Assamese ones.
 */
export function prefersRoman(source: string): boolean {
  const code = source.replace(/\/\/.*$/gm, '').replace(/"(?:[^"\\\n]|\\.)*"/g, '');
  return !ASSAMESE_LETTER.test(code) && LATIN_LETTER.test(code);
}

/** The spaces at the start of the line the cursor is on. */
export function lineIndent(source: string, cursor: number): string {
  const start = source.lastIndexOf('\n', cursor - 1) + 1;
  return /^[ \t]*/.exec(source.slice(start, cursor))?.[0] ?? '';
}

/**
 * What a key inserts at `cursor` in `source`. A block opens on its own indented line; brackets
 * and quotes come in pairs with the cursor between them; words get a space after them.
 */
export function keyInsert(key: BarKey, source: string, cursor: number, roman: boolean): Insert {
  const before = source.slice(0, cursor);
  const gap = before === '' || /\s$/.test(before) ? '' : ' ';
  const word = roman && key.roman !== undefined ? key.roman : key.label;
  switch (key.kind) {
    case 'indent':
      return { text: INDENT, cursor: INDENT.length };
    case 'block': {
      const indent = lineIndent(source, cursor);
      const open = `${gap}{\n${indent}${INDENT}`;
      return { text: `${open}\n${indent}}`, cursor: open.length };
    }
    case 'parens':
      return { text: '()', cursor: 1 };
    case 'quotes':
      return { text: '""', cursor: 1 };
    case 'symbol': {
      const text = key.label === ',' ? ', ' : `${gap}${key.label} `;
      return { text, cursor: text.length };
    }
    case 'call':
      return { text: `${word}()`, cursor: word.length + 1 };
    case 'word': {
      const text = `${word} `;
      return { text, cursor: text.length };
    }
  }
}

/**
 * Enter keeps the current line's indentation, one level deeper after `{`. Between `{` and `}`
 * the closing bracket moves to its own line.
 */
export function newlineInsert(source: string, cursor: number): Insert {
  const indent = lineIndent(source, cursor);
  const before = source.slice(0, cursor).trimEnd();
  const after = source.slice(cursor);
  if (!before.endsWith('{')) return { text: `\n${indent}`, cursor: indent.length + 1 };
  const inner = `\n${indent}${INDENT}`;
  if (/^[ \t]*\}/.test(after)) return { text: `${inner}\n${indent}`, cursor: inner.length };
  return { text: inner, cursor: inner.length };
}
