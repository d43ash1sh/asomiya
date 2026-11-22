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
  | 'continue'
  | 'true'
  | 'false'
  | 'null'
  | 'and'
  | 'or'
  | 'not';

export type GlossaryStatus = 'stable' | 'provisional';

export interface KeywordEntry {
  readonly id: KeywordId;
  /** Canonical spelling. */
  readonly word: string;
  /** Other accepted spellings (resolved to the same keyword). */
  readonly aliases: readonly string[];
  /**
   * Spellings in Latin letters (romanised Assamese, as typed in chats). There is no standard
   * romanisation, so several common spellings are accepted; the first is the preferred one.
   * Lower-case only and case-sensitive, so `Jodi` or `Misha` can still be names. See docs/ROMAN.md.
   */
  readonly roman: readonly string[];
  readonly concept: string;
  readonly meaning: string;
  readonly status: GlossaryStatus;
}

export const KEYWORD_GLOSSARY: readonly KeywordEntry[] = [
  {
    id: 'let',
    word: 'ধৰা',
    aliases: [],
    roman: ['dhora', 'dhara'],
    concept: 'variable declaration',
    meaning: '"suppose / let" — as in ধৰা হওক x = ৫',
    status: 'stable',
  },
  {
    id: 'print',
    word: 'কোৱা',
    aliases: [],
    roman: ['kowa', 'kuwa', 'kua', 'koa'],
    concept: 'print a line',
    meaning: '"say / tell" (imperative)',
    status: 'stable',
  },
  {
    id: 'if',
    word: 'যদি',
    aliases: [],
    roman: ['jodi', 'zodi', 'jadi'],
    concept: 'if',
    meaning: '"if"',
    status: 'stable',
  },
  {
    id: 'else',
    word: "নহ'লে",
    // `নহ’লে` (typographic apostrophe) needs no alias: normalizeIdentifier folds ’ into '.
    aliases: ['নহলে'],
    roman: ['nohole', "noh'le", 'nohle', 'nhole', 'nahole', 'nahale'],
    concept: 'else',
    meaning: '"otherwise / if not" (নহয় + হ\'লে)',
    status: 'stable',
  },
  {
    id: 'while',
    word: 'যেতিয়ালৈকে',
    aliases: [],
    roman: ['jetialoike', 'zetialoike', 'jetiyaloike', 'zetiyaloike', 'jetialoke'],
    concept: 'while loop',
    meaning: '"for as long as"',
    status: 'provisional',
  },
  {
    id: 'function',
    word: 'ফাংচন',
    aliases: [],
    roman: ['fangchon', 'phangchon', 'fanchon'],
    concept: 'function declaration',
    meaning: 'loanword "function"; native candidates: ফলন, কাৰ্য',
    status: 'provisional',
  },
  {
    id: 'return',
    word: 'ঘূৰাইদিয়া',
    aliases: [],
    roman: ['ghuraidiya', 'ghuraidia'],
    concept: 'return from a function',
    meaning: '"give back" (ঘূৰাই দিয়া, joined into one token)',
    status: 'provisional',
  },
  {
    id: 'break',
    word: 'ৰখা',
    aliases: [],
    roman: ['rokha', 'rakha'],
    concept: 'break out of a loop',
    meaning: '"stop / halt"',
    status: 'stable',
  },
  {
    id: 'continue',
    word: 'আগবাঢ়া',
    aliases: [],
    roman: ['aagbara', 'agbara', 'agobara', 'aagbaara', 'agbarha'],
    concept: 'skip to the next loop iteration',
    meaning: '"go ahead / move forward" (imperative of আগবাঢ়)',
    status: 'provisional',
  },
  {
    id: 'true',
    word: 'সঁচা',
    aliases: [],
    roman: ['xosa', 'xocha', 'hosa', 'sosa', 'socha', 'sacha'],
    concept: 'boolean true',
    meaning: '"true"',
    status: 'stable',
  },
  {
    id: 'false',
    word: 'মিছা',
    aliases: [],
    roman: ['misa', 'micha', 'misha'],
    concept: 'boolean false',
    meaning: '"false / untrue"',
    status: 'stable',
  },
  {
    id: 'null',
    word: 'খালী',
    aliases: [],
    roman: ['khali', 'khaali'],
    concept: 'null',
    meaning: '"empty"',
    status: 'stable',
  },
  {
    id: 'and',
    word: 'আৰু',
    aliases: [],
    roman: ['aru', 'aaru'],
    concept: 'logical AND',
    meaning: '"and"',
    status: 'stable',
  },
  {
    id: 'or',
    word: 'বা',
    aliases: [],
    roman: ['ba', 'baa'],
    concept: 'logical OR',
    meaning: '"or"',
    status: 'stable',
  },
  {
    id: 'not',
    word: 'নহয়',
    aliases: [],
    roman: ['nohoy', 'nohoi', 'nahoy'],
    concept: 'logical NOT',
    meaning: '"is not / not"',
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

export type BuiltinKey = keyof typeof BUILTIN_NAMES;

/** Romanised spellings of the built-ins (first = preferred). Like the built-ins, case-sensitive. */
export const BUILTIN_ROMAN: Readonly<Record<BuiltinKey, readonly string[]>> = {
  length: ['doirghyo', 'dairghya', 'doirgho'],
  typeOf: ['prokar', 'prakar'],
  toNumber: ['xonkhya', 'sonkhya', 'sankhya', 'xongkhya'],
  toText: ['path', 'paath'],
  toInteger: ['purnanko', 'purnanka', 'purnank'],
  append: ['xonjojon', 'sonjojon', 'sanjojan'],
  input: ['xudha', 'sudha', 'xodha', 'sodha'],
};
