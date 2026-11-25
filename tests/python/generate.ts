/**
 * Random Asomiya programs for differential testing of the Python translation. The programs
 * deliberately mix types, shadow names, use closures in loops, Assamese text with combining
 * marks, emoji, big and fractional numbers … so that both success and every kind of runtime error
 * are exercised. Deterministic for a given seed.
 */
import { BUILTIN_NAMES, BUILTIN_ROMAN, KEYWORD_GLOSSARY } from '../../src/index';
import type { KeywordId } from '../../src/index';
import type { BuiltinKey } from '../../src/language/glossary';

class Random {
  constructor(private state: number) {}
  next(): number {
    // mulberry32
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
  pick<T>(items: readonly T[]): T {
    const item = items[this.int(items.length)];
    if (item === undefined) throw new Error('empty');
    return item;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
}

type Want = 'num' | 'str' | 'bool' | 'list' | 'any';

const NUMBERS = [
  '0',
  '1',
  '2',
  '3',
  '5',
  '7',
  '10',
  '18',
  '100',
  '0.5',
  '0.1',
  '0.2',
  '1.5',
  '2.25',
  '1000000',
  '9007199254740993',
  '123456789012345678901234',
  '0.000001',
  '0.0000001',
  '৫',
  '১২',
  '০.৫',
];

const STRINGS = [
  '',
  'a',
  'b',
  'ab',
  'নমস্কাৰ',
  'ক্ষ',
  'কে',
  'া',
  '্ক',
  'ৰ‍্য',
  'অসম',
  'x y',
  '😀',
  '👨‍👩‍👧',
  '🇮🇳🇮',
  'é',
  '́x',
  '\\"',
  'a\\nb',
  '\\t',
  '\\\\',
  '１２',
  '১২',
  '-৩',
  ' 42 ',
  '3.5',
  '-0',
  'ｚ',
  '𝒜',
  'ক্',
  'Hello',
  'সঁচা',
  '[1]',
];

const NAMES = ['ক', 'খ', 'x', 'y', 'n', 'মান', 's', 'xs', 'f', 'g', 'print', 'len', 'text', 'in'];

export interface Generated {
  readonly source: string;
  readonly stdin: string;
}

export function generate(seed: number): Generated {
  const r = new Random(seed);
  const roman = r.chance(0.3);
  const kw = (id: KeywordId): string => {
    const entry = KEYWORD_GLOSSARY.find((e) => e.id === id);
    if (!entry) throw new Error(id);
    return roman ? (entry.roman[0] ?? entry.word) : entry.word;
  };
  const bi = (key: BuiltinKey): string =>
    roman ? (BUILTIN_ROMAN[key][0] ?? '') : BUILTIN_NAMES[key];
  let guard = 0;
  let budget = 220; // total nodes, keeps programs small

  const scopes: string[][] = [[]];
  /** What each name was declared to hold (roughly: assignments may change it). */
  const kinds = new Map<string, Want | 'func'>();
  const visible = (): string[] => scopes.flat();
  const declare = (n: string, kind: Want | 'func' = 'any'): string => {
    scopes[scopes.length - 1]?.push(n);
    kinds.set(n, kind);
    return n;
  };
  /** A name not declared in the current block yet (so declaring it is not an error). */
  const freshName = (): string => {
    const here = scopes[scopes.length - 1] ?? [];
    const free = NAMES.filter((n) => !here.includes(n));
    return r.chance(0.97) && free.length > 0 ? r.pick(free) : r.pick(NAMES);
  };
  /** Mostly declared names of the wanted kind, sometimes any name (to test R001). */
  const name = (want: Want | 'func' = 'any'): string => {
    const names = visible();
    const fitting = names.filter((n) => want === 'any' || kinds.get(n) === want);
    if (fitting.length > 0 && r.chance(0.9)) return r.pick(fitting);
    return names.length > 0 && r.chance(0.97) ? r.pick(names) : r.pick(NAMES);
  };

  const leaf = (want: Want): string => {
    if (visible().length > 0 && r.chance(0.35)) return name(want);
    switch (want) {
      case 'num':
        return r.pick(NUMBERS);
      case 'str':
        return `"${r.pick(STRINGS)}"`;
      case 'bool':
        return kw(r.chance(0.5) ? 'true' : 'false');
      case 'list':
        return '[]';
      case 'any':
        return (
          leaf(r.pick(['num', 'str', 'bool', 'list', 'num', 'str'] as const)) +
          (r.chance(0.05) ? '' : '')
        );
    }
  };

  const expr = (want: Want, depth: number): string => {
    budget--;
    if (depth <= 0 || budget <= 0 || r.chance(0.3)) {
      if (want === 'any' && r.chance(0.08)) return kw('null');
      return leaf(want);
    }
    // Sometimes ignore the wanted type, to provoke type errors.
    if (r.chance(0.03)) want = r.pick(['num', 'str', 'bool', 'list', 'any'] as const);
    const d = depth - 1;
    const sub = (w: Want): string => expr(w, d);
    switch (want) {
      case 'num':
        switch (r.int(9)) {
          case 0:
          case 1:
            return `(${sub('num')} ${r.pick(['+', '-', '*', '/', '%'])} ${sub('num')})`;
          case 2:
            return `(-${sub('num')})`;
          case 3:
            return `${bi('length')}(${sub(r.chance(0.5) ? 'str' : 'list')})`;
          case 4:
            return `${bi('toInteger')}(${sub('num')})`;
          case 5:
            return `${bi('toNumber')}(${sub('str')})`;
          case 6:
            return `${sub('list')}[${r.chance(0.7) ? r.pick(['0', '1', '2', '0']) : sub('num')}]`;
          case 7:
            return `${name('func')}(${sub('any')})`;
          default:
            return `(${name()} = ${sub('num')})`;
        }
      case 'str':
        switch (r.int(7)) {
          case 0:
          case 1:
            return `(${sub(r.chance(0.7) ? 'str' : 'any')} + ${sub('any')})`;
          case 2:
            return `${bi('toText')}(${sub('any')})`;
          case 3:
            return `${bi('typeOf')}(${sub('any')})`;
          case 4:
            return `${sub('str')}[${r.chance(0.7) ? '0' : sub('num')}]`;
          case 5:
            return `${bi('input')}(${r.chance(0.5) ? sub('any') : ''})`;
          default:
            return `(${sub('any')} + ${sub('str')})`;
        }
      case 'bool':
        switch (r.int(6)) {
          case 0: {
            const w = r.pick(['num', 'num', 'str', 'any'] as const);
            return `(${sub(w)} ${r.pick(['<', '<=', '>', '>='])} ${sub(w)})`;
          }
          case 1:
            return `(${sub('any')} ${r.pick(['==', '!='])} ${sub('any')})`;
          case 2:
            return `(${r.pick(['!', kw('not')])}${sub('bool')})`;
          case 3:
            return `(${sub('bool')} ${r.pick(['&&', '||', kw('and'), kw('or')])} ${sub('bool')})`;
          case 4:
            return `(${sub('num')} == ${sub('bool')})`;
          default:
            return `(${sub('list')} == ${sub('list')})`;
        }
      case 'list':
        switch (r.int(4)) {
          case 0:
          case 1: {
            const n = r.int(4);
            return `[${Array.from({ length: n }, () => sub('any')).join(', ')}]`;
          }
          case 2:
            return `(${sub('list')} + ${sub('list')})`;
          default:
            return name();
        }
      case 'any':
        return expr(r.pick(['num', 'str', 'bool', 'list'] as const), depth);
    }
  };

  const block = (depth: number, loop: boolean, func: boolean, params: string[] = []): string => {
    scopes.push([...params]);
    const body = statements(r.int(4) + 1, depth, loop, func);
    scopes.pop();
    return `{\n${body}}`;
  };

  const statement = (depth: number, loop: boolean, func: boolean): string => {
    budget -= 2;
    const e = (w: Want): string => expr(w, 3);
    const choice = depth <= 0 || budget <= 0 ? r.int(4) : r.int(17);
    switch (choice) {
      case 0: {
        const kind = r.pick(['num', 'num', 'str', 'str', 'bool', 'list', 'any'] as const);
        const init = r.chance(0.92) ? ` = ${e(kind)}` : '';
        return `${kw('let')} ${declare(freshName(), init ? kind : 'any')}${init}`;
      }
      case 1:
        return `${kw('print')}(${Array.from({ length: r.int(3) + 1 }, () => e('any')).join(', ')})`;
      case 2:
        if (r.chance(0.7)) {
          const target = name();
          const k = kinds.get(target) ?? 'any';
          return `${target} = ${e(k === 'func' ? 'any' : k)}`;
        }
        return `${name('list')}[${e('num')}] = ${e('any')}`;
      case 3:
        return `${bi('append')}(${name('list')}, ${e('any')})`;
      case 4:
      case 5: {
        let s = `${kw('if')} (${e('bool')}) ${block(depth - 1, loop, func)}`;
        if (r.chance(0.3))
          s += ` ${kw('else')} ${kw('if')} (${e('bool')}) ${block(depth - 1, loop, func)}`;
        if (r.chance(0.5)) s += ` ${kw('else')} ${block(depth - 1, loop, func)}`;
        return s;
      }
      case 6:
      case 7: {
        const g = declare(`w${guard++}`);
        const inner = block(depth - 1, true, func).slice(2, -1);
        return `${kw('let')} ${g} = 0\n${kw('while')} (${g} < ${r.int(4) + 1}${r.chance(0.3) ? ` && ${e('bool')}` : ''}) {\n${g} = ${g} + 1\n${inner}}`;
      }
      case 8:
        if (loop) return r.chance(0.5) ? kw('break') : kw('continue');
        return `${kw('print')}(${e('any')})`;
      case 9:
        if (func) return `${kw('return')}${r.chance(0.8) ? ` ${e('any')}` : ''}`;
        return `${name('func')}(${e('any')})`;
      case 10:
      case 11: {
        const params = Array.from({ length: r.int(3) }, (_, i) =>
          r.pick(['a', 'b', 'n', 'x', 'ক'].slice(i)),
        );
        const unique = [...new Set(params)];
        const here = scopes[scopes.length - 1] ?? [];
        const options = ['f', 'g', 'h', 'যোগ', 'k', 'ফ'];
        const free = options.filter((n) => !here.includes(n) || r.chance(0.1));
        const fn = declare(r.pick(free.length > 0 ? free : options), 'func');
        return `${kw('function')} ${fn}(${unique.join(', ')}) ${block(depth - 1, false, true, unique)}`;
      }
      case 12: {
        // A closure made in a loop, called after the loop: per-iteration variables.
        const g = `w${guard++}`;
        return [
          `${kw('let')} fs${g} = []`,
          `${kw('let')} ${g} = 0`,
          `${kw('while')} (${g} < 3) {`,
          `${kw('let')} ${r.pick(['v', 'x', 'n'])} = ${g} * 10`,
          `${g} = ${g} + 1`,
          `${kw('function')} c() { ${r.chance(0.5) ? `v = v + 1; ` : ''}${kw('return')} ${r.pick(['v', 'x', 'n', g])} }`,
          `${bi('append')}(fs${g}, c)`,
          `}`,
          `${kw('print')}(fs${g}[0](), fs${g}[${r.int(3)}]())`,
        ].join('\n');
      }
      case 13:
        return block(depth - 1, loop, func);
      case 14: {
        // প্ৰতিটো over a list (mostly), a text, or sometimes anything (R021).
        const v = r.pick(['it', 'v', 'ক', 'x']);
        const source = r.chance(0.6) ? e('list') : r.chance(0.6) ? e('str') : e('any');
        const head = `${v} ${source} ${kw('in')}`;
        return `${kw('forEach')} ${r.chance(0.3) ? `(${head})` : head} ${block(depth - 1, true, func, [v])}`;
      }
      case 15: {
        // A closure made in a প্ৰতিটো loop keeps that iteration's variable.
        const g = `w${guard++}`;
        return [
          `${kw('let')} fs${g} = []`,
          `${kw('forEach')} v [1, "দুই", ${r.pick(NUMBERS)}] ${kw('in')} {`,
          `${kw('function')} c() { ${r.chance(0.5) ? `v = v + 1; ` : ''}${kw('return')} v }`,
          `${bi('append')}(fs${g}, c)`,
          `}`,
          `${kw('print')}(fs${g}[0](), fs${g}[${r.int(3)}](), fs${g}[2]())`,
        ].join('\n');
      }
      default:
        return `${kw('print')}(${name()})`;
    }
  };

  const statements = (n: number, depth: number, loop: boolean, func: boolean): string => {
    let out = '';
    for (let i = 0; i < n; i++) out += statement(depth, loop, func) + '\n';
    return out;
  };

  const start = [
    `${kw('let')} ${declare('n', 'num')} = ${r.pick(NUMBERS)}`,
    `${kw('let')} ${declare('s', 'str')} = "${r.pick(STRINGS)}"`,
    `${kw('let')} ${declare('xs', 'list')} = [1, "দুই", ${r.pick(NUMBERS)}]`,
    `${kw('function')} ${declare('f', 'func')}(a) { ${kw('return')} a }`,
    `${kw('function')} ${declare('g', 'func')}(a) { ${kw('print')}(a); ${kw('return')} [a] }`,
  ].join('\n');
  const source =
    start +
    '\n' +
    statements(r.int(8) + 3, 3, false, false) +
    `${kw('print')}(${name()}, ${name()})\n`;
  const stdin = r.pick(['', 'ৰীতা\n', '42\n৭\n', 'a\r\nb', 'x\n\ny\n', '  3.5 \n']);
  return { source, stdin };
}
