import type { SimpleTokenType } from './token-types';

/** A point in the original (un-normalised) source. `line` and `column` are 1-based; `column` counts code points. */
export interface Position {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

/** Half-open source range [start, end). */
export interface Span {
  readonly start: Position;
  readonly end: Position;
}

interface TokenBase {
  /** Exact source text of the token. */
  readonly lexeme: string;
  readonly span: Span;
}

export interface NumberToken extends TokenBase {
  readonly type: 'Number';
  readonly value: number;
}

export interface StringToken extends TokenBase {
  readonly type: 'String';
  /** Decoded, NFC-normalised contents. */
  readonly value: string;
}

export interface IdentifierToken extends TokenBase {
  readonly type: 'Identifier';
  /** Normalised name (see normalizeIdentifier). */
  readonly name: string;
}

export interface SimpleToken extends TokenBase {
  readonly type: SimpleTokenType;
}

export type Token = NumberToken | StringToken | IdentifierToken | SimpleToken;

export function spanFrom(start: Span, end: Span): Span {
  return { start: start.start, end: end.end };
}
