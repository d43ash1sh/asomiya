import type { SimpleTokenType } from '../lexer/token-types';
import { normalizeIdentifier } from '../lexer/unicode';
import { KEYWORD_GLOSSARY, type KeywordId } from './glossary';

const TOKEN_FOR_KEYWORD: Readonly<Record<KeywordId, SimpleTokenType>> = {
  let: 'Let',
  print: 'Print',
  if: 'If',
  else: 'Else',
  while: 'While',
  forEach: 'ForEach',
  in: 'In',
  function: 'Function',
  return: 'Return',
  break: 'Break',
  continue: 'Continue',
  true: 'True',
  false: 'False',
  null: 'Null',
  and: 'AndAnd',
  or: 'OrOr',
  not: 'Bang',
};

function buildKeywordTable(): ReadonlyMap<string, SimpleTokenType> {
  const table = new Map<string, SimpleTokenType>();
  for (const entry of KEYWORD_GLOSSARY) {
    for (const spelling of [entry.word, ...entry.aliases, ...entry.roman]) {
      const key = normalizeIdentifier(spelling);
      if (table.has(key)) {
        throw new Error(`Duplicate keyword spelling in glossary: ${spelling}`);
      }
      table.set(key, TOKEN_FOR_KEYWORD[entry.id]);
    }
  }
  return table;
}

/** Normalised spelling → token type. */
export const KEYWORDS: ReadonlyMap<string, SimpleTokenType> = buildKeywordTable();

/** Looks up an already-normalised identifier. */
export function keywordTokenType(normalizedName: string): SimpleTokenType | undefined {
  // Case-sensitive: `jodi` is যদি, while `Jodi` (a name) stays an ordinary identifier.
  return KEYWORDS.get(normalizedName);
}

/** Preferred romanised spelling of a keyword (used as output by programs written in Roman). */
export function keywordRoman(id: KeywordId): string {
  const entry = KEYWORD_GLOSSARY.find((e) => e.id === id);
  const word = entry?.roman[0];
  if (word === undefined) throw new Error(`No romanised spelling for keyword: ${id}`);
  return word;
}

/** Canonical spelling of a keyword, for diagnostics. */
export function keywordWord(id: KeywordId): string {
  const entry = KEYWORD_GLOSSARY.find((e) => e.id === id);
  if (entry === undefined) throw new Error(`Unknown keyword id: ${id}`);
  return entry.word;
}
