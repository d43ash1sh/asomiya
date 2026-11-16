import { describe, expect, it } from 'vitest';
import { tokenize } from '../../src/lexer/lexer';
import { graphemes, normalizeIdentifier } from '../../src/lexer/unicode';
import { fail, lines, run } from '../helpers';

/** য় as one code point (U+09DF) and as য + nukta (U+09AF U+09BC). */
const YA_PRECOMPOSED = 'য়';
const YA_DECOMPOSED = 'য়';
/** ো as one code point (U+09CB) and as ে + া (U+09C7 U+09BE). */
const O_SIGN = 'ো';
const O_SIGN_DECOMPOSED = 'ো';

describe('NFC normalisation of identifiers', () => {
  it('treats precomposed and decomposed য় as the same name', () => {
    const declared = `ব${YA_PRECOMPOSED}স`;
    const used = `ব${YA_DECOMPOSED}স`;
    expect(declared).not.toBe(used);
    expect(run(`ধৰা ${declared} = ২৪\nকোৱা(${used})`)).toBe('২৪\n');
  });

  it('treats composed and decomposed ো as the same name', () => {
    expect(run(`ধৰা ক${O_SIGN} = ১\nকোৱা(ক${O_SIGN_DECOMPOSED})`)).toBe('১\n');
  });

  it('recognises a keyword typed in decomposed form', () => {
    const decomposedPrint = `ক${O_SIGN_DECOMPOSED}ৱা`; // কোৱা
    expect(run(`${decomposedPrint}("হয়")`)).toBe('হয়\n');
  });

  it('keeps the original text in the token lexeme for error reporting', () => {
    const source = `ব${YA_PRECOMPOSED}স`;
    const token = tokenize(source)[0];
    expect(token?.lexeme).toBe(source);
    expect(token?.type === 'Identifier' && token.name).toBe(normalizeIdentifier(source));
  });

  it('normalises string literal contents, so equal-looking text compares equal', () => {
    expect(run(`কোৱা("ব${YA_PRECOMPOSED}স" == "ব${YA_DECOMPOSED}স")`)).toBe('সঁচা\n');
  });

  it('does not treat ZWJ/ZWNJ as removable: they change the name', () => {
    expect(fail('ধৰা ৰ‍্য = ১\nকোৱা(ৰ্য)').diagnostic.code).toBe('R001');
  });
});

describe('Assamese script details', () => {
  it('handles Assamese-specific letters ৰ and ৱ', () => {
    expect(run('ধৰা ৰৱ = "ৰৱ"\nকোৱা(ৰৱ)')).toBe('ৰৱ\n');
  });

  it('handles conjuncts, virama, chandrabindu, khanda ta', () => {
    expect(run('ধৰা প্ৰাপ্তবয়স্ক = সঁচা\nধৰা উৎসৱ = ১\nকোৱা(প্ৰাপ্তবয়স্ক, উৎসৱ)')).toBe('সঁচা ১\n');
  });

  it('reports a vowel sign with no base letter', () => {
    const d = fail('ধৰা ক = া').diagnostic;
    expect(d.code).toBe('L007');
  });

  it('ignores a leading byte-order mark', () => {
    expect(run('﻿কোৱা(১)')).toBe('১\n');
  });

  it('accepts the danda as a statement separator', () => {
    expect(run('কোৱা(১)। কোৱা(২)।')).toBe('১\n২\n');
  });
});

describe('numerals', () => {
  it('parses Assamese and ASCII digits to the same values', () => {
    expect(run('কোৱা(১০ + 10 == ২০)')).toBe('সঁচা\n');
  });

  it('prints numbers in Assamese digits by default and ASCII on request', () => {
    expect(run('কোৱা(১২৩.৫)')).toBe('১২৩.৫\n');
    expect(run('কোৱা(১২৩.৫)', { digits: 'ascii' })).toBe('123.5\n');
  });

  it('converts text with either digit set using সংখ্যা()', () => {
    expect(lines('কোৱা(সংখ্যা("৪২") + 1)\nকোৱা(সংখ্যা("-3.5"))\nকোৱা(সংখ্যা("৪2"))')).toEqual([
      '৪৩',
      '-৩.৫',
      'খালী',
    ]);
  });
});

describe('grapheme clusters', () => {
  it('splits text into user-perceived characters', () => {
    expect(graphemes('নাম')).toEqual(['না', 'ম']);
    expect(graphemes('ক্ষমা')).toEqual(['ক্ষ', 'মা']);
  });

  it('measures length and indexes by grapheme cluster', () => {
    expect(lines('ধৰা শ = "নমস্কাৰ"\nকোৱা(দৈৰ্ঘ্য(শ))\nকোৱা(শ[১])')).toEqual(['৪', 'ম']);
  });

  it('never separates a combining mark from its letter', () => {
    const out = run(
      'ধৰা শ = "কৌতূহল"\nধৰা i = ০\nযেতিয়ালৈকে (i < দৈৰ্ঘ্য(শ)) { কোৱা(শ[i]); i = i + ১ }',
    );
    expect(out).toBe('কৌ\nতূ\nহ\nল\n');
  });

  it('handles astral characters (emoji) in strings', () => {
    expect(run('কোৱা(দৈৰ্ঘ্য("😀অ"))')).toBe('২\n');
    const tokens = tokenize('"😀" ক');
    expect(tokens[1]?.span.start.column).toBe(5);
  });
});
