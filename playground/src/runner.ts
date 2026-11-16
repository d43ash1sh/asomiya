import {
  AsomiyaError,
  Interpreter,
  formatDiagnostic,
  parse,
  type DigitStyle,
  type MessageLanguage,
} from '../../src/index';

export interface RunSettings {
  readonly lang: MessageLanguage;
  readonly digits: DigitStyle;
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
