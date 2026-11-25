/** Token types that carry no payload beyond their lexeme. */
export type SimpleTokenType =
  // keywords
  | 'Let'
  | 'Print'
  | 'If'
  | 'Else'
  | 'While'
  | 'ForEach'
  | 'In'
  | 'Function'
  | 'Return'
  | 'Break'
  | 'Continue'
  | 'True'
  | 'False'
  | 'Null'
  // operators (`AndAnd` / `OrOr` are also produced by আৰু / বা)
  | 'Plus'
  | 'Minus'
  | 'Star'
  | 'Slash'
  | 'Percent'
  | 'Equal'
  | 'EqualEqual'
  | 'Bang'
  | 'BangEqual'
  | 'Less'
  | 'LessEqual'
  | 'Greater'
  | 'GreaterEqual'
  | 'AndAnd'
  | 'OrOr'
  // punctuation
  | 'LeftParen'
  | 'RightParen'
  | 'LeftBrace'
  | 'RightBrace'
  | 'LeftBracket'
  | 'RightBracket'
  | 'Comma'
  /** `;` or the danda `।` */
  | 'Semicolon'
  | 'Newline'
  | 'EOF';

export type TokenType = SimpleTokenType | 'Number' | 'String' | 'Identifier';

/** Fixed spellings of operator/punctuation tokens, used in diagnostics ("expected ')'"). */
export const PUNCTUATION_TEXT = {
  Plus: '+',
  Minus: '-',
  Star: '*',
  Slash: '/',
  Percent: '%',
  Equal: '=',
  EqualEqual: '==',
  Bang: '!',
  BangEqual: '!=',
  Less: '<',
  LessEqual: '<=',
  Greater: '>',
  GreaterEqual: '>=',
  AndAnd: '&&',
  OrOr: '||',
  LeftParen: '(',
  RightParen: ')',
  LeftBrace: '{',
  RightBrace: '}',
  LeftBracket: '[',
  RightBracket: ']',
  Comma: ',',
  Semicolon: ';',
} as const satisfies Partial<Record<SimpleTokenType, string>>;

export type PunctuationTokenType = keyof typeof PUNCTUATION_TEXT;
