import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXAMPLES } from '../../website/src/playground/examples';
import { runProgram } from '../../website/src/playground/runner';
import { decodeSource, encodeSource, fromHash, toHash } from '../../website/src/playground/share';

const ROOT = resolve(import.meta.dirname, '../..');
const defaults = { lang: 'as', digits: 'assamese', stdin: '' } as const;

describe('runProgram (the playground runner)', () => {
  it('runs a program with the real interpreter', () => {
    const hello = readFileSync(join(ROOT, 'examples/hello.asom'), 'utf8');
    expect(runProgram(hello, defaults)).toEqual({
      output: 'নমস্কাৰ, পৃথিৱী!\nএই প্ৰগ্ৰামটোৰ ভাষা: অসমীয়া\nপ্ৰাপ্তবয়স্ক\n',
      error: null,
    });
  });

  it('feeds the input box to সোধা line by line, then খালী', () => {
    const program = 'কোৱা(সোধা())\nকোৱা(সোধা())\nকোৱা(সোধা())';
    const result = runProgram(program, { ...defaults, stdin: 'এক\r\nদুই' });
    expect(result.output).toBe('এক\nদুই\nখালী\n');
  });

  it('formats errors in the chosen language and keeps earlier output', () => {
    const result = runProgram('কোৱা("আগতে")\nকোৱা(১ / ০)', { ...defaults, lang: 'en' });
    expect(result.output).toBe('আগতে\n');
    expect(result.error).toContain('runtime error [R004]: Division by zero');
    expect(result.error).toContain('program.asom:2:8');
  });

  it('honours the digit style', () => {
    expect(runProgram('কোৱা(১০ + ২০)', { ...defaults, digits: 'ascii' }).output).toBe('30\n');
  });

  it('reports syntax errors', () => {
    expect(runProgram('ধৰা = ৫', defaults).error).toContain('[P008]');
  });

  it('stops infinite loops instead of freezing the page', () => {
    expect(runProgram('যেতিয়ালৈকে (সঁচা) { }', defaults).error).toContain('[R008]');
  });
});

describe('share links', () => {
  it.each(['কোৱা("নমস্কাৰ পৃথিৱী!")', '', 'ধৰা ক = ১\n\tকোৱা(ক + "😀")', 'a+b/c?d'])(
    'round-trips %j',
    (source) => {
      expect(decodeSource(encodeSource(source))).toBe(source);
      expect(fromHash(toHash(source))).toBe(source);
    },
  );

  it('produces URL-safe fragments', () => {
    expect(toHash('কোৱা("?&#/+")')).toMatch(/^#code=[A-Za-z0-9_-]*$/);
  });

  it('ignores missing or malformed fragments', () => {
    expect(fromHash('')).toBeNull();
    expect(fromHash('#other=1')).toBeNull();
    expect(fromHash('#code=%%%')).toBeNull();
    expect(fromHash('#code=' + encodeSource('ok').slice(0, 1) + '___')).toBeNull();
  });
});

describe('bundled examples', () => {
  it('includes every file in examples/, with its exact contents', () => {
    const files = readdirSync(join(ROOT, 'examples')).sort();
    expect(EXAMPLES.map((e) => e.file).sort()).toEqual(files);
    for (const example of EXAMPLES) {
      expect(example.source).toBe(readFileSync(join(ROOT, 'examples', example.file), 'utf8'));
    }
  });

  it('every bundled example runs without errors', () => {
    for (const example of EXAMPLES) {
      expect(
        runProgram(example.source, { ...defaults, stdin: example.stdin }).error,
        example.file,
      ).toBeNull();
    }
  });
});
