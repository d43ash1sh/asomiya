import { expect } from 'vitest';
import type { DiagnosticCode } from '../src/errors/diagnostic';
import { tokenize } from '../src/lexer/lexer';
import type { TokenType } from '../src/lexer/token-types';
import { runSource } from '../src/run';
import type { InterpreterOptions } from '../src/runtime/interpreter';

type Options = Omit<InterpreterOptions, 'write'>;

/** Runs a program that must succeed; returns its output. */
export function run(source: string, options: Options = {}): string {
  const result = runSource(source, options);
  if (result.error !== null) {
    throw new Error(`Unexpected error: ${result.error.message}`);
  }
  return result.output;
}

/** Output lines of a successful run. */
export function lines(source: string, options: Options = {}): string[] {
  return run(source, options).trimEnd().split('\n');
}

/** Runs a program that must fail; returns the diagnostic and any output printed before it. */
export function fail(source: string, options: Options = {}) {
  const result = runSource(source, options);
  expect(result.error, 'expected the program to fail').not.toBeNull();
  if (result.error === null) throw new Error('unreachable');
  return { diagnostic: result.error.diagnostic, output: result.output, error: result.error };
}

export function failCode(source: string, options: Options = {}): DiagnosticCode {
  return fail(source, options).diagnostic.code;
}

/** Token types of `source`, without the trailing EOF. */
export function types(source: string): TokenType[] {
  return tokenize(source)
    .map((t) => t.type)
    .filter((t) => t !== 'EOF');
}
