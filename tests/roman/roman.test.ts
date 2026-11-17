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

  it('ignores ASCII case', () => {
    expect(types('Jodi JODI jodi')).toEqual(['If', 'If', 'If']);
    expect(run('KOWA(Xosa)')).toBe('সঁচা\n');
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
    expect(run(source)).toBe('১২০ ৩ খালী সঁচা\n');
  });

  it('mixes freely with Assamese script', () => {
    expect(lines('ধৰা ক = 2\njodi (ক > 1) { কোৱা("ok") }')).toEqual(['ok']);
  });

  it('keeps ordinary Latin names usable as variables', () => {
    expect(run('dhora x = 1\ndhora naam = "A"\nkowa(x, naam)')).toBe('১ A\n');
  });

  it('cannot use a Roman keyword as a variable name', () => {
    expect(fail('dhora jodi = 1').diagnostic.code).toBe('P009');
  });
});

describe('romanised built-ins', () => {
  it('call the same functions as the Assamese names', () => {
    const source = [
      'dhora l = [1, 2]',
      'xonjojon(l, 3)',
      'kowa(doirghyo(l), prokar(l), xonkhya("৪২") + 1, path(7) + "!", purnanko(3.9))',
    ].join('\n');
    expect(run(source)).toBe('৩ তালিকা ৪৩ ৭! ৩\n');
  });

  it('xudha reads input', () => {
    expect(run('kowa(xudha())', { readLine: () => 'Oxom' })).toBe('Oxom\n');
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

  it('adds the suggestion to the undefined-variable error', () => {
    const { diagnostic, error } = fail('kowaa("hi")');
    expect(diagnostic.code).toBe('R001');
    expect(diagnostic.params).toEqual({ name: 'kowaa', suggestion: 'kowa (কোৱা)' });
    expect(error.message).toContain('kowa (কোৱা)');
  });
});
