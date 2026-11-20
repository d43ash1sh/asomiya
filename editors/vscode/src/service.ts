/**
 * The editor features that don't need VS Code itself: checking a program for errors, describing a
 * word, listing completions and translating to Python. Kept separate so it can be unit-tested.
 */
import { AsomiyaError } from '../../../src/errors/asomiya-error';
import { renderMessage } from '../../../src/errors/messages';
import type { MessageLanguage } from '../../../src/language/types';
import { parse } from '../../../src/parser/parser';
import { toPython } from '../../../src/python/translate';
import type { DigitSetting } from '../../../src/runtime/values';
import { WORDS, lookup, type Word } from './vocabulary';

/** Bigger files are not checked as you type (the interpreter accepts up to 10 million). */
export const MAX_LIVE_LENGTH = 1_000_000;

export interface Problem {
  readonly code: string;
  readonly message: string;
  /** UTF-16 offsets into the source, like VS Code's `positionAt`. */
  readonly start: number;
  readonly end: number;
}

/** Syntax errors in a program (Asomiya reports the first one), or none. */
export function check(source: string, lang: MessageLanguage): Problem[] {
  if (source.length > MAX_LIVE_LENGTH) return [];
  try {
    parse(source);
    return [];
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const d = error.diagnostic;
    const start = d.span.start.offset;
    // An empty range (e.g. at the end of the file) would be invisible, so mark one character.
    const end = Math.max(d.span.end.offset, Math.min(start + 1, source.length));
    return [
      {
        code: d.code,
        message: renderMessage(d.code, d.params as never, lang),
        start: start === end && start > 0 ? start - 1 : start,
        end,
      },
    ];
  }
}

/** Hover text (Markdown) for a keyword or built-in, or null for any other word. */
export function describe(text: string): string | null {
  const w = lookup(text);
  if (w === undefined) return null;
  const spelled = [w.word, ...w.roman.slice(0, 1)].map((s) => `\`${s}\``).join(' · ');
  const title = w.kind === 'builtin' ? `${spelled} — built-in function` : `${spelled} — keyword`;
  const sig = w.signature ? `\n\n\`\`\`asomiya\n${w.word}${w.signature}\n\`\`\`` : '';
  const others = w.roman.slice(1);
  return [
    `**${title}**${sig}`,
    `${w.en}\n\n${w.as}`,
    `Python: \`${w.python}\``,
    others.length > 0 ? `Also written: ${others.map((s) => `\`${s}\``).join(', ')}` : '',
    `[Reference](https://asomiya.codes/reference/${w.kind === 'builtin' ? 'builtins' : 'keywords'}/)`,
  ]
    .filter((part) => part !== '')
    .join('\n\n');
}

export interface Completion {
  readonly label: string;
  readonly detail: string;
  readonly kind: 'keyword' | 'function' | 'constant';
  readonly word: Word;
}

const kindOf = (w: Word): Completion['kind'] =>
  w.kind === 'builtin' || w.id === 'print'
    ? 'function'
    : ['true', 'false', 'null'].includes(w.id)
      ? 'constant'
      : 'keyword';

/**
 * Every keyword and built-in, in the script the program already uses (English letters if it uses
 * any Roman keyword, else Assamese), plus the other script's preferred spelling.
 */
export function completions(source: string): Completion[] {
  let roman: boolean;
  try {
    roman = parse(source).roman;
  } catch {
    roman = /\b(dhora|kowa|jodi|fangchon|jetialoike)\b/.test(source);
  }
  const out: Completion[] = [];
  for (const w of WORDS) {
    const primary = roman ? (w.roman[0] ?? w.word) : w.word;
    const secondary = roman ? w.word : w.roman[0];
    const detail = `${w.en} (Python: ${w.python})`;
    out.push({ label: primary, detail, kind: kindOf(w), word: w });
    if (secondary !== undefined) out.push({ label: secondary, detail, kind: kindOf(w), word: w });
  }
  return out;
}

export interface PythonView {
  readonly python: string | null;
  readonly error: string | null;
}

/** The program in Python, or the reason it can't be translated. */
export function python(source: string, lang: MessageLanguage, digits: DigitSetting): PythonView {
  if (source.length > MAX_LIVE_LENGTH) {
    return { python: null, error: 'This file is too big to translate as you type.' };
  }
  try {
    return { python: toPython(parse(source), { digits }), error: null };
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const d = error.diagnostic;
    const where = `line ${d.span.start.line}, column ${d.span.start.column}`;
    return {
      python: null,
      error: `[${d.code}] ${renderMessage(d.code, d.params as never, lang)} (${where})`,
    };
  }
}
