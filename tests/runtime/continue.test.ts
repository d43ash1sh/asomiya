import { describe, expect, it } from 'vitest';
import { failCode, run, types } from '../helpers';

describe('আগবাঢ়া (continue)', () => {
  it('lexes in both scripts', () => {
    expect(types('আগবাঢ়া aagbara agbara')).toEqual(['Continue', 'Continue', 'Continue']);
    // Romanised keywords are lower-case only; `Agbara` is an ordinary name.
    expect(types('Agbara')).toEqual(['Identifier']);
  });

  it('skips the rest of the iteration', () => {
    const source =
      'dhora i = 0\njetialoike (i < 5) {\n  i = i + 1\n  jodi (i == 3) { aagbara }\n  kowa(i)\n}';
    expect(run(source)).toBe('1\n2\n4\n5\n');
  });

  it('only affects the innermost loop', () => {
    const source = [
      'ধৰা ক = ০',
      'যেতিয়ালৈকে (ক < ২) {',
      '  ক = ক + ১',
      '  ধৰা খ = ০',
      '  যেতিয়ালৈকে (খ < ৩) {',
      '    খ = খ + ১',
      '    যদি (খ == ২) { আগবাঢ়া }',
      '    কোৱা(ক, খ)',
      '  }',
      '}',
    ].join('\n');
    expect(run(source)).toBe('১ ১\n১ ৩\n২ ১\n২ ৩\n');
  });

  it('is a syntax error outside a loop, including in a function inside a loop', () => {
    expect(failCode('আগবাঢ়া')).toBe('P011');
    expect(failCode('jetialoike (xosa) { fangchon f() { aagbara } rokha }')).toBe('P011');
  });

  it('cannot be used as a name', () => {
    expect(failCode('ধৰা আগবাঢ়া = ১')).toBe('P009');
  });
});
