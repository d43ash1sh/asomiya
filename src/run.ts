import { AsomiyaError } from './errors/asomiya-error';
import { parse } from './parser/parser';
import { Interpreter, type InterpreterOptions } from './runtime/interpreter';

export interface RunResult {
  /** Everything the program printed (including output produced before an error). */
  readonly output: string;
  readonly error: AsomiyaError | null;
}

/**
 * Lexes, parses and runs `source` in a fresh interpreter, capturing output.
 * Language errors are returned, not thrown; anything else is a bug and is re-thrown.
 */
export function runSource(
  source: string,
  options: Omit<InterpreterOptions, 'write'> = {},
): RunResult {
  let output = '';
  const interpreter = new Interpreter({
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
