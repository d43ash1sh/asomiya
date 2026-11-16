import type { Span } from '../lexer/token';
import { AsomiyaError, makeDiagnostic } from './asomiya-error';
import type { DiagnosticParams, LexerCode } from './diagnostic';

export class LexerError extends AsomiyaError {
  override readonly name = 'LexerError';
}

export function lexerError<C extends LexerCode>(
  code: C,
  params: DiagnosticParams[C],
  span: Span,
  incomplete = false,
): LexerError {
  const { diagnostic, message } = makeDiagnostic(code, params, span, incomplete);
  return new LexerError(diagnostic, message);
}
