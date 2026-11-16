import type { Span } from '../lexer/token';
import type { ValueKind } from '../language/types';

/** What the parser actually saw, for "expected X but found Y" messages. */
export type Found =
  | { readonly kind: 'eof' }
  | { readonly kind: 'newline' }
  | { readonly kind: 'token'; readonly text: string };

export type NameRole = 'variable' | 'function' | 'parameter';

/** Parameters for every diagnostic code. Adding a code here forces a message for it in messages.ts. */
export interface DiagnosticParams {
  // ── lexical ──────────────────────────────────────────────
  L001: { readonly char: string };
  L002: Record<string, never>;
  L003: Record<string, never>;
  L004: { readonly sequence: string };
  L005: { readonly text: string };
  L006: { readonly text: string };
  L007: { readonly char: string };
  // ── syntax ───────────────────────────────────────────────
  P001: { readonly expected: string; readonly found: Found };
  P002: { readonly found: Found };
  P003: Record<string, never>;
  P004: Record<string, never>;
  P005: Record<string, never>;
  P006: { readonly name: string };
  P007: { readonly found: Found };
  P008: { readonly role: NameRole; readonly found: Found };
  P009: { readonly keyword: string };
  P010: { readonly limit: number };
  // ── runtime ──────────────────────────────────────────────
  R001: { readonly name: string };
  R002: { readonly name: string };
  R003: { readonly op: string; readonly left: ValueKind; readonly right: ValueKind };
  R004: Record<string, never>;
  R005: { readonly type: ValueKind };
  R006: {
    readonly name: string;
    readonly min: number;
    readonly max: number;
    readonly got: number;
  };
  R007: { readonly type: ValueKind };
  R008: { readonly limit: number };
  R009: { readonly limit: number };
  R010: { readonly index: number; readonly length: number };
  R011: { readonly value: string };
  R012: { readonly type: ValueKind };
  R013: { readonly op: string; readonly type: ValueKind };
  R014: {
    readonly name: string;
    readonly position: number;
    readonly expected: readonly ValueKind[];
    readonly got: ValueKind;
  };
  R015: Record<string, never>;
  R016: Record<string, never>;
  R017: { readonly op: string; readonly type: ValueKind };
  R018: Record<string, never>;
  R019: { readonly type: 'string' | 'list'; readonly limit: number };
  R020: { readonly name: string };
}

export type DiagnosticCode = keyof DiagnosticParams;
export type LexerCode = Extract<DiagnosticCode, `L${string}`>;
export type ParserCode = Extract<DiagnosticCode, `P${string}`>;
export type RuntimeCode = Extract<DiagnosticCode, `R${string}`>;

export type Phase = 'lexer' | 'parser' | 'runtime';

export interface Diagnostic<C extends DiagnosticCode = DiagnosticCode> {
  readonly code: C;
  readonly params: DiagnosticParams[C];
  readonly span: Span;
  /**
   * True when the error happened only because input ended early (unclosed block, comment …).
   * The REPL uses this to ask for another line instead of reporting an error.
   */
  readonly incomplete: boolean;
}

export function phaseOf(code: DiagnosticCode): Phase {
  if (code.startsWith('L')) return 'lexer';
  if (code.startsWith('P')) return 'parser';
  return 'runtime';
}
