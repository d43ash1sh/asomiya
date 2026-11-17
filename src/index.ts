export { LANGUAGE, type LanguageConfig } from './language/config';
export {
  KEYWORD_GLOSSARY,
  BUILTIN_NAMES,
  BUILTIN_ROMAN,
  type KeywordEntry,
  type KeywordId,
} from './language/glossary';
export { KEYWORDS } from './language/keywords';
export { TYPE_NAMES, type MessageLanguage, type ValueKind } from './language/types';

export { Lexer, tokenize } from './lexer/lexer';
export type { Token, Span, Position } from './lexer/token';
export type { TokenType } from './lexer/token-types';
export { normalizeIdentifier, graphemes } from './lexer/unicode';

export { Parser, parse } from './parser/parser';
export type * from './parser/ast';

export {
  Interpreter,
  DEFAULT_MAX_CALL_DEPTH,
  DEFAULT_MAX_STEPS,
  type InterpreterOptions,
} from './runtime/interpreter';
export { Environment } from './runtime/environment';
export { displayValue, reprValue, formatNumber } from './runtime/display';
export type { Value, DigitStyle, DigitSetting } from './runtime/values';

export { AsomiyaError } from './errors/asomiya-error';
export { LexerError } from './errors/lexer-error';
export { ParserError } from './errors/parser-error';
export { RuntimeError } from './errors/runtime-error';
export type { Diagnostic, DiagnosticCode, Phase } from './errors/diagnostic';
export { phaseOf } from './errors/diagnostic';
export { MESSAGES, renderMessage } from './errors/messages';
export { formatDiagnostic, type FormatOptions } from './errors/format';

export { runSource, type RunResult } from './run';
