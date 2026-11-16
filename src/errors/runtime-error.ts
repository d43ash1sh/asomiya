import type { Span } from '../lexer/token';
import { AsomiyaError, makeDiagnostic } from './asomiya-error';
import type { DiagnosticParams, RuntimeCode } from './diagnostic';

export class RuntimeError extends AsomiyaError {
  override readonly name = 'RuntimeError';
}

export function runtimeError<C extends RuntimeCode>(
  code: C,
  params: DiagnosticParams[C],
  span: Span,
): RuntimeError {
  const { diagnostic, message } = makeDiagnostic(code, params, span);
  return new RuntimeError(diagnostic, message);
}
