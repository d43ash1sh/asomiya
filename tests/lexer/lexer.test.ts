import { describe, expect, it } from 'vitest';
import { LexerError } from '../../src/errors/lexer-error';
import { tokenize } from '../../src/lexer/lexer';
import type { Token } from '../../src/lexer/token';
import { types } from '../helpers';

function lexError(source: string) {
  try {
    tokenize(source);
  } catch (error) {
    if (error instanceof LexerError) return error.diagnostic;
    throw error;
  }
  throw new Error('expected a lexer error');
}

function only(source: string): Token {
  const tokens = tokenize(source);
  expect(tokens).toHaveLength(2);
  const first = tokens[0];
  if (first === undefined) throw new Error('no token');
  return first;
}

describe('keywords', () => {
  it.each([
    ['ধৰা', 'Let'],
    ['কোৱা', 'Print'],
    ['যদি', 'If'],
    ["নহ'লে", 'Else'],
    ['যেতিয়ালৈকে', 'While'],
    ['ফাংচন', 'Function'],
    ['ঘূৰাইদিয়া', 'Return'],
    ['ৰখা', 'Break'],
    ['সঁচা', 'True'],
    ['মিছা', 'False'],
    ['খালী', 'Null'],
    ['আৰু', 'AndAnd'],
    ['বা', 'OrOr'],
  ] as const)('%s → %s', (word, type) => {
    expect(only(word).type).toBe(type);
  });

  it("accepts the alternative spellings of নহ'লে", () => {
    expect(only('নহলে').type).toBe('Else');
    expect(only('নহ’লে').type).toBe('Else');
  });

  it('accepts the two-word return form ঘূৰাই দিয়া', () => {
    for (const source of ['ঘূৰাই দিয়া', 'ঘূৰাই   দিয়া', 'ঘূৰাই\tদিয়া', 'ঘূৰাই দিয়া']) {
      const token = only(source);
      expect(token.type, source).toBe('Return');
      expect(token.lexeme, source).toBe(source);
    }
    expect(types('ঘূৰাই দিয়া ১')).toEqual(['Return', 'Number']);
    expect(types('ঘূৰাই\nদিয়া')).toEqual(['Identifier', 'Newline', 'Identifier']);
    expect(types('ধৰা ঘূৰাই = ১')).toEqual(['Let', 'Identifier', 'Equal', 'Number']);
  });

  it('does not split identifiers that merely start or end with a keyword', () => {
    for (const word of ['ধৰাটো', 'যদিও', 'কোৱাকুই', 'খালীঘৰ', 'বাটি', 'মিছামিছি', 'অৰখা']) {
      const token = only(word);
      expect(token.type, word).toBe('Identifier');
    }
  });
});

describe('identifiers', () => {
  it.each(['নাম', 'বয়স', 'ফলাফল', 'যোগ', 'ছাতি_আছে', 'ক১', 'x', '_temp', 'name2'])(
    'recognises %s as one identifier',
    (word) => {
      const token = only(word);
      expect(token.type).toBe('Identifier');
      expect(token.lexeme).toBe(word);
    },
  );

  it('allows an apostrophe inside a word', () => {
    const token = only("হ'ব");
    expect(token.type).toBe('Identifier');
  });

  it('does not treat a trailing apostrophe as part of the word', () => {
    expect(() => tokenize("নাম'")).toThrow(LexerError);
  });
});

describe('numbers', () => {
  it.each([
    ['২৪', 24],
    ['24', 24],
    ['০', 0],
    ['৩.১৪', 3.14],
    ['3.14', 3.14],
    ['১২৩৪৫৬৭৮৯০', 1234567890],
  ])('%s → %d', (text, value) => {
    const token = only(text);
    expect(token.type).toBe('Number');
    if (token.type === 'Number') expect(token.value).toBe(value);
  });

  it('rejects mixed digit sets', () => {
    expect(lexError('১2').code).toBe('L005');
    expect(lexError('1.২').code).toBe('L005');
  });

  it('rejects numbers glued to letters or with two decimal points', () => {
    expect(lexError('১২ক').code).toBe('L006');
    expect(lexError('1.2.3').code).toBe('L006');
  });

  it('leaves a lone trailing dot to be reported as an unexpected character', () => {
    expect(lexError('৫.').code).toBe('L001');
  });
});

describe('strings', () => {
  it('decodes escapes', () => {
    const token = only('"ক\\nখ\\t\\"গ\\"\\\\"');
    expect(token.type === 'String' && token.value).toBe('ক\nখ\t"গ"\\');
  });

  it('keeps mixed Assamese and English text intact', () => {
    const token = only('"Hello অসম 2024 ৰ"');
    expect(token.type === 'String' && token.value).toBe('Hello অসম 2024 ৰ');
  });

  it('reports an unterminated string', () => {
    expect(lexError('"অসম').code).toBe('L002');
    expect(lexError('"অসম\n"').code).toBe('L002');
  });

  it('reports an invalid escape', () => {
    const d = lexError('"\\q"');
    expect(d.code).toBe('L004');
    expect(d.params).toEqual({ sequence: 'q' });
  });
});

describe('operators and punctuation', () => {
  it('tokenizes every operator', () => {
    expect(types('+ - * / % = == ! != < <= > >= && ||')).toEqual([
      'Plus',
      'Minus',
      'Star',
      'Slash',
      'Percent',
      'Equal',
      'EqualEqual',
      'Bang',
      'BangEqual',
      'Less',
      'LessEqual',
      'Greater',
      'GreaterEqual',
      'AndAnd',
      'OrOr',
    ]);
  });

  it('tokenizes brackets, comma and both statement separators', () => {
    expect(types('( ) [ ] { } , ; ।')).toEqual([
      'LeftParen',
      'RightParen',
      'LeftBracket',
      'RightBracket',
      'LeftBrace',
      'RightBrace',
      'Comma',
      'Semicolon',
      'Semicolon',
    ]);
  });

  it('rejects single & and |', () => {
    expect(lexError('ক & খ').code).toBe('L001');
    expect(lexError('ক | খ').code).toBe('L001');
  });

  it('reports unknown characters with their code point', () => {
    const d = lexError('ধৰা ক = @');
    expect(d.code).toBe('L001');
    expect(d.params).toEqual({ char: '@' });
  });
});

describe('newlines', () => {
  it('emits one Newline for a run of blank lines', () => {
    expect(types('ক\n\n\nখ')).toEqual(['Identifier', 'Newline', 'Identifier']);
  });

  it('ignores newlines inside parentheses and brackets', () => {
    expect(types('ক(\n১,\n২\n)')).not.toContain('Newline');
    expect(types('[\n১\n]')).not.toContain('Newline');
  });

  it('keeps newlines inside braces', () => {
    expect(types('{\nক\n}')).toContain('Newline');
  });

  it('keeps newlines inside a brace nested in parentheses', () => {
    expect(types('( {\nক\n} )')).toContain('Newline');
  });
});

describe('comments', () => {
  it('skips line comments', () => {
    expect(types('ক // মন্তব্য\nখ')).toEqual(['Identifier', 'Newline', 'Identifier']);
  });

  it('skips block comments', () => {
    expect(types('ক /* মন্তব্য */ + খ')).toEqual(['Identifier', 'Plus', 'Identifier']);
  });

  it('treats a multi-line block comment as a line break', () => {
    expect(types('ক /* এক\nদুই */ খ')).toEqual(['Identifier', 'Newline', 'Identifier']);
  });

  it('reports an unterminated block comment as incomplete input', () => {
    const d = lexError('ক /* ...');
    expect(d.code).toBe('L003');
    expect(d.incomplete).toBe(true);
  });
});

describe('source positions', () => {
  it('tracks line and column in code points', () => {
    const tokens = tokenize('ধৰা নাম = ২৪\nকোৱা(নাম)');
    const name = tokens[1];
    expect(name?.span.start).toEqual({ offset: 4, line: 1, column: 5 });
    const print = tokens.find((t) => t.type === 'Print');
    expect(print?.span.start.line).toBe(2);
    expect(print?.span.start.column).toBe(1);
  });

  it('reports the position of the bad character', () => {
    const d = lexError('ধৰা ক = ১\nধৰা খ = @');
    expect(d.span.start.line).toBe(2);
    expect(d.span.start.column).toBe(9);
  });
});

describe('malformed input', () => {
  it('handles empty and whitespace-only sources', () => {
    expect(types('')).toEqual([]);
    expect(types('   \t  ')).toEqual([]);
    expect(types('\n\n')).toEqual([]);
  });

  it('does not crash on unbalanced closing brackets', () => {
    expect(types(') ] }')).toEqual(['RightParen', 'RightBracket', 'RightBrace']);
  });
});
