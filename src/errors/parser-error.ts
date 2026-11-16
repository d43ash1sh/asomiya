import type { Span } from '../lexer/token';
import { AsomiyaError, makeDiagnostic } from './asomiya-error';
import type { DiagnosticParams, ParserCode } from './diagnostic';

export class ParserError extends AsomiyaError {
  override readonly name = 'ParserError';
}

export function parserError<C extends ParserCode>(
  code: C,
  params: DiagnosticParams[C],
  span: Span,
  incomplete = false,
): ParserError {
  const { diagnostic, message } = makeDiagnostic(code, params, span, incomplete);
  return new ParserError(diagnostic, message);
}
