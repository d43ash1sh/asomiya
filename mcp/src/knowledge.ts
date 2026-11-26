// Everything the server knows about the language: docs, examples, keywords and errors. All of it
// comes from the repository itself (docs/, examples/, src/language), so it can't drift from the
// interpreter it ships with.
import architecture from '../../docs/ARCHITECTURE.md';
import errorsDoc from '../../docs/ERRORS.md';
import grammar from '../../docs/GRAMMAR.md';
import keywordsDoc from '../../docs/KEYWORDS.md';
import spec from '../../docs/LANGUAGE_SPEC.md';
import roman from '../../docs/ROMAN.md';
import type { DiagnosticCode } from '../../src/errors/diagnostic';
import { phaseOf } from '../../src/errors/diagnostic';
import { MESSAGES } from '../../src/errors/messages';
import { LANGUAGE } from '../../src/language/config';
import {
  BUILTIN_NAMES,
  BUILTIN_ROMAN,
  KEYWORD_GLOSSARY,
  type BuiltinKey,
  type KeywordId,
} from '../../src/language/glossary';
import { TYPE_NAMES, ROMAN_TYPE_NAMES, type ValueKind } from '../../src/language/types';
import { EXAMPLES as PLAYGROUND_EXAMPLES } from '../../website/src/playground/examples';
import { FIX_HINTS } from './hints';

// ── docs ──────────────────────────────────────────────────────────────────

export interface Doc {
  readonly name: string;
  readonly uri: string;
  readonly title: string;
  readonly description: string;
  readonly text: string;
}

export const DOCS: readonly Doc[] = [
  {
    name: 'language-spec',
    uri: 'asomiya://docs/language-spec',
    title: 'Language specification',
    description: 'What programs mean: values, scope, operators, control flow, functions, limits.',
    text: spec,
  },
  {
    name: 'grammar',
    uri: 'asomiya://docs/grammar',
    title: 'Grammar',
    description: 'The exact syntax (EBNF), precedence, newlines and lexical rules.',
    text: grammar,
  },
  {
    name: 'keywords',
    uri: 'asomiya://docs/keywords',
    title: 'Keywords and built-ins',
    description: 'Every keyword, built-in function and type name with its meaning.',
    text: keywordsDoc,
  },
  {
    name: 'roman',
    uri: 'asomiya://docs/roman',
    title: 'Writing in English letters',
    description: 'The romanised spellings (dhora, kowa, jodi…) accepted for every keyword.',
    text: roman,
  },
  {
    name: 'errors',
    uri: 'asomiya://docs/errors',
    title: 'Error reference',
    description: 'Every error code (L…, P…, R…) with its Assamese and English message.',
    text: errorsDoc,
  },
  {
    name: 'architecture',
    uri: 'asomiya://docs/architecture',
    title: 'How the interpreter works',
    description: 'Lexer, parser, interpreter and Python translator, for contributors.',
    text: architecture,
  },
];

// ── examples ──────────────────────────────────────────────────────────────

export interface ExampleProgram {
  /** File name without .asom. */
  readonly name: string;
  readonly file: string;
  readonly label: string;
  readonly source: string;
  /** Input lines for programs that use সোধা. */
  readonly input: readonly string[];
}

export const EXAMPLES: readonly ExampleProgram[] = PLAYGROUND_EXAMPLES.map((e) => ({
  name: e.file.replace(/\.asom$/, ''),
  file: e.file,
  label: e.label,
  source: e.source,
  input: e.stdin === '' ? [] : e.stdin.split('\n'),
}));

// ── vocabulary ────────────────────────────────────────────────────────────

/** A short program using each keyword. Every one is run by the tests. */
export const KEYWORD_USAGE: Readonly<Record<KeywordId, string>> = {
  let: 'ধৰা নাম = "অসম"\nকোৱা(নাম)',
  print: 'কোৱা("নমস্কাৰ", ১০ + ২০)',
  if: 'ধৰা ক = ৭\nযদি (ক > ৫) { কোৱা("ডাঙৰ") }',
  else: 'ধৰা ক = ৩\nযদি (ক > ৫) { কোৱা("ডাঙৰ") } নহ\'লে যদি (ক > ২) { কোৱা("মজলীয়া") } নহ\'লে { কোৱা("সৰু") }',
  while: 'ধৰা ক = ১\nযেতিয়ালৈকে (ক <= ৩) {\n    কোৱা(ক)\n    ক = ক + ১\n}',
  forEach: 'প্ৰতিটো ফল ["আম", "কল"] মাজত {\n    কোৱা(ফল)\n}',
  in: 'প্ৰতিটো আখৰ "অসম" মাজত { কোৱা(আখৰ) }',
  function: 'ফাংচন যোগ(ক, খ) {\n    ঘূৰাইদিয়া ক + খ\n}\nকোৱা(যোগ(২, ৩))',
  return: 'ফাংচন বৰ্গ(ক) { ঘূৰাইদিয়া ক * ক }\nকোৱা(বৰ্গ(৪))',
  break: 'প্ৰতিটো ক [১, ২, ৩] মাজত {\n    যদি (ক == ৩) { ৰখা }\n    কোৱা(ক)\n}',
  continue: 'প্ৰতিটো ক [১, ২, ৩] মাজত {\n    যদি (ক == ২) { আগবাঢ়া }\n    কোৱা(ক)\n}',
  true: 'ধৰা সাজু = সঁচা\nযদি (সাজু) { কোৱা("সাজু") }',
  false: 'ধৰা শেষ = মিছা\nকোৱা(নহয় শেষ)',
  null: 'ধৰা ফল = খালী\nকোৱা(ফল == খালী)',
  and: 'ধৰা ক = ৫\nকোৱা(ক > ০ আৰু ক < ১০)',
  or: 'ধৰা ক = ১৫\nকোৱা(ক < ০ বা ক > ১০)',
  not: 'কোৱা(নহয় মিছা)',
};

/** "meaning" and "behaviour" of each built-in, from the table in docs/KEYWORDS.md. */
function builtinDocs(): Map<string, { meaning: string; behaviour: string }> {
  const rows = new Map<string, { meaning: string; behaviour: string }>();
  const section = keywordsDoc.split('## Built-in functions')[1]?.split('\n## ')[0] ?? '';
  for (const line of section.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    const name = /^`([^`]+)`$/.exec(cells[1] ?? '')?.[1];
    if (name !== undefined && cells.length >= 5) {
      rows.set(name, {
        meaning: (cells[2] ?? '').replace(/^"|"$/g, ''),
        behaviour: cells[3] ?? '',
      });
    }
  }
  return rows;
}

export type VocabularyKind = 'keyword' | 'builtin' | 'type';

export interface VocabularyEntry {
  readonly kind: VocabularyKind;
  /** Stable English id, e.g. `forEach`, `length`, `list`. */
  readonly id: string;
  /** Spelling in Assamese script. */
  readonly word: string;
  readonly aliases: readonly string[];
  /** Spellings in English letters; the first is the preferred one. */
  readonly roman: readonly string[];
  readonly english: string;
  readonly meaning: string;
  readonly example: string;
}

function buildVocabulary(): VocabularyEntry[] {
  const builtins = builtinDocs();
  const entries: VocabularyEntry[] = KEYWORD_GLOSSARY.map((k) => ({
    kind: 'keyword',
    id: k.id,
    word: k.word,
    aliases: k.aliases,
    roman: k.roman,
    english: k.concept,
    meaning: k.meaning,
    example: KEYWORD_USAGE[k.id],
  }));
  for (const key of Object.keys(BUILTIN_NAMES) as BuiltinKey[]) {
    const word = BUILTIN_NAMES[key];
    const docs = builtins.get(word);
    entries.push({
      kind: 'builtin',
      id: key,
      word,
      aliases: [],
      roman: BUILTIN_ROMAN[key],
      english: docs?.meaning ?? key,
      meaning: docs?.behaviour ?? '',
      example: '',
    });
  }
  for (const kind of Object.keys(TYPE_NAMES) as ValueKind[]) {
    entries.push({
      kind: 'type',
      id: kind,
      word: TYPE_NAMES[kind].as,
      aliases: [],
      roman: [ROMAN_TYPE_NAMES[kind]],
      english: TYPE_NAMES[kind].en,
      meaning: `The name প্ৰকাৰ(…) returns for a ${TYPE_NAMES[kind].en} value.`,
      example: '',
    });
  }
  return entries;
}

export const VOCABULARY: readonly VocabularyEntry[] = buildVocabulary();

const fold = (s: string): string => s.normalize('NFC').trim().toLowerCase().replace(/[’‘]/g, "'");

/**
 * Entries matching a word in any script, or an English meaning. Exact spellings come first, then
 * entries whose English description contains the query.
 */
export function lookup(query: string): VocabularyEntry[] {
  const q = fold(query);
  if (q === '') return [...VOCABULARY];
  const exact = VOCABULARY.filter((e) =>
    [e.word, ...e.aliases, ...e.roman, e.id].some((s) => fold(s) === q),
  );
  if (exact.length > 0) return exact;
  return VOCABULARY.filter((e) => [e.english, e.meaning, e.id].some((s) => fold(s).includes(q)));
}

// ── errors ────────────────────────────────────────────────────────────────

export const ERROR_CODES = Object.keys(MESSAGES) as DiagnosticCode[];

export function isErrorCode(code: string): code is DiagnosticCode {
  return Object.hasOwn(MESSAGES, code);
}

export interface ErrorExplanation {
  readonly code: DiagnosticCode;
  readonly phase: string;
  readonly messageAs: string;
  readonly messageEn: string;
  readonly example: string;
  readonly fix: string;
}

/** The entry for one code from docs/ERRORS.md, plus how to fix it. */
export function explainError(code: DiagnosticCode): ErrorExplanation {
  const section = errorsDoc.split(`\n### ${code}\n`)[1]?.split('\n#')[0] ?? '';
  const field = (label: string): string =>
    new RegExp(`- \\*\\*${label}:\\*\\* (.*)`).exec(section)?.[1]?.trim() ?? '';
  return {
    code,
    phase: phaseOf(code),
    messageAs: field('অসমীয়া'),
    messageEn: field('English'),
    example: field('Example').replace(/^`|`$/g, ''),
    fix: FIX_HINTS[code],
  };
}

// ── the guide for AI assistants ───────────────────────────────────────────

/** A complete program for the guide; the tests run it and compare the output. */
export const GUIDE_PROGRAM = `// ছাত্ৰ-ছাত্ৰীৰ নম্বৰ
ধৰা নম্বৰ = [৭৮, ৯২, ৬৫]
ধৰা মুঠ = ০

প্ৰতিটো ন নম্বৰ মাজত {
    মুঠ = মুঠ + ন
}

ফাংচন গড়(যোগফল, কেইটা) {
    ঘূৰাইদিয়া যোগফল / কেইটা
}

ধৰা ফল = গড়(মুঠ, দৈৰ্ঘ্য(নম্বৰ))
কোৱা("গড় নম্বৰ: " + ফল)
যদি (ফল >= ৭৫) {
    কোৱা("বঢ়িয়া!")
} নহ'লে {
    কোৱা("আৰু চেষ্টা কৰক")
}`;

export const GUIDE_PROGRAM_OUTPUT = 'গড় নম্বৰ: ৭৮.৩৩৩৩৩৩৩৩৩৩৩৩৩৩\nবঢ়িয়া!\n';

/** The same idea in English letters; the tests run it too. */
export const GUIDE_ROMAN_PROGRAM = `dhora phol = ["aam", "kol"]
protito f phol majot {
    kowa("mur " + f + " bhal lage")
}
kowa(doirghyo(phol))`;

export const GUIDE_ROMAN_OUTPUT = 'mur aam bhal lage\nmur kol bhal lage\n2\n';

function vocabularyTable(kind: VocabularyKind): string {
  const rows = VOCABULARY.filter((e) => e.kind === kind).map(
    (e) =>
      `| \`${[e.word, ...e.aliases].join('` / `')}\` | ${e.roman.map((r) => `\`${r}\``).join(', ')} | ${e.english} |`,
  );
  return ['| Assamese | English letters | Meaning |', '| --- | --- | --- |', ...rows].join('\n');
}

/** A compact guide that lets a model write correct Asomiya without reading every doc. */
export function guide(): string {
  return `# Writing ${LANGUAGE.name} (${LANGUAGE.nativeName}) — a guide for AI assistants

${LANGUAGE.name} ${LANGUAGE.version} is a small programming language whose keywords are Assamese words. Programs
can be written in Assamese script or in English letters (romanised Assamese). Files end in \`${LANGUAGE.fileExtension}\`.
Test code before showing it to someone: with the Asomiya MCP server (\`npx -y asomiya-mcp\`), run it with \`run_asomiya\`; otherwise in the playground at https://asomiya.codes/playground/.

## A complete program

\`\`\`asomiya
${GUIDE_PROGRAM}
\`\`\`

Output:

\`\`\`text
${GUIDE_PROGRAM_OUTPUT.trimEnd()}
\`\`\`

The same language in English letters (numbers then print with ASCII digits):

\`\`\`asomiya
${GUIDE_ROMAN_PROGRAM}
\`\`\`

## Rules that differ from Python or JavaScript

- Declare a variable once with \`ধৰা\` (\`dhora\`); change it later without \`ধৰা\`. Declaring the same name twice in one scope is error R002.
- Blocks use \`{ }\`, indentation doesn't matter. Statements end at a new line, \`;\` or the danda \`।\`.
- Conditions must be \`সঁচা\`/\`মিছা\` (true/false). There is no truthiness: \`যদি (০)\` is error R007. Parentheses around conditions are optional.
- For-each puts the list **before** \`মাজত\` (\`majot\`, "in"): \`প্ৰতিটো ফল ফলবোৰ মাজত { … }\`. Writing \`মাজত\` first is error P013. It loops over lists and over the letters (grapheme clusters) of text.
- There is no \`for (i = 0; …)\` loop and no range function: use \`যেতিয়ালৈকে\` (\`jetialoike\`, while) with a counter.
- Text uses double quotes only. \`+\` joins text with any value; no other operator converts types. Use \`সংখ্যা(…)\` and \`পাঠ(…)\` to convert.
- \`/\` is true division (\`৭ / ২\` is \`৩.৫\`); use \`পূৰ্ণাংক(…)\` for a whole number. \`%\` is the remainder.
- Lists are zero-based: \`ল[০]\`. Add to a list with \`সংযোজন(ল, মান)\`; get the length with \`দৈৰ্ঘ্য(ল)\`. There are no dictionaries or objects.
- \`কোৱা(…)\` prints its arguments separated by spaces. Numbers print with Assamese digits (\`৩০\`) in Assamese-script programs and ASCII digits (\`30\`) in programs written in English letters. Both digit sets are accepted in code, but one number can't mix them.
- \`সোধা("প্ৰশ্ন")\` reads one line of input (pass lines in \`input\` of \`run_asomiya\`); it returns \`খালী\` (null) when there is no more input.
- Comments: \`// …\` and \`/* … */\`. Names may use Assamese or English letters, digits and \`_\`, but not keywords in either script.
- Programs cannot touch files, the network or the system. A run stops after 10,000,000 steps (R008) or 500 nested calls (R009).

## Keywords

${vocabularyTable('keyword')}

\`নহ'লে যদি\` is "else if". Romanised keywords are lower-case only; \`Jodi\` is an ordinary name.

## Built-in functions

${vocabularyTable('builtin')}

## Type names (returned by \`প্ৰকাৰ\`)

${vocabularyTable('type')}

## More

- Full reference: https://asomiya.codes/reference/ (in the MCP server: \`asomiya://docs/language-spec\`, grammar, keywords, errors, and example programs at \`asomiya://examples/…\`).
- MCP tools: \`run_asomiya\`, \`check_asomiya\`, \`asomiya_to_python\`, \`lookup_keyword\`, \`explain_error\`.
- Website and playground: https://asomiya.codes
`;
}
