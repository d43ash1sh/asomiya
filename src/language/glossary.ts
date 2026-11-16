/**
 * The vocabulary of the language. This is the single source of truth for keywords; the lexer's
 * keyword table is derived from it (see keywords.ts). Keep docs/KEYWORDS.md in sync.
 */

export type KeywordId =
  | 'let'
  | 'print'
  | 'if'
  | 'else'
  | 'while'
  | 'function'
  | 'return'
  | 'break'
  | 'true'
  | 'false'
  | 'null'
  | 'and'
  | 'or';

export type GlossaryStatus = 'stable' | 'provisional';

export interface KeywordEntry {
  readonly id: KeywordId;
  /** Canonical spelling. */
  readonly word: string;
  /** Other accepted spellings (resolved to the same keyword). */
  readonly aliases: readonly string[];
  readonly concept: string;
  readonly meaning: string;
  readonly status: GlossaryStatus;
}

export const KEYWORD_GLOSSARY: readonly KeywordEntry[] = [
  {
    id: 'let',
    word: 'ধৰা',
    aliases: [],
    concept: 'variable declaration',
    meaning: '"suppose / let" — as in ধৰা হওক x = ৫',
    status: 'stable',
  },
  {
    id: 'print',
    word: 'কোৱা',
    aliases: [],
    concept: 'print a line',
    meaning: '"say / tell" (imperative)',
    status: 'stable',
  },
  {
    id: 'if',
    word: 'যদি',
    aliases: [],
    concept: 'if',
    meaning: '"if"',
    status: 'stable',
  },
  {
    id: 'else',
    word: "নহ'লে",
    // `নহ’লে` (typographic apostrophe) needs no alias: normalizeIdentifier folds ’ into '.
    aliases: ['নহলে'],
    concept: 'else',
    meaning: '"otherwise / if not" (নহয় + হ\'লে)',
    status: 'stable',
  },
  {
    id: 'while',
    word: 'যেতিয়ালৈকে',
    aliases: [],
    concept: 'while loop',
    meaning: '"for as long as"',
    status: 'provisional',
  },
  {
    id: 'function',
    word: 'ফাংচন',
    aliases: [],
    concept: 'function declaration',
    meaning: 'loanword "function"; native candidates: ফলন, কাৰ্য',
    status: 'provisional',
  },
  {
    id: 'return',
    word: 'ঘূৰাইদিয়া',
    aliases: [],
    concept: 'return from a function',
    meaning: '"give back" (ঘূৰাই দিয়া, joined into one token)',
    status: 'provisional',
  },
  {
    id: 'break',
    word: 'ৰখা',
    aliases: [],
    concept: 'break out of a loop',
    meaning: '"stop / halt"',
    status: 'stable',
  },
  {
    id: 'true',
    word: 'সঁচা',
    aliases: [],
    concept: 'boolean true',
    meaning: '"true"',
    status: 'stable',
  },
  {
    id: 'false',
    word: 'মিছা',
    aliases: [],
    concept: 'boolean false',
    meaning: '"false / untrue"',
    status: 'stable',
  },
  {
    id: 'null',
    word: 'খালী',
    aliases: [],
    concept: 'null',
    meaning: '"empty"',
    status: 'stable',
  },
  {
    id: 'and',
    word: 'আৰু',
    aliases: [],
    concept: 'logical AND',
    meaning: '"and"',
    status: 'stable',
  },
  {
    id: 'or',
    word: 'বা',
    aliases: [],
    concept: 'logical OR',
    meaning: '"or"',
    status: 'stable',
  },
];

/** Built-in function names (not keywords — programs may shadow them). */
export const BUILTIN_NAMES = {
  length: 'দৈৰ্ঘ্য',
  typeOf: 'প্ৰকাৰ',
  toNumber: 'সংখ্যা',
  toText: 'পাঠ',
  toInteger: 'পূৰ্ণাংক',
  append: 'সংযোজন',
  input: 'সোধা',
} as const;
