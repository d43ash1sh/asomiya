import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse, toPython } from '../../src/index';
import { highlightPython, splitPython } from '../../website/src/playground/python-highlight';
import { translateProgram } from '../../website/src/playground/runner';
import { CASES } from './cases';
import { compare, hasPython, type Case, type Mismatch } from './differential';
import { generate } from './generate';

const python = hasPython();

function report(mismatches: readonly Mismatch[]): string {
  return mismatches
    .slice(0, 3)
    .map(
      (m) =>
        `${m.name}\n${m.source}\nasomiya: ${JSON.stringify(m.asomiya)}\npython: ${JSON.stringify(m.got)}`,
    )
    .join('\n\n');
}

describe('translation to Python', () => {
  it('writes plain Python where Python behaves the same', () => {
    const out = toPython(
      parse('ধৰা ক = ১\nযেতিয়ালৈকে (ক <= ৫) {\n    কোৱা("সংখ্যা: " + পাঠ(ক))\n    ক = ক + ১\n}'),
    );
    expect(out).toContain(
      'ক = 1.0\nwhile ক <= 5.0:\n    print("সংখ্যা: " + text(ক))\n    ক = ক + 1.0',
    );
  });

  it('only includes the helpers a program needs', () => {
    expect(toPython(parse('কোৱা("নমস্কাৰ")'))).not.toContain('def ');
    const out = toPython(parse('কোৱা(-7 % 3)'));
    expect(out).toContain('def remainder');
    expect(out).not.toContain('def graphemes');
  });

  it('renames names that mean something else in Python', () => {
    const out = toPython(parse('ধৰা print = 1\nধৰা None = 2\nকোৱা(print + None)'));
    expect(out).toMatch(/print_2 = 1\.0/);
    expect(out).toMatch(/None_2 = 2\.0/);
  });

  it('follows the digit setting', () => {
    expect(toPython(parse('কোৱা(১)'), { digits: 'ascii' })).toContain('DIGIT_TABLE = {}');
    expect(toPython(parse('kowa(1)'))).toContain('DIGIT_TABLE = {}');
    expect(toPython(parse('কোৱা(১)'))).toContain('"০১২৩৪৫৬৭৮৯"');
  });

  it('reports syntax errors instead of translating (playground)', () => {
    const result = translateProgram('কোৱা(', { lang: 'en', digits: 'auto' });
    expect(result.python).toBeNull();
    expect(result.error).toContain('P0');
  });
});

describe('translation limits', () => {
  const code = (source: string): string | undefined => {
    try {
      toPython(parse(source));
      return undefined;
    } catch (error) {
      return (error as { diagnostic?: { code: string } }).diagnostic?.code;
    }
  };
  const loops = (n: number): string =>
    'ধৰা ক = ০\n' + 'যেতিয়ালৈকে (ক < ১) {\n'.repeat(n) + 'ক = ক + ১\n' + '}\n'.repeat(n);

  it('stays fast with thousands of lists', () => {
    const source = 'ধৰা ক = []\n' + 'ক = ক + [[১]]\n'.repeat(5000) + 'কোৱা(দৈৰ্ঘ্য(ক))';
    const start = performance.now();
    expect(toPython(parse(source))).toContain('print(');
    expect(performance.now() - start).toBeLessThan(5000);
  });

  it('refuses what Python itself cannot run, with an error code', () => {
    expect(code(loops(20))).toBeUndefined();
    expect(code(loops(21))).toBe('P012');
    expect(
      code('ধৰা ক = ১\n' + 'যদি (ক > ০) {\n'.repeat(120) + 'কোৱা(ক)\n' + '}\n'.repeat(120)),
    ).toBe('P012');
    const calls = (n: number): string =>
      'ফাংচন ফ(ক) { ঘূৰাইদিয়া ক }\nকোৱা(' + 'ফ('.repeat(n) + '১' + ')'.repeat(n) + ')';
    expect(code(calls(150))).toBeUndefined();
    expect(code(calls(250))).toBe('P012');
  });

  it('reports a very long expression as an error, not a crash', () => {
    expect(code('ধৰা ক = "ক"\nকোৱা(ক' + ' + ক'.repeat(5000) + ')')).toBe('P012');
  });
});

describe('Python highlighting (playground)', () => {
  it('splits the helpers from the program', () => {
    const parts = splitPython(toPython(parse('কোৱা(-7 % 3)')));
    expect(parts.helpers).toContain('def remainder');
    expect(parts.program).toBe('print(text(remainder(-7.0, 3.0)))\n');
  });

  it('keeps every character', () => {
    const source = toPython(parse('ফাংচন f(x) { ঘূৰাইদিয়া x + "ক" }\nকোৱা(f("a"), সঁচা, খালী)'));
    expect(
      highlightPython(source)
        .map((t) => t.text)
        .join(''),
    ).toBe(source);
  });

  it('marks keywords, strings, numbers and comments', () => {
    const tokens = highlightPython('def f(x):  # hi\n    return "a" + 1.5 if True else None');
    const cls = (text: string): string | undefined => tokens.find((t) => t.text === text)?.cls;
    expect(cls('def')).toBe('tok-kw');
    expect(cls('f')).toBe('tok-call');
    expect(cls('# hi')).toBe('tok-com');
    expect(cls('"a"')).toBe('tok-str');
    expect(cls('1.5')).toBe('tok-num');
    expect(cls('True')).toBe('tok-lit');
  });
});

/**
 * The real test: every program prints exactly the same in Asomiya and, translated, in Python
 * (and fails at the same point if it fails). Needs python3.
 */
describe.skipIf(!python)('Python prints exactly what Asomiya prints', () => {
  it('for the hand-written edge cases', () => {
    const result = compare(CASES);
    expect(result.skippedNames).toEqual([]);
    expect(result.mismatches, report(result.mismatches)).toEqual([]);
  });

  it('for the examples', () => {
    const dir = new URL('../../examples/', import.meta.url);
    const cases: Case[] = readdirSync(dir)
      .filter((f) => f.endsWith('.asom'))
      .flatMap((file) => {
        const source = readFileSync(new URL(file, dir), 'utf8');
        return (['auto', 'assamese', 'ascii'] as const).map((digits) => ({
          name: `${file} (${digits})`,
          source,
          stdin: 'ৰীতা\n',
          digits,
        }));
      });
    const result = compare(cases);
    expect(result.compared).toBe(cases.length);
    expect(result.mismatches, report(result.mismatches)).toEqual([]);
  });

  it('for 1500 random programs', () => {
    const cases: Case[] = [];
    for (let seed = 1; seed <= 1500; seed++) {
      const g = generate(seed);
      const digits = (['auto', 'assamese', 'ascii'] as const)[seed % 3] ?? 'auto';
      cases.push({ name: `seed ${seed}`, source: g.source, stdin: g.stdin, digits });
    }
    const result = compare(cases);
    expect(result.compared).toBeGreaterThan(1400);
    expect(result.mismatches, report(result.mismatches)).toEqual([]);
  }, 60_000);
});
