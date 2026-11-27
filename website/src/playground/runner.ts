import {
  AsomiyaError,
  Interpreter,
  formatDiagnostic,
  parse,
  type DigitSetting,
  type MessageLanguage,
} from '../../../src/index';
import { MAX_OUTPUT_LENGTH } from '../../../src/runtime/limits';
import { toPython } from '../../../src/python/translate';

export interface RunSettings {
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
  /** Text that সোধা reads from, one line per call. */
  readonly stdin: string;
}

export interface RunOutcome {
  /** Everything the program printed, including output before an error. */
  readonly output: string;
  /** A formatted diagnostic, or null if the program finished. */
  readonly error: string | null;
}

/**
 * Runs a program with the real interpreter. No DOM access, so it can be unit-tested.
 * The browser has no terminal to read from, so `সোধা` consumes the lines of `stdin` in order and
 * returns খালী when they run out.
 */
export function runProgram(source: string, settings: RunSettings): RunOutcome {
  const lines = settings.stdin === '' ? [] : settings.stdin.replace(/\r\n?/g, '\n').split('\n');
  let output = '';
  const interpreter = new Interpreter({
    write: (text) => {
      output += text;
    },
    readLine: () => lines.shift() ?? null,
    digits: settings.digits,
    // Output is kept in memory and shown in the page, so a runaway print loop must stop early.
    maxOutput: MAX_OUTPUT_LENGTH,
  });
  try {
    interpreter.run(parse(source));
    return { output, error: null };
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const message = formatDiagnostic(error.diagnostic, {
      lang: settings.lang,
      source,
      fileName: 'program.asom',
    });
    return { output, error: message };
  }
}

export interface Translation {
  /** The equivalent Python program, or null if the source can't be parsed. */
  readonly python: string | null;
  readonly error: string | null;
}

/** Translates a program to Python, using the same digit setting as running it. */
export function translateProgram(
  source: string,
  settings: { readonly lang: MessageLanguage; readonly digits: DigitSetting },
): Translation {
  try {
    return { python: toPython(parse(source), { digits: settings.digits }), error: null };
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    const message = formatDiagnostic(error.diagnostic, {
      lang: settings.lang,
      source,
      fileName: 'program.asom',
    });
    return { python: null, error: message };
  }
}
