import { keywordWord } from '../language/keywords';
import { typeName, type MessageLanguage, type ValueKind } from '../language/types';
import { asciiDigitsToAssamese } from '../lexer/unicode';
import type { DiagnosticCode, DiagnosticParams, Found, NameRole, Phase } from './diagnostic';

type MessageDef<C extends DiagnosticCode> = Readonly<
  Record<MessageLanguage, (p: DiagnosticParams[C]) => string>
>;

/** Assamese number text: ৩০ */
const n = (value: number): string => asciiDigitsToAssamese(String(value));

const codePoint = (ch: string): string =>
  `U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

const found = (f: Found, lang: MessageLanguage): string => {
  switch (f.kind) {
    case 'eof':
      return lang === 'as' ? 'ফাইলৰ শেষ' : 'end of input';
    case 'newline':
      return lang === 'as' ? 'নতুন শাৰী' : 'a line break';
    case 'token':
      return `"${f.text}"`;
  }
};

const ROLE_NAMES: Readonly<Record<NameRole, Readonly<Record<MessageLanguage, string>>>> = {
  variable: { as: 'চলকৰ', en: 'variable' },
  function: { as: 'ফাংচনৰ', en: 'function' },
  parameter: { as: 'প্ৰাচলৰ', en: 'parameter' },
};

const types = (kinds: readonly ValueKind[], lang: MessageLanguage): string =>
  kinds.map((k) => typeName(k, lang)).join(lang === 'as' ? ' বা ' : ' or ');

const arityText = (min: number, max: number, lang: MessageLanguage): string => {
  if (lang === 'as') return min === max ? `${n(min)}টা` : `${n(min)}ৰ পৰা ${n(max)}টা`;
  return min === max ? `${min}` : `${min} to ${max}`;
};

export const MESSAGES: { readonly [C in DiagnosticCode]: MessageDef<C> } = {
  L001: {
    as: (p) => `অচিনাকি আখৰ "${p.char}" (${codePoint(p.char)}) ইয়াত ব্যৱহাৰ কৰিব নোৱাৰি`,
    en: (p) => `Unexpected character "${p.char}" (${codePoint(p.char)})`,
  },
  L002: {
    as: () => `পাঠটো বন্ধ কৰা হোৱা নাই — একে শাৰীতে শেষত " চিহ্ন লাগিব`,
    en: () => `Unterminated string — a closing " is required on the same line`,
  },
  L003: {
    as: () => `মন্তব্যটো বন্ধ কৰা হোৱা নাই — শেষত */ লাগিব`,
    en: () => `Unterminated block comment — a closing */ is required`,
  },
  L004: {
    as: (p) => `অবৈধ এস্কেপ চিহ্ন "\\${p.sequence}"। ব্যৱহাৰ কৰিব পাৰি: \\n \\t \\r \\" \\\\`,
    en: (p) => `Invalid escape sequence "\\${p.sequence}". Allowed: \\n \\t \\r \\" \\\\`,
  },
  L005: {
    as: (p) => `একেটা সংখ্যাত অসমীয়া আৰু ইংৰাজী অংক মিহলাই লিখিব নোৱাৰি: ${p.text}`,
    en: (p) => `A number cannot mix Assamese and ASCII digits: ${p.text}`,
  },
  L006: {
    as: (p) => `অবৈধ সংখ্যা: ${p.text}`,
    en: (p) => `Malformed number: ${p.text}`,
  },
  L007: {
    as: (p) => `"${p.char}" (${codePoint(p.char)}) চিহ্নটোৰ আগত কোনো আখৰ নাই`,
    en: (p) => `Combining mark "${p.char}" (${codePoint(p.char)}) has no base letter before it`,
  },

  P001: {
    as: (p) => `ইয়াত "${p.expected}" আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল ${found(p.found, 'as')}`,
    en: (p) => `Expected "${p.expected}" but found ${found(p.found, 'en')}`,
  },
  P002: {
    as: (p) => `ইয়াত এটা মান আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল ${found(p.found, 'as')}`,
    en: (p) => `Expected an expression but found ${found(p.found, 'en')}`,
  },
  P003: {
    as: () => `"="ৰ বাওঁফালে কেৱল চলকৰ নাম বা তালিকাৰ উপাদান থাকিব পাৰে`,
    en: () =>
      `Invalid assignment target — only a variable or a list element may appear left of "="`,
  },
  P004: {
    as: () => `"${keywordWord('break')}" কেৱল "${keywordWord('while')}" লুপৰ ভিতৰত ব্যৱহাৰ কৰিব পাৰি`,
    en: () => `"${keywordWord('break')}" (break) can only be used inside a loop`,
  },
  P005: {
    as: () => `"${keywordWord('return')}" কেৱল ফাংচনৰ ভিতৰত ব্যৱহাৰ কৰিব পাৰি`,
    en: () => `"${keywordWord('return')}" (return) can only be used inside a function`,
  },
  P006: {
    as: (p) => `প্ৰাচল "${p.name}" এবাৰতকৈ বেছি লিখা হৈছে`,
    en: (p) => `Duplicate parameter "${p.name}"`,
  },
  P007: {
    as: (p) => `বাক্যৰ পিছত নতুন শাৰী বা ";" লাগিব, কিন্তু পোৱা গ'ল ${found(p.found, 'as')}`,
    en: (p) =>
      `Expected a line break or ";" after the statement, but found ${found(p.found, 'en')}`,
  },
  P008: {
    as: (p) =>
      `ইয়াত ${ROLE_NAMES[p.role].as} নাম আশা কৰা হৈছিল, কিন্তু পোৱা গ'ল ${found(p.found, 'as')}`,
    en: (p) => `Expected a ${ROLE_NAMES[p.role].en} name but found ${found(p.found, 'en')}`,
  },
  P009: {
    as: (p) => `"${p.keyword}" এটা সংৰক্ষিত শব্দ; ইয়াক নাম হিচাপে ব্যৱহাৰ কৰিব নোৱাৰি`,
    en: (p) => `"${p.keyword}" is a reserved keyword and cannot be used as a name`,
  },
  P010: {
    as: (p) => `প্ৰগ্ৰামটোৰ গঠন অতি গভীৰ: ${n(p.limit)}তকৈ বেছি স্তৰৰ বন্ধনী বা ব্লক`,
    en: (p) => `Program is nested too deeply: more than ${p.limit} levels of brackets or blocks`,
  },

  R001: {
    as: (p) =>
      `"${p.name}" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই (প্ৰথমে "${keywordWord('let')} ${p.name} = …" লিখক)`,
    en: (p) => `Undefined variable "${p.name}" (declare it first with "${keywordWord('let')}")`,
  },
  R002: {
    as: (p) => `"${p.name}" এই পৰিসৰত ইতিমধ্যে ঘোষণা কৰা হৈছে`,
    en: (p) => `"${p.name}" is already declared in this scope`,
  },
  R003: {
    as: (p) =>
      `"${p.op}" ব্যৱহাৰ কৰিব নোৱাৰি: বাওঁফালে ${typeName(p.left, 'as')}, সোঁফালে ${typeName(p.right, 'as')}`,
    en: (p) => `Cannot apply "${p.op}" to ${typeName(p.left, 'en')} and ${typeName(p.right, 'en')}`,
  },
  R004: {
    as: () => `শূন্যৰে হৰণ কৰিব নোৱাৰি`,
    en: () => `Division by zero`,
  },
  R005: {
    as: (p) => `${typeName(p.type, 'as')} এটা ফাংচন নহয়, গতিকে ইয়াক মাতিব নোৱাৰি`,
    en: (p) => `Cannot call a value of type ${typeName(p.type, 'en')}`,
  },
  R006: {
    as: (p) =>
      `"${p.name}" ফাংচনে ${arityText(p.min, p.max, 'as')} মান বিচাৰে, কিন্তু ${n(p.got)}টা দিয়া হৈছে`,
    en: (p) => `"${p.name}" expects ${arityText(p.min, p.max, 'en')} argument(s) but got ${p.got}`,
  },
  R007: {
    as: (p) => `চৰ্তটো সঁচা বা মিছা হ'ব লাগিব, কিন্তু ইয়াৰ প্ৰকাৰ ${typeName(p.type, 'as')}`,
    en: (p) => `A condition must be a boolean (সঁচা/মিছা) but got ${typeName(p.type, 'en')}`,
  },
  R008: {
    as: (p) => `${n(p.limit)}টা পদক্ষেপৰ সীমা পাৰ হ'ল — হয়তো লুপটো কেতিয়াও শেষ নহয়`,
    en: (p) => `Execution step limit of ${p.limit} exceeded — possible infinite loop`,
  },
  R009: {
    as: (p) => `ফাংচন মতাৰ গভীৰতা ${n(p.limit)} পাৰ হ'ল — হয়তো ৰিকাৰ্চন কেতিয়াও শেষ নহয়`,
    en: (p) => `Maximum call depth of ${p.limit} exceeded — possible infinite recursion`,
  },
  R010: {
    as: (p) => `সূচী ${n(p.index)} সীমাৰ বাহিৰত; দৈৰ্ঘ্য ${n(p.length)}`,
    en: (p) => `Index ${p.index} is out of range for length ${p.length}`,
  },
  R011: {
    as: (p) => `সূচী এটা অখণ্ড সংখ্যা হ'ব লাগিব, কিন্তু পোৱা গ'ল ${p.value}`,
    en: (p) => `An index must be a whole number but got ${p.value}`,
  },
  R012: {
    as: (p) => `${typeName(p.type, 'as')}ত সূচী ব্যৱহাৰ কৰিব নোৱাৰি`,
    en: (p) => `Cannot index into a value of type ${typeName(p.type, 'en')}`,
  },
  R013: {
    as: (p) => `"${p.op}" ${typeName(p.type, 'as')}ৰ ওপৰত প্ৰয়োগ কৰিব নোৱাৰি`,
    en: (p) => `Cannot apply unary "${p.op}" to ${typeName(p.type, 'en')}`,
  },
  R014: {
    as: (p) =>
      `"${p.name}" ফাংচনৰ ${n(p.position)} নম্বৰ মানটো ${types(p.expected, 'as')} হ'ব লাগিব, কিন্তু পোৱা গ'ল ${typeName(p.got, 'as')}`,
    en: (p) =>
      `Argument ${p.position} of "${p.name}" must be ${types(p.expected, 'en')} but got ${typeName(p.got, 'en')}`,
  },
  R015: {
    as: () => `ইয়াত ইনপুট পঢ়াৰ সুবিধা উপলব্ধ নহয়`,
    en: () => `Input is not available here`,
  },
  R016: {
    as: () => `পাঠৰ আখৰ সলনি কৰিব নোৱাৰি; তাৰ সলনি নতুন পাঠ এটা বনাওক`,
    en: () => `Text values are immutable; build a new text instead`,
  },
  R017: {
    as: (p) => `"${p.op}"ৰ দুয়োফালে সঁচা বা মিছা লাগিব, কিন্তু পোৱা গ'ল ${typeName(p.type, 'as')}`,
    en: (p) => `Operands of "${p.op}" must be boolean but got ${typeName(p.type, 'en')}`,
  },
  R018: {
    as: () => `প্ৰগ্ৰামটো অতি গভীৰলৈ সোমাই গ'ল আৰু ইন্টাৰপ্ৰেটাৰৰ ষ্টেক শেষ হ'ল; ৰিকাৰ্চনৰ গভীৰতা কমাওক`,
    en: () =>
      `Nesting too deep: the interpreter ran out of stack space; reduce the recursion depth`,
  },
  R019: {
    as: (p) =>
      `${p.type === 'string' ? 'পাঠটো' : 'তালিকাখন'} অতি দীঘল হ'ল — সৰ্বোচ্চ দৈৰ্ঘ্য ${n(p.limit)}`,
    en: (p) =>
      `${p.type === 'string' ? 'Text' : 'List'} is too long — the maximum length is ${p.limit}`,
  },
  R020: {
    as: (p) =>
      `"${p.name}" এটা অন্তৰ্নিৰ্মিত ফাংচন; ইয়াক সলনি কৰিব নোৱাৰি (নিজৰ বাবে "${keywordWord('let')} ${p.name} = …" লিখক)`,
    en: (p) =>
      `"${p.name}" is a built-in and cannot be reassigned (declare your own with "${keywordWord('let')}")`,
  },
};

export const PHASE_LABELS: Readonly<Record<Phase, Readonly<Record<MessageLanguage, string>>>> = {
  lexer: { as: 'শব্দ-বিশ্লেষণৰ ভুল', en: 'lexical error' },
  parser: { as: 'বাক্য-গঠনৰ ভুল', en: 'syntax error' },
  runtime: { as: 'চলোৱাৰ সময়ৰ ভুল', en: 'runtime error' },
};

export function renderMessage<C extends DiagnosticCode>(
  code: C,
  params: DiagnosticParams[C],
  lang: MessageLanguage,
): string {
  const def: MessageDef<C> = MESSAGES[code];
  return def[lang](params);
}
