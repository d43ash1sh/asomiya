import { describe, expect, it } from 'vitest';
import { KEYWORD_GLOSSARY } from '../../src/language/glossary';
import { suggestRoman } from '../../src/language/roman';
import { fail, lines, run, types } from '../helpers';

describe('romanised keywords', () => {
  it('every glossary keyword has at least one Roman spelling, all lower-case ASCII', () => {
    for (const entry of KEYWORD_GLOSSARY) {
      expect(entry.roman.length, entry.word).toBeGreaterThan(0);
      for (const spelling of entry.roman) expect(spelling).toMatch(/^[a-z']+$/);
    }
  });

  it('every Roman spelling lexes to the same token as the Assamese word', () => {
    for (const entry of KEYWORD_GLOSSARY) {
      const expected = types(entry.word);
      for (const spelling of entry.roman) expect(types(spelling), spelling).toEqual(expected);
    }
  });

  it('is case-sensitive, so capitalised names such as Jodi or Misha stay ordinary names', () => {
    expect(types('jodi Jodi JODI')).toEqual(['If', 'Identifier', 'Identifier']);
    expect(run('dhora Jodi = "Jodi"\ndhora Misha = 1\nkowa(Jodi, Misha)')).toBe('Jodi 1\n');
  });

  it('runs a whole program in Roman letters', () => {
    const source = [
      'dhora n = 5',
      'fangchon karok(n) {',
      '  jodi (n <= 1) { ghuraidiya 1 } nohole { ghuraidiya n * karok(n - 1) }',
      '}',
      'dhora i = 0',
      'jetialoike (xosa) {',
      '  i = i + 1',
      '  jodi (i == 3) { rokha }',
      '}',
      'kowa(karok(n), i, khali, misa ba xosa)',
    ].join('\n');
    expect(run(source)).toBe('120 3 khali xosa\n');
  });

  it('mixes freely with Assamese script', () => {
    expect(lines('ধৰা ক = 2\njodi (ক > 1) { কোৱা("ok") }')).toEqual(['ok']);
  });

  it('keeps ordinary Latin names usable as variables', () => {
    expect(run('dhora x = 1\ndhora naam = "A"\nkowa(x, naam)')).toBe('1 A\n');
  });

  it('cannot use a Roman keyword as a variable name', () => {
    expect(fail('dhora jodi = 1').diagnostic.code).toBe('P009');
  });
});

describe('digits for romanised programs', () => {
  it('prints 0-9 when keywords are in English letters', () => {
    expect(run('dhora i = 1\nkowa("number", i + 1)')).toBe('number 2\n');
  });

  it('keeps ০-৯ for Assamese-script programs, even with ASCII digits in the source', () => {
    expect(run('ধৰা x = 1\nকোৱা(x + 1)')).toBe('২\n');
  });

  it('respects an explicit digit setting', () => {
    expect(run('kowa(5)', { digits: 'assamese' })).toBe('৫\n');
    expect(run('কোৱা(৫)', { digits: 'ascii' })).toBe('5\n');
  });
});

describe('romanised built-ins', () => {
  it('call the same functions as the Assamese names', () => {
    const source = [
      'dhora l = [1, 2]',
      'xonjojon(l, 3)',
      'kowa(doirghyo(l), prokar(l), xonkhya("৪২") + 1, path(7) + "!", purnanko(3.9))',
      'kowa(poromman(-5), axonno(2.5), xorbosso(4, 9, 2), xorbonimno(4, 9, -2))',
    ].join('\n');
    expect(run(source)).toBe('3 talika 43 7! 3\n5 3 9 -2\n');
  });

  it('xudha reads input', () => {
    expect(run('kowa(xudha())', { readLine: () => 'Oxom' })).toBe('Oxom\n');
  });
});

describe('output words for romanised programs', () => {
  it('prints xosa/misa/khali and Roman type names', () => {
    expect(run('kowa(xosa, misa, khali, [xosa])')).toBe('xosa misa khali [xosa]\n');
    expect(run('kowa(prokar(1), prokar("a"), prokar(xosa), prokar(khali), prokar([]))')).toBe(
      'xonkhya path xosa-misa khali talika\n',
    );
    expect(run('fangchon f() { }\nkowa(f)')).toBe('<fangchon f>\n');
  });

  it('keeps Assamese words for Assamese-script programs', () => {
    expect(run('কোৱা(সঁচা, খালী, প্ৰকাৰ(১))')).toBe('সঁচা খালী সংখ্যা\n');
  });
});

describe('did you mean …?', () => {
  it('suggests the closest romanised keyword or built-in', () => {
    expect(suggestRoman('kowaa')).toBe('kowa (কোৱা)');
    expect(suggestRoman('xossa')).toBe('xosa (সঁচা)');
    expect(suggestRoman('Path')).toBe('path (পাঠ)'); // built-in names are case-sensitive
    expect(suggestRoman('xonjojun')).toBe('xonjojon (সংযোজন)');
    expect(suggestRoman('jetialoik')).toBe('jetialoike (যেতিয়ালৈকে)');
  });

  it('stays quiet for short, unrelated or Assamese-script names', () => {
    expect(suggestRoman('b')).toBeUndefined();
    expect(suggestRoman('total')).toBeUndefined();
    expect(suggestRoman('অজ্ঞাত')).toBeUndefined();
  });

  it('suggests keywords for typos at the start of a statement', () => {
    const cases: [string, string][] = [
      ['dhora x = 5\njodii (x > 1) { kowa(1) }', 'jodi (যদি)'],
      ['dhoraa x = 5', 'dhora (ধৰা)'],
      ['fangchun f() { ghuraidiya 1 }', 'fangchon (ফাংচন)'],
      ['jodi (xosa) { kowa(1) } nohol { kowa(2) }', "nohole (নহ'লে)"],
    ];
    for (const [source, suggestion] of cases) {
      const { diagnostic } = fail(source);
      expect(diagnostic.code, source).toBe('P007');
      expect(diagnostic.params, source).toMatchObject({ suggestion });
    }
  });

  it('does not suggest keywords for ordinary statements', () => {
    expect(fail('dhora x = 1\nx x').diagnostic.params).not.toHaveProperty('suggestion');
  });

  it('adds the suggestion to the undefined-variable error', () => {
    const { diagnostic, error } = fail('kowaa("hi")');
    expect(diagnostic.code).toBe('R001');
    expect(diagnostic.params).toEqual({ name: 'kowaa', suggestion: 'kowa (কোৱা)' });
    expect(error.message).toContain('kowa (কোৱা)');
  });
});
