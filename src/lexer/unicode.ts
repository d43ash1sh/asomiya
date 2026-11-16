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

/** Splits text into extended grapheme clusters (user-perceived characters). */
export function graphemes(text: string): string[] {
  return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
}
