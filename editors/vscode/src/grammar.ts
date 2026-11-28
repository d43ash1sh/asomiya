/**
 * Builds the TextMate grammar (syntax colours) from the vocabulary. Run by the build; the output is
 * committed as syntaxes/asomiya.tmLanguage.json and a test checks that it is up to date.
 */
import { WORDS, spellings, type Word } from './vocabulary';

/** Characters that continue a name (the lexer also allows ZWNJ and ZWJ inside names). */
const NAME_CHAR = String.raw`[\p{L}\p{M}\p{N}_\x{200C}\x{200D}]`;
const NAME = String.raw`[\p{L}_][\p{L}\p{M}\p{N}_\x{200C}\x{200D}]*`;

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** An alternation of every spelling, longest first, as a whole word. */
function words(entries: readonly Word[]): string {
  const all = new Set<string>();
  for (const w of entries)
    for (const s of [w.word, ...w.aliases, ...w.roman]) for (const v of spellings(s)) all.add(v);
  const sorted = [...all].sort((a, b) => b.length - a.length || a.localeCompare(b));
  return `(?<!${NAME_CHAR})(?:${sorted.map(escape).join('|')})(?!${NAME_CHAR})`;
}

function twoWordReturn(): string {
  const first = [...spellings('ঘূৰাই'), 'ghurai'].map(escape).join('|');
  const second = [...spellings('দিয়া'), 'diya', 'dia'].map(escape).join('|');
  return `(?<!${NAME_CHAR})(?:${first})[ \\t]+(?:${second})(?!${NAME_CHAR})`;
}

const pick = (...ids: string[]): Word[] => WORDS.filter((w) => ids.includes(w.id));

export function buildGrammar(): object {
  const fn = pick('function');
  return {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: 'Asomiya',
    scopeName: 'source.asomiya',
    fileTypes: ['asom'],
    patterns: [
      { include: '#comments' },
      { include: '#strings' },
      { include: '#function-declaration' },
      { include: '#keywords' },
      { include: '#numbers' },
      { include: '#calls' },
      { include: '#operators' },
      { include: '#punctuation' },
    ],
    repository: {
      comments: {
        patterns: [
          { name: 'comment.line.double-slash.asomiya', match: '//.*$' },
          { name: 'comment.block.asomiya', begin: String.raw`/\*`, end: String.raw`\*/` },
        ],
      },
      strings: {
        name: 'string.quoted.double.asomiya',
        begin: '"',
        end: '"|$',
        patterns: [{ name: 'constant.character.escape.asomiya', match: String.raw`\\.` }],
      },
      'function-declaration': {
        match: `(${words(fn)})\\s+(${NAME})`,
        captures: {
          '1': { name: 'storage.type.function.asomiya' },
          '2': { name: 'entity.name.function.asomiya' },
        },
      },
      keywords: {
        patterns: [
          { name: 'storage.type.asomiya', match: words(pick('let', 'function')) },
          { name: 'keyword.control.asomiya', match: twoWordReturn() },
          {
            name: 'keyword.control.asomiya',
            match: words(
              pick('if', 'else', 'while', 'forEach', 'in', 'return', 'break', 'continue'),
            ),
          },
          { name: 'constant.language.asomiya', match: words(pick('true', 'false', 'null')) },
          { name: 'keyword.operator.logical.asomiya', match: words(pick('and', 'or', 'not')) },
          {
            name: 'support.function.builtin.asomiya',
            match: words([...pick('print'), ...WORDS.filter((w) => w.kind === 'builtin')]),
          },
        ],
      },
      numbers: {
        name: 'constant.numeric.asomiya',
        match: `(?<!${NAME_CHAR})[0-9০-৯]+(?:\\.[0-9০-৯]+)?(?!${NAME_CHAR})`,
      },
      calls: {
        match: `(${NAME})(?=\\s*\\()`,
        captures: { '1': { name: 'entity.name.function.call.asomiya' } },
      },
      operators: {
        patterns: [
          { name: 'keyword.operator.comparison.asomiya', match: '==|!=|<=|>=|<|>' },
          { name: 'keyword.operator.logical.asomiya', match: String.raw`&&|\|\||!` },
          { name: 'keyword.operator.assignment.asomiya', match: '=' },
          { name: 'keyword.operator.arithmetic.asomiya', match: String.raw`[+\-*/%]` },
        ],
      },
      punctuation: {
        patterns: [
          { name: 'punctuation.separator.comma.asomiya', match: ',' },
          { name: 'punctuation.terminator.statement.asomiya', match: ';' },
        ],
      },
    },
  };
}
