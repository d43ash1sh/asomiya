import { describe, expect, it } from 'vitest';
import { runProgram } from '../../website/src/playground/runner';
import {
  BAR_KEYS,
  type BarKey,
  keyInsert,
  lineIndent,
  newlineInsert,
  prefersRoman,
} from '../../website/src/playground/keybar';
import { KEYWORD_GLOSSARY } from '../../src/index';

function key(label: string): BarKey {
  const found = BAR_KEYS.find((k) => k.label === label);
  if (found === undefined) throw new Error(`no key ${label}`);
  return found;
}

/** Applies an insert at the cursor and returns the result with "|" marking the new cursor. */
function apply(source: string, cursor: number, insert: { text: string; cursor: number }): string {
  const text = source.slice(0, cursor) + insert.text + source.slice(cursor);
  const at = cursor + insert.cursor;
  return `${text.slice(0, at)}|${text.slice(at)}`;
}

describe('playground keyboard bar', () => {
  it('only offers real keywords and spellings', () => {
    const words = new Map(KEYWORD_GLOSSARY.map((k) => [k.word, k.roman]));
    for (const k of BAR_KEYS) {
      if (k.roman === undefined || k.label === 'সোধা') continue;
      expect(words.get(k.label), k.label).toContain(k.roman);
    }
  });

  it('opens a block on its own indented line', () => {
    const source = '    যদি (ক > ১)';
    expect(apply(source, source.length, keyInsert(key('{ }'), source, source.length, false))).toBe(
      '    যদি (ক > ১) {\n        |\n    }',
    );
  });

  it('puts the cursor inside brackets, quotes and calls', () => {
    expect(apply('', 0, keyInsert(key('কোৱা'), '', 0, false))).toBe('কোৱা(|)');
    expect(apply('', 0, keyInsert(key('কোৱা'), '', 0, true))).toBe('kowa(|)');
    expect(apply('x', 1, keyInsert(key('" "'), 'x', 1, false))).toBe('x"|"');
    expect(apply('ধৰা ক', 5, keyInsert(key('='), 'ধৰা ক', 5, false))).toBe('ধৰা ক = |');
  });

  it('builds a program that runs', () => {
    let source = '';
    let cursor = 0;
    const type = (text: string): void => {
      source = source.slice(0, cursor) + text + source.slice(cursor);
      cursor += text.length;
    };
    const press = (label: string): void => {
      const insert = keyInsert(key(label), source, cursor, false);
      source = source.slice(0, cursor) + insert.text + source.slice(cursor);
      cursor += insert.cursor;
    };
    press('যদি');
    press('( )');
    press('সঁচা');
    cursor += 1;
    press('{ }');
    press('কোৱা');
    press('" "');
    type('হয়');
    expect(source).toBe('যদি (সঁচা ) {\n    কোৱা("হয়")\n}');
    expect(runProgram(source, { lang: 'as', digits: 'auto', stdin: '' })).toEqual({
      output: 'হয়\n',
      error: null,
    });
  });

  it('follows the script the program is written in', () => {
    expect(prefersRoman('dhora x = 1\nkowa(x)')).toBe(true);
    expect(prefersRoman('ধৰা ক = ১')).toBe(false);
    expect(prefersRoman('// note in English\nকোৱা("hello")')).toBe(false);
    expect(prefersRoman('')).toBe(false);
  });

  it('keeps indentation on Enter, one level deeper after {', () => {
    expect(lineIndent('a\n    b', 7)).toBe('    ');
    expect(apply('    ক = ১', 9, newlineInsert('    ক = ১', 9))).toBe('    ক = ১\n    |');
    const block = 'যদি (সঁচা) {}';
    expect(apply(block, block.length - 1, newlineInsert(block, block.length - 1))).toBe(
      'যদি (সঁচা) {\n    |\n}',
    );
  });
});
