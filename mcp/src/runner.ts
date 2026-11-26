// What the tools do, as plain functions (no MCP types), so they are easy to test.
import { formatDiagnostic } from '../../src/errors/format';
import { phaseOf, type Diagnostic, type Phase } from '../../src/errors/diagnostic';
import { renderMessage } from '../../src/errors/messages';
import type { MessageLanguage } from '../../src/language/types';
import { parse } from '../../src/parser/parser';
import { toPython } from '../../src/python/translate';
import { runSource } from '../../src/run';
import { AsomiyaError } from '../../src/errors/asomiya-error';
import type { DigitSetting } from '../../src/runtime/values';
import { encodeSource, MAX_SHARED_LENGTH } from '../../website/src/playground/share';

/** Longest program the tools accept (characters). The playground's share links stop at ~150 KB. */
export const MAX_CODE_LENGTH = 100_000;
/** Most input lines for সোধা, and the longest line. */
export const MAX_INPUT_LINES = 1_000;
export const MAX_INPUT_LINE_LENGTH = 10_000;
/** Output kept in a result (characters); a model doesn't need megabytes of it. */
export const MAX_OUTPUT_LENGTH = 20_000;

export const PLAYGROUND_URL = 'https://asomiya.codes/playground/';

export interface ProblemReport {
  readonly code: string;
  readonly phase: Phase;
  readonly line: number;
  readonly column: number;
  /** The message in the requested language. */
  readonly message: string;
  readonly messageAs: string;
  readonly messageEn: string;
  /** The message with the source line and a caret, as the CLI prints it. */
  readonly formatted: string;
}

function report(d: Diagnostic, source: string, lang: MessageLanguage): ProblemReport {
  const messageAs = renderMessage(d.code, d.params, 'as');
  const messageEn = renderMessage(d.code, d.params, 'en');
  return {
    code: d.code,
    phase: phaseOf(d.code),
    line: d.span.start.line,
    column: d.span.start.column,
    message: lang === 'as' ? messageAs : messageEn,
    messageAs,
    messageEn,
    formatted: formatDiagnostic(d, { lang, source, fileName: 'program.asom' }),
  };
}

/** A link that opens the program in the asomiya.codes playground, or null if it is too long. */
export function playgroundLink(code: string): string | null {
  const encoded = encodeSource(code);
  return encoded.length > MAX_SHARED_LENGTH ? null : `${PLAYGROUND_URL}#code=${encoded}`;
}

function clip(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_OUTPUT_LENGTH) return { text, truncated: false };
  // Don't cut a surrogate pair in half.
  let end = MAX_OUTPUT_LENGTH;
  const last = text.charCodeAt(end - 1);
  if (last >= 0xd800 && last <= 0xdbff) end--;
  return { text: text.slice(0, end), truncated: true };
}

export interface RunOptions {
  readonly input?: readonly string[] | undefined;
  readonly digits?: DigitSetting | undefined;
  readonly lang?: MessageLanguage | undefined;
  /** For tests; the default is the interpreter's own budget. */
  readonly maxSteps?: number | undefined;
}

export interface RunReport {
  readonly ok: boolean;
  readonly output: string;
  readonly outputTruncated: boolean;
  readonly error: ProblemReport | null;
  readonly inputLinesUsed: number;
  readonly playgroundUrl: string | null;
}

export function runProgram(code: string, options: RunOptions = {}): RunReport {
  const lines = options.input ?? [];
  let next = 0;
  const result = runSource(code, {
    readLine: () => (next < lines.length ? (lines[next++] ?? null) : null),
    ...(options.digits === undefined ? {} : { digits: options.digits }),
    ...(options.maxSteps === undefined ? {} : { maxSteps: options.maxSteps }),
  });
  const { text, truncated } = clip(result.output);
  return {
    ok: result.error === null,
    output: text,
    outputTruncated: truncated,
    error:
      result.error === null ? null : report(result.error.diagnostic, code, options.lang ?? 'en'),
    inputLinesUsed: next,
    playgroundUrl: playgroundLink(code),
  };
}

export interface CheckReport {
  readonly ok: boolean;
  readonly error: ProblemReport | null;
}

/** Lexes and parses without running. Runtime errors (R…) only show up when the program runs. */
export function checkProgram(code: string, lang: MessageLanguage = 'en'): CheckReport {
  try {
    parse(code);
    return { ok: true, error: null };
  } catch (error) {
    if (error instanceof AsomiyaError) {
      return { ok: false, error: report(error.diagnostic, code, lang) };
    }
    throw error;
  }
}

export interface PythonReport {
  readonly ok: boolean;
  readonly python: string | null;
  readonly error: ProblemReport | null;
}

export function translateProgram(
  code: string,
  options: { digits?: DigitSetting | undefined; lang?: MessageLanguage | undefined } = {},
): PythonReport {
  try {
    const python = toPython(
      parse(code),
      options.digits === undefined ? {} : { digits: options.digits },
    );
    return { ok: true, python, error: null };
  } catch (error) {
    if (error instanceof AsomiyaError) {
      return {
        ok: false,
        python: null,
        error: report(error.diagnostic, code, options.lang ?? 'en'),
      };
    }
    throw error;
  }
}

/** The error as text for the model: the CLI-style message plus the other language's wording. */
export function describeProblem(p: ProblemReport, lang: MessageLanguage): string {
  const other = lang === 'as' ? `English: ${p.messageEn}` : `অসমীয়া: ${p.messageAs}`;
  return `${p.formatted}\n${other}`;
}
