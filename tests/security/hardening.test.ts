import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '../../src/errors/format';
import { graphemes, isHiddenControl, visibleControls } from '../../src/lexer/unicode';
import { fail, run } from '../helpers';

const reference = (text: string): string[] =>
  Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    (s) => s.segment,
  );

describe('grapheme splitting', () => {
  it('matches Intl.Segmenter across chunk boundaries', () => {
    const samples = [
      'অসমীয়া ক্ষ ক্‍ষ '.repeat(80),
      '👨‍👩‍👧‍👦🇮🇳🇮🇳a\r\nb'.repeat(60),
      'é'.repeat(300),
      'x'.repeat(255) + '👨‍👩‍👧‍👦' + 'y'.repeat(300),
      'abc\tdef'.repeat(100),
    ];
    for (const text of samples) expect(graphemes(text)).toEqual(reference(text));
  });

  it('keeps an absurdly long single cluster intact enough to count once per chunk', () => {
    const zalgo = 'a' + '́'.repeat(1000);
    expect(graphemes(zalgo).join('')).toBe(zalgo);
  });

  it('is fast on long text (was quadratic: 200 000 characters took ~10 s)', () => {
    const long = 'ক'.repeat(300_000);
    const started = performance.now();
    expect(graphemes(long)).toHaveLength(300_000);
    expect(performance.now() - started).toBeLessThan(3000);
  });
});

describe('input size', () => {
  it('rejects an input line longer than the text limit', () => {
    const huge = 'y'.repeat(10_000_001);
    expect(fail('kowa(doirghyo(xudha()))', { readLine: () => huge }).diagnostic.code).toBe('R019');
  });
});

describe('hidden control characters (Trojan Source, terminal escapes)', () => {
  it('rejects them in text and comments', () => {
    for (const source of [
      'kowa("\u001b[2J")',
      'kowa("abc‮cba")',
      '// ⁦ hidden\nkowa(1)',
      '/* ‮ */ kowa(1)',
      'kowa("a\u0000b")',
    ]) {
      expect(fail(source).diagnostic.code, JSON.stringify(source)).toBe('L008');
    }
  });

  it('still allows tabs, Assamese joiners and emoji in text', () => {
    expect(run('kowa("a\tb", "ক্‍ষ", "👨‍👩‍👧")')).toBe('a\tb ক্‍ষ 👨‍👩‍👧\n');
  });

  it('allows ZWJ/ZWNJ in names only after Assamese letters', () => {
    expect(run('ধৰা ক্‍ষ = ১\nকোৱা(ক্‍ষ)')).toBe('১\n');
    expect(fail('dhora na‍aam = 1').diagnostic.code).toBe('L001');
  });

  it('never prints raw controls in diagnostics', () => {
    const source = 'kowa(ab\u001b[31mcd)';
    const { diagnostic } = fail(source);
    const text = formatDiagnostic(diagnostic, { lang: 'en', source, fileName: 'x\u001b[2J.asom' });
    expect(Array.from(text).some((ch) => isHiddenControl(ch))).toBe(false);
    expect(text).toContain('␛');
  });

  it('visibleControls keeps one code point per character, so carets line up', () => {
    expect(Array.from(visibleControls('a\u001b‮b'))).toHaveLength(4);
  });

  it('clips huge names in messages', () => {
    const name = 'q'.repeat(100_000);
    const source = `kowa(${name})`;
    const text = formatDiagnostic(fail(source).diagnostic, { lang: 'en', source });
    expect(text.length).toBeLessThan(1000);
  });
});

describe('output size (R022)', () => {
  const endless = 'যেতিয়ালৈকে (সঁচা) { কোৱা("' + 'আ'.repeat(5000) + '") }';

  it('stops a print loop once the buffered output passes the limit', async () => {
    const { runSource } = await import('../../src/run');
    const { MAX_OUTPUT_LENGTH } = await import('../../src/runtime/limits');
    const result = runSource(endless);
    expect(result.error?.diagnostic.code).toBe('R022');
    expect(result.output.length).toBeLessThanOrEqual(MAX_OUTPUT_LENGTH);
    expect(result.output.length).toBeGreaterThan(MAX_OUTPUT_LENGTH - 6000);
  });

  it('counts prompts written by সোধা too', async () => {
    const { runSource } = await import('../../src/run');
    const result = runSource('যেতিয়ালৈকে (সঁচা) { সোধা("' + 'ক'.repeat(5000) + '") }', {
      readLine: () => 'x',
    });
    expect(result.error?.diagnostic.code).toBe('R022');
  });

  it('is off for hosts that stream output (the terminal)', async () => {
    const { Interpreter } = await import('../../src/runtime/interpreter');
    const { parse } = await import('../../src/parser/parser');
    let written = 0;
    const interpreter = new Interpreter({
      write: (text) => {
        written += text.length;
      },
      maxSteps: 2_000,
    });
    expect(() => interpreter.run(parse(endless))).toThrow(/R008|step limit/);
    expect(written).toBeGreaterThan(1_000_000);
  });

  it('applies in the playground and the MCP server', async () => {
    const { runProgram } = await import('../../website/src/playground/runner');
    expect(runProgram(endless, { lang: 'en', digits: 'auto', stdin: '' }).error).toContain('R022');
    const mcp = await import('../../mcp/src/runner');
    const report = mcp.runProgram(endless);
    expect(report.ok).toBe(false);
    expect(JSON.stringify(report.error)).toContain('R022');
    expect(report.output.length).toBeLessThanOrEqual(mcp.MAX_OUTPUT_LENGTH + 200);
  });
});
