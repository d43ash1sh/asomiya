import type { Span } from '../lexer/token';
import type { Diagnostic, DiagnosticCode, DiagnosticParams } from './diagnostic';
import { renderMessage } from './messages';

/** Base class of every error the language reports. The `diagnostic` carries all structured data. */
export class AsomiyaError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(diagnostic: Diagnostic, message: string) {
    super(message);
    this.name = 'AsomiyaError';
    this.diagnostic = diagnostic;
  }
}

export function makeDiagnostic<C extends DiagnosticCode>(
  code: C,
  params: DiagnosticParams[C],
  span: Span,
  incomplete = false,
): { diagnostic: Diagnostic<C>; message: string } {
  return {
    diagnostic: { code, params, span, incomplete },
    message: `[${code}] ${renderMessage(code, params, 'en')}`,
  };
}
