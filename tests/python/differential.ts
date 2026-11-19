import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { AsomiyaError, Interpreter, parse } from '../../src/index';
import { toPython } from '../../src/python/translate';
import type { DigitSetting } from '../../src/runtime/values';

const MUTATIONS: [string, string][] = (process.env.ASOMIYA_MUTATE ?? '')
  .split('|')
  .filter(Boolean)
  .map((m) => m.split('=>') as [string, string]);

/** Asomiya's safety limits; the Python translation deliberately doesn't copy them. */
export const LIMIT_CODES = new Set(['R008', 'R009', 'R018', 'R019']);

export interface Outcome {
  readonly output: string;
  /** Error code, or null if the program finished. */
  readonly error: string | null;
}

/** stdin as the CLI reads it: lines split on \n, a trailing \r dropped, no empty last line. */
function lineReader(stdin: string): () => string | null {
  const lines = stdin.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return () => {
    const line = lines.shift();
    return line === undefined ? null : line.replace(/\r$/, '');
  };
}

export function runAsomiya(source: string, stdin: string, digits: DigitSetting = 'auto'): Outcome {
  let output = '';
  const interpreter = new Interpreter({
    write: (t) => {
      output += t;
    },
    readLine: lineReader(stdin),
    maxSteps: 300_000,
    digits,
  });
  try {
    interpreter.run(parse(source));
    return { output, error: null };
  } catch (error) {
    if (error instanceof AsomiyaError) return { output, error: error.diagnostic.code };
    throw error;
  }
}

export interface PythonOutcome {
  readonly output: string;
  readonly error: { readonly type: string; readonly message: string } | null;
}

const RUNNER = fileURLToPath(new URL('./run_batch.py', import.meta.url));

export function hasPython(): boolean {
  const result = spawnSync('python3', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

export function runPython(jobs: readonly { source: string; stdin: string }[]): PythonOutcome[] {
  const result = spawnSync('python3', ['-I', RUNNER], {
    input: JSON.stringify(jobs),
    encoding: 'utf8',
    maxBuffer: 1 << 30,
  });
  if (result.status !== 0) throw new Error(`python3 failed: ${result.stderr}`);
  return JSON.parse(result.stdout) as PythonOutcome[];
}

export interface Case {
  readonly name: string;
  readonly source: string;
  readonly stdin: string;
  readonly digits?: DigitSetting;
}

export interface Mismatch {
  readonly name: string;
  readonly source: string;
  readonly python: string;
  readonly asomiya: Outcome;
  readonly got: PythonOutcome;
}

/**
 * Runs every case in Asomiya and, translated, in Python. Returns the cases whose output or
 * success differ. Cases that hit a parse error or a safety limit are skipped (counted).
 */
export function compare(cases: readonly Case[]): {
  mismatches: Mismatch[];
  compared: number;
  errors: number;
  skipped: number;
  skippedNames: string[];
} {
  const jobs: { source: string; stdin: string }[] = [];
  const kept: { c: Case; python: string; asomiya: Outcome }[] = [];
  const skippedNames: string[] = [];
  for (const c of cases) {
    let program;
    try {
      program = parse(c.source);
    } catch (error) {
      skippedNames.push(`${c.name}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    const asomiya = runAsomiya(c.source, c.stdin, c.digits);
    if (asomiya.error !== null && LIMIT_CODES.has(asomiya.error)) {
      skippedNames.push(`${c.name}: ${asomiya.error}`);
      continue;
    }
    let python = toPython(program, c.digits === undefined ? {} : { digits: c.digits });
    // Self-test of the harness: a deliberately broken translation must be caught.
    for (const [from, to] of MUTATIONS) python = python.replace(from, to);
    jobs.push({ source: python, stdin: c.stdin });
    kept.push({ c, python, asomiya });
  }
  const results = runPython(jobs);
  const mismatches: Mismatch[] = [];
  let errors = 0;
  kept.forEach(({ c, python, asomiya }, i) => {
    const got = results[i];
    if (got === undefined) throw new Error('missing result');
    if (asomiya.error !== null) errors++;
    const sameOutput = got.output === asomiya.output;
    const sameEnding =
      (asomiya.error === null) === (got.error === null) && got.error?.type !== 'SyntaxError';
    if (!sameOutput || !sameEnding) {
      mismatches.push({ name: c.name, source: c.source, python, asomiya, got });
    }
  });
  return { mismatches, compared: kept.length, errors, skipped: skippedNames.length, skippedNames };
}
