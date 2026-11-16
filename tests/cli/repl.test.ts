import { describe, expect, it } from 'vitest';
import { ReplSession, runRepl } from '../../src/cli/repl';
import type { CliIO, ExecutionSettings } from '../../src/cli/run-file';

const SETTINGS: ExecutionSettings = {
  lang: 'as',
  digits: 'assamese',
  maxSteps: 100_000,
  maxCallDepth: 100,
};

/** A session whose program output is collected, with optional scripted input for সোধা. */
function session(input: string[] = []) {
  const out = { text: '' };
  const s = new ReplSession(SETTINGS, {
    stdout: (t) => {
      out.text += t;
    },
    readLine: () => input.shift() ?? null,
  });
  return { s, out };
}

/** Runs the whole REPL loop over scripted lines. */
function repl(lines: string[]) {
  const input = [...lines];
  let stdout = '';
  let stderr = '';
  const io: CliIO = {
    stdout: (t) => (stdout += t),
    stderr: (t) => (stderr += t),
    readLine: () => input.shift() ?? null,
  };
  const code = runRepl(SETTINGS, io);
  return { stdout, stderr, code };
}

describe('ReplSession', () => {
  it('echoes expression values, quoting text, and not খালী', () => {
    const { s } = session();
    expect(s.feed('১ + ২')).toEqual({ kind: 'done', echo: '৩', error: null });
    expect(s.feed('"ক" + "খ"')).toEqual({ kind: 'done', echo: '"কখ"', error: null });
    expect(s.feed('খালী')).toEqual({ kind: 'done', echo: null, error: null });
  });

  it('streams program output while the statement runs', () => {
    const { s, out } = session();
    expect(s.feed('কোৱা("নমস্কাৰ পৃথিৱী!")')).toEqual({ kind: 'done', echo: null, error: null });
    expect(out.text).toBe('নমস্কাৰ পৃথিৱী!\n');
  });

  it('keeps variables between inputs and allows re-declaration', () => {
    const { s, out } = session();
    s.feed('ধৰা ক = ১');
    s.feed('ধৰা ক = ক + ১');
    s.feed('কোৱা(ক)');
    expect(out.text).toBe('২\n');
  });

  it('waits for more lines while a block is open', () => {
    const { s } = session();
    expect(s.feed('ফাংচন দুগুণ(x) {').kind).toBe('continue');
    expect(s.isContinuing).toBe(true);
    expect(s.feed('  ঘূৰাইদিয়া x * ২').kind).toBe('continue');
    expect(s.feed('}').kind).toBe('done');
    expect(s.feed('দুগুণ(২১)')).toMatchObject({ echo: '৪২' });
  });

  it('reports errors and recovers', () => {
    const { s } = session();
    const result = s.feed('কোৱা(অজ্ঞাত)');
    expect(result.kind === 'done' && result.error).toContain('[R001]');
    expect(s.feed('১')).toMatchObject({ echo: '১', error: null });
  });

  it('.বাতিল / .cancel discards unfinished input', () => {
    const { s } = session();
    s.feed('যদি (সঁচা) {');
    expect(s.feed('.বাতিল')).toEqual({ kind: 'done', echo: null, error: null });
    expect(s.isContinuing).toBe(false);
    s.feed('যদি (সঁচা) {');
    s.feed('.cancel');
    expect(s.feed('৫')).toMatchObject({ echo: '৫' });
  });

  it('understands .exit/.প্ৰস্থান and .help/.সহায়', () => {
    const { s } = session();
    expect(s.feed('.exit').kind).toBe('exit');
    expect(s.feed('.প্ৰস্থান').kind).toBe('exit');
    expect(s.feed('.সহায়')).toMatchObject({ kind: 'done', error: null });
  });

  it('reads input with সোধা from the same input as the REPL', () => {
    const { s, out } = session(['দেবাশীষ']);
    s.feed('ধৰা নাম = সোধা("নাম? ")');
    s.feed('কোৱা("নমস্কাৰ, " + নাম)');
    expect(out.text).toBe('নাম? নমস্কাৰ, দেবাশীষ\n');
  });

  it('protects against infinite loops', () => {
    const result = session().s.feed('যেতিয়ালৈকে (সঁচা) { }');
    expect(result.kind === 'done' && result.error).toContain('[R008]');
  });

  it('reports an un-displayable result as an error instead of crashing', () => {
    // Regression: the echo was computed outside the interpreter's error handling, so a
    // deeply nested value threw a raw RangeError out of the REPL.
    const { s } = session();
    s.feed('ধৰা ল = []');
    s.feed('ধৰা i = ০');
    s.feed('যেতিয়ালৈকে (i < ২০০০০) { ল = [ল]; i = i + ১ }');
    const result = s.feed('ল');
    expect(result.kind === 'done' && result.error).toContain('[R018]');
  });
});

describe('runRepl', () => {
  it('prints the banner, prompts, output and a goodbye at end of input', () => {
    const { stdout, stderr, code } = repl(['কোৱা("নমস্কাৰ")', '১ + ১']);
    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toContain('অসমীয়া> নমস্কাৰ\n');
    expect(stdout).toContain('অসমীয়া> ২\n');
    expect(stdout.trimEnd().endsWith('বিদায়!')).toBe(true);
  });

  it('shows the continuation prompt inside a block', () => {
    const { stdout } = repl(['যদি (সঁচা) {', 'কোৱা("ক")', '}']);
    expect(stdout).toContain('অসমীয়া>    ...>    ...> ক\n');
  });

  it('writes errors to stderr and keeps going', () => {
    const { stdout, stderr, code } = repl(['১ / ০', 'কোৱা("পিছত")']);
    expect(stderr).toContain('চলোৱাৰ সময়ৰ ভুল [R004]');
    expect(stdout).toContain('পিছত');
    expect(code).toBe(0);
  });

  it('stops at .প্ৰস্থান without reading further', () => {
    const { stdout } = repl(['.প্ৰস্থান', 'কোৱা("নহয়")']);
    expect(stdout).not.toContain('নহয়');
  });
});
