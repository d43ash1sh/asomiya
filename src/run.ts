import { AsomiyaError } from './errors/asomiya-error';
import { parse } from './parser/parser';
import { Interpreter, type InterpreterOptions } from './runtime/interpreter';
import { MAX_OUTPUT_LENGTH } from './runtime/limits';

export interface RunResult {
  /** Everything the program printed (including output produced before an error). */
  readonly output: string;
  readonly error: AsomiyaError | null;
}

/**
 * Lexes, parses and runs `source` in a fresh interpreter, capturing output. Output is kept in
 * memory, so it is limited to MAX_OUTPUT_LENGTH characters (R022) unless `maxOutput` says otherwise.
 * Language errors are returned, not thrown; anything else is a bug and is re-thrown.
 */
export function runSource(
  source: string,
  options: Omit<InterpreterOptions, 'write'> = {},
): RunResult {
  let output = '';
  const interpreter = new Interpreter({
    maxOutput: MAX_OUTPUT_LENGTH,
    ...options,
    write: (text) => {
      output += text;
    },
  });
  try {
    interpreter.run(parse(source));
    return { output, error: null };
  } catch (error) {
    if (error instanceof AsomiyaError) return { output, error };
    throw error;
  }
}
