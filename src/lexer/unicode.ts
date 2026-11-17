/**
 * Unicode character classes used by the lexer. All tests operate on whole code points, never on
 * UTF-16 code units, so astral characters and combining marks are handled correctly.
 */

const IDENT_START = /^[\p{L}\p{Nl}_]$/u;
const IDENT_PART = /^[\p{L}\p{Nl}\p{M}\p{Nd}\p{Pc}‌‍]$/u;
const LETTER = /^\p{L}$/u;
const COMBINING_MARK = /^\p{M}$/u;
const SPACE_SEPARATOR = /^\p{Zs}$/u;

/** U+09E6 BENGALI DIGIT ZERO — the Bengali-Assamese script shares one digit block. */
const ASSAMESE_ZERO = 0x09e6;
const ASSAMESE_NINE = 0x09ef;

const ASCII_APOSTROPHE = "'";
const RIGHT_SINGLE_QUOTE = '’';
export const DANDA = '।';
const BYTE_ORDER_MARK = '﻿';

export function isIdentifierStart(ch: string): boolean {
  return IDENT_START.test(ch);
}

export function isIdentifierPart(ch: string): boolean {
  return IDENT_PART.test(ch);
}

export function isLetter(ch: string): boolean {
  return LETTER.test(ch);
}

export function isCombiningMark(ch: string): boolean {
  return COMBINING_MARK.test(ch);
}

/** Apostrophes that may join two parts of one word, as in নহ'লে or হ'ব. */
export function isWordApostrophe(ch: string): boolean {
  return ch === ASCII_APOSTROPHE || ch === RIGHT_SINGLE_QUOTE;
}

export function isWhitespace(ch: string): boolean {
  return (
    ch === ' ' || ch === '\t' || ch === '\r' || ch === BYTE_ORDER_MARK || SPACE_SEPARATOR.test(ch)
  );
}

export function isAsciiDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

export function isAssameseDigit(ch: string): boolean {
  const cp = ch.codePointAt(0);
  return cp !== undefined && ch.length === 1 && cp >= ASSAMESE_ZERO && cp <= ASSAMESE_NINE;
}

export function isDigit(ch: string): boolean {
  return isAsciiDigit(ch) || isAssameseDigit(ch);
}

/** Converts any Assamese digits in `text` to ASCII digits; other characters are unchanged. */
export function assameseDigitsToAscii(text: string): string {
  let out = '';
  for (const ch of text) {
    out += isAssameseDigit(ch) ? String((ch.codePointAt(0) ?? ASSAMESE_ZERO) - ASSAMESE_ZERO) : ch;
  }
  return out;
}

/** Converts ASCII digits in `text` to Assamese digits; other characters are unchanged. */
export function asciiDigitsToAssamese(text: string): string {
  let out = '';
  for (const ch of text) {
    out += isAsciiDigit(ch) ? String.fromCodePoint(ASSAMESE_ZERO + Number(ch)) : ch;
  }
  return out;
}

/**
 * The canonical form of a name: NFC, with the typographic apostrophe folded to ASCII.
 * Two names are the same binding iff their normalised forms are equal.
 */
export function normalizeIdentifier(text: string): string {
  return text.normalize('NFC').replaceAll(RIGHT_SINGLE_QUOTE, ASCII_APOSTROPHE);
}

const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Text is segmented in chunks of this many code units. Intl.Segmenter takes time quadratic in the
 * input length in current V8 (200 000 characters ≈ 10 s), which let a program or a shared
 * playground link freeze the host with one long string. Chunking keeps it linear.
 */
const GRAPHEME_CHUNK = 256;

/** Printable ASCII and tab: every character is its own cluster. */
const PLAIN_ASCII = /^[\x20-\x7e\t]*$/;

/** Splits text into extended grapheme clusters (user-perceived characters). */
export function graphemes(text: string): string[] {
  if (PLAIN_ASCII.test(text)) return Array.from(text);
  if (text.length <= GRAPHEME_CHUNK) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  const out: string[] = [];
  let pos = 0;
  while (pos < text.length) {
    const end = pos + GRAPHEME_CHUNK;
    const segments = Array.from(graphemeSegmenter.segment(text.slice(pos, end)));
    if (end >= text.length) {
      for (const s of segments) out.push(s.segment);
      break;
    }
    // Every boundary but the last one in the chunk is final (the next character is inside the
    // chunk). Re-segment from the start of the last cluster, which may continue past the chunk.
    const last = segments[segments.length - 1];
    if (last === undefined || last.index === 0) {
      // A single cluster longer than a whole chunk (thousands of combining marks): keep it as is.
      const piece = last?.segment ?? text.slice(pos, end);
      out.push(piece);
      pos += piece.length;
      continue;
    }
    for (let i = 0; i < segments.length - 1; i++) out.push(segments[i]?.segment ?? '');
    pos += last.index;
  }
  return out;
}

/** U+200C ZERO WIDTH NON-JOINER and U+200D ZERO WIDTH JOINER. */
export function isJoiner(ch: string): boolean {
  return ch === '\u200C' || ch === '\u200D';
}

/** Characters of the Bengali-Assamese block (U+0980–U+09FF). */
export function isBengaliScript(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return cp >= 0x0980 && cp <= 0x09ff;
}

/**
 * Invisible characters that can make source text look different from what runs ("Trojan Source",
 * CVE-2021-42574) or that act on a terminal when printed: C0/C1 controls other than tab and line
 * breaks, DEL, Unicode bidirectional controls, and the Unicode line/paragraph separators.
 */
export function isHiddenControl(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return false;
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return false;
  return (
    cp < 0x20 ||
    (cp >= 0x7f && cp <= 0x9f) ||
    cp === 0x061c ||
    cp === 0x200e ||
    cp === 0x200f ||
    (cp >= 0x202a && cp <= 0x202e) ||
    (cp >= 0x2066 && cp <= 0x2069) ||
    cp === 0x2028 ||
    cp === 0x2029
  );
}

/**
 * Makes text safe to print in a diagnostic: each hidden control becomes one visible code point
 * (C0 → its "control picture" ␛, others → �), so columns and carets still line up.
 */
export function visibleControls(text: string): string {
  let out = '';
  for (const ch of text) {
    if (!isHiddenControl(ch)) out += ch;
    else {
      const cp = ch.codePointAt(0) ?? 0;
      out += cp < 0x20 ? String.fromCodePoint(0x2400 + cp) : cp === 0x7f ? '\u2421' : '\uFFFD';
    }
  }
  return out;
}
