import { lexerError } from '../errors/lexer-error';
import { keywordTokenType } from '../language/keywords';
import type { Position, Span, Token } from './token';
import type { SimpleTokenType } from './token-types';
import {
  DANDA,
  assameseDigitsToAscii,
  isAsciiDigit,
  isAssameseDigit,
  isCombiningMark,
  isDigit,
  isBengaliScript,
  isHiddenControl,
  isIdentifierPart,
  isJoiner,
  isIdentifierStart,
  isLetter,
  isWhitespace,
  isWordApostrophe,
  normalizeIdentifier,
} from './unicode';

type Bracket = '(' | '[' | '{';

const SINGLE_CHAR_TOKENS: Readonly<Record<string, SimpleTokenType>> = {
  '+': 'Plus',
  '-': 'Minus',
  '*': 'Star',
  '/': 'Slash',
  '%': 'Percent',
  ',': 'Comma',
  ';': 'Semicolon',
  [DANDA]: 'Semicolon',
};

const TWO_CHAR_TOKENS: Readonly<Record<string, SimpleTokenType>> = {
  '==': 'EqualEqual',
  '!=': 'BangEqual',
  '<=': 'LessEqual',
  '>=': 'GreaterEqual',
  '&&': 'AndAnd',
  '||': 'OrOr',
};

const OPTIONAL_PAIR_TOKENS: Readonly<Record<string, SimpleTokenType>> = {
  '=': 'Equal',
  '!': 'Bang',
  '<': 'Less',
  '>': 'Greater',
};

const ESCAPES: Readonly<Record<string, string>> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '"': '"',
  '\\': '\\',
};

/**
 * Converts source text to tokens. Scans by code point; positions refer to the original text.
 *
 * Newlines are significant (they end statements) except inside ( ) and [ ], where they are
 * skipped so that calls and lists can span lines. Consecutive newlines collapse into one token.
 */
export class Lexer {
  private readonly source: string;
  private offset = 0;
  private line = 1;
  private column = 1;
  private readonly tokens: Token[] = [];
  private readonly brackets: Bracket[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (!this.atEnd()) {
      this.scanToken();
    }
    const end = this.position();
    this.tokens.push({ type: 'EOF', lexeme: '', span: { start: end, end } });
    return this.tokens;
  }

  // ── character access ────────────────────────────────────────────────

  private atEnd(): boolean {
    return this.offset >= this.source.length;
  }

  /** The code point `ahead` code points from the current one, or '' past the end. */
  private peek(ahead = 0): string {
    let off = this.offset;
    for (let i = 0; i < ahead && off < this.source.length; i++) {
      off += (this.source.codePointAt(off) ?? 0) > 0xffff ? 2 : 1;
    }
    const cp = this.source.codePointAt(off);
    return cp === undefined ? '' : String.fromCodePoint(cp);
  }

  /** A line break is \n, \r\n (counted at its \n) or a lone \r (classic Mac line endings). */
  private atLineBreak(ahead = 0): boolean {
    const ch = this.peek(ahead);
    return ch === '\n' || (ch === '\r' && this.peek(ahead + 1) !== '\n');
  }

  private advance(): string {
    const ch = this.peek();
    this.offset += ch.length;
    if (ch === '\n' || (ch === '\r' && this.peek() !== '\n')) {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }

  private position(): Position {
    return { offset: this.offset, line: this.line, column: this.column };
  }

  private spanFrom(start: Position): Span {
    return { start, end: this.position() };
  }

  private newlinesSignificant(): boolean {
    const top = this.brackets[this.brackets.length - 1];
    return top === undefined || top === '{';
  }

  // ── scanning ────────────────────────────────────────────────────────

  private scanToken(): void {
    const ch = this.peek();
    const start = this.position();

    if (this.atLineBreak()) {
      this.advance();
      this.pushNewline(start);
      return;
    }
    if (isWhitespace(ch)) {
      this.advance();
      return;
    }
    if (ch === '/' && this.peek(1) === '/') {
      while (!this.atEnd() && !this.atLineBreak()) {
        this.rejectHiddenControl();
        this.advance();
      }
      return;
    }
    if (ch === '/' && this.peek(1) === '*') {
      this.scanBlockComment(start);
      return;
    }
    if (ch === '"') {
      this.scanString(start);
      return;
    }
    if (isDigit(ch)) {
      this.scanNumber(start);
      return;
    }
    if (isIdentifierStart(ch)) {
      this.scanIdentifier(start);
      return;
    }
    this.scanOperator(start, ch);
  }

  private pushNewline(start: Position): void {
    if (!this.newlinesSignificant()) return;
    const last = this.tokens[this.tokens.length - 1];
    if (last === undefined || last.type === 'Newline') return;
    this.tokens.push({ type: 'Newline', lexeme: '\n', span: this.spanFrom(start) });
  }

  private pushSimple(type: SimpleTokenType, start: Position): void {
    const span = this.spanFrom(start);
    this.tokens.push({ type, lexeme: this.source.slice(start.offset, span.end.offset), span });
  }

  private scanBlockComment(start: Position): void {
    this.advance();
    this.advance();
    const startLine = this.line;
    while (!(this.peek() === '*' && this.peek(1) === '/')) {
      if (this.atEnd()) {
        throw lexerError('L003', {}, this.spanFrom(start), true);
      }
      this.rejectHiddenControl();
      this.advance();
    }
    this.advance();
    this.advance();
    // A comment that spans lines separates statements just like a newline would.
    if (this.line !== startLine) this.pushNewline(start);
  }

  /** Strings and comments may hold any text except invisible controls (see isHiddenControl). */
  private rejectHiddenControl(): void {
    const ch = this.peek();
    if (!isHiddenControl(ch)) return;
    const at = this.position();
    this.advance();
    throw lexerError('L008', { char: ch }, this.spanFrom(at));
  }

  private scanString(start: Position): void {
    this.advance(); // opening quote
    let value = '';
    for (;;) {
      const ch = this.peek();
      if (ch === '' || ch === '\n' || ch === '\r') {
        throw lexerError('L002', {}, this.spanFrom(start));
      }
      if (ch === '"') {
        this.advance();
        break;
      }
      this.rejectHiddenControl();
      if (ch === '\\') {
        const escStart = this.position();
        this.advance();
        const next = this.peek();
        if (next === '' || next === '\n' || next === '\r') {
          // `"…\` at the end of a line: the string is unterminated, not a bad escape.
          throw lexerError('L002', {}, this.spanFrom(start));
        }
        const decoded = ESCAPES[next];
        if (decoded === undefined) {
          this.advance();
          throw lexerError('L004', { sequence: next }, this.spanFrom(escStart));
        }
        this.advance();
        value += decoded;
        continue;
      }
      value += this.advance();
    }
    const span = this.spanFrom(start);
    this.tokens.push({
      type: 'String',
      lexeme: this.source.slice(start.offset, span.end.offset),
      value: value.normalize('NFC'),
      span,
    });
  }

  private scanNumber(start: Position): void {
    while (isDigit(this.peek())) this.advance();
    if (this.peek() === '.' && isDigit(this.peek(1))) {
      this.advance();
      while (isDigit(this.peek())) this.advance();
    }
    // "১২ক" or "3.4.5" — a number glued to something that can't follow a number.
    if (isIdentifierPart(this.peek()) || (this.peek() === '.' && isDigit(this.peek(1)))) {
      while (isIdentifierPart(this.peek()) || this.peek() === '.') this.advance();
      const text = this.source.slice(start.offset, this.offset);
      throw lexerError('L006', { text }, this.spanFrom(start));
    }
    const text = this.source.slice(start.offset, this.offset);
    const chars = Array.from(text).filter((c) => c !== '.');
    if (chars.some(isAsciiDigit) && chars.some(isAssameseDigit)) {
      throw lexerError('L005', { text }, this.spanFrom(start));
    }
    this.tokens.push({
      type: 'Number',
      lexeme: text,
      value: Number(assameseDigitsToAscii(text)),
      span: this.spanFrom(start),
    });
  }

  private scanIdentifier(start: Position): void {
    this.scanIdentifierWord();
    const span = this.spanFrom(start);
    const lexeme = this.source.slice(start.offset, span.end.offset);
    const name = normalizeIdentifier(lexeme);

    if (name === 'ঘূৰাই' || name === 'ghurai') {
      const savedOffset = this.offset;
      const savedLine = this.line;
      const savedColumn = this.column;
      while (this.isHorizontalWhitespace(this.peek())) this.advance();
      if (this.offset > savedOffset && isIdentifierStart(this.peek())) {
        const secondStart = this.offset;
        this.scanIdentifierWord();
        const secondName = normalizeIdentifier(this.source.slice(secondStart, this.offset));
        if (
          (name === 'ঘূৰাই' && secondName === 'দিয়া') ||
          (name === 'ghurai' && (secondName === 'diya' || secondName === 'dia'))
        ) {
          this.pushSimple('Return', start);
          return;
        }
      }
      this.offset = savedOffset;
      this.line = savedLine;
      this.column = savedColumn;
    }

    const keyword = keywordTokenType(name);
    if (keyword !== undefined) {
      this.tokens.push({ type: keyword, lexeme, span });
    } else {
      this.tokens.push({ type: 'Identifier', lexeme, name, span });
    }
  }

  private scanIdentifierWord(): void {
    this.advance();
    for (;;) {
      const ch = this.peek();
      if (isJoiner(ch) && !isBengaliScript(this.source[this.offset - 1] ?? '')) {
        // ZWJ/ZWNJ only shape Assamese conjuncts; elsewhere they would make `na‍am` and `naam`
        // look identical but be different names.
        break;
      } else if (isIdentifierPart(ch)) {
        this.advance();
      } else if (isWordApostrophe(ch) && isLetter(this.peek(1))) {
        this.advance(); // নহ'লে, হ'ব …
      } else {
        break;
      }
    }
  }

  private isHorizontalWhitespace(ch: string): boolean {
    return ch !== '' && ch !== '\n' && ch !== '\r' && isWhitespace(ch);
  }

  private scanOperator(start: Position, ch: string): void {
    const pair = ch + this.peek(1);
    const two = TWO_CHAR_TOKENS[pair];
    if (two !== undefined) {
      this.advance();
      this.advance();
      this.pushSimple(two, start);
      return;
    }
    const one = SINGLE_CHAR_TOKENS[ch] ?? OPTIONAL_PAIR_TOKENS[ch];
    if (one !== undefined) {
      this.advance();
      this.pushSimple(one, start);
      return;
    }
    switch (ch) {
      case '(':
      case '[':
      case '{':
        this.brackets.push(ch);
        this.advance();
        this.pushSimple(ch === '(' ? 'LeftParen' : ch === '[' ? 'LeftBracket' : 'LeftBrace', start);
        return;
      case ')':
      case ']':
      case '}':
        this.brackets.pop();
        this.advance();
        this.pushSimple(
          ch === ')' ? 'RightParen' : ch === ']' ? 'RightBracket' : 'RightBrace',
          start,
        );
        return;
    }
    this.advance();
    const code = isCombiningMark(ch) ? 'L007' : 'L001';
    throw lexerError(code, { char: ch }, this.spanFrom(start));
  }
}

export function tokenize(source: string): Token[] {
  return new Lexer(source).tokenize();
}
