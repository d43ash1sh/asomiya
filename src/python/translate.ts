/**
 * Translates an Asomiya program into an equivalent Python program.
 *
 * "Equivalent" is meant literally: the Python program prints exactly the same text, reads input
 * the same way, and stops with an error exactly where Asomiya would. (Asomiya's safety limits on
 * steps, call depth and sizes are not part of the translation.) Where Python behaves the same as
 * Asomiya the output uses plain Python; where it doesn't, it calls a small helper function that is
 * included at the top of the output. A static analysis decides which, so most code stays plain:
 *
 *  - Names are resolved statically, including Asomiya's block scopes, which Python lacks.
 *  - A type analysis proves when values are numbers, text or booleans, so `a + b`, `i < n` and
 *    `if done:` can be written as they would be in Python.
 */
import { BUILTIN_NAMES, BUILTIN_ROMAN, type BuiltinKey } from '../language/glossary';
import { keywordRoman, keywordWord } from '../language/keywords';
import { ROMAN_TYPE_NAMES, TYPE_NAMES, type ValueKind } from '../language/types';
import type {
  AssignmentExpression,
  BlockStatement,
  CallExpression,
  Expression,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  Program,
  Statement,
  VariableDeclaration,
} from '../parser/ast';
import type { DigitSetting } from '../runtime/values';
import { HELPER_INTERNALS, HELPERS } from './prelude';

export interface PythonOptions {
  /** How numbers are printed, as in the interpreter. Default `auto`. */
  readonly digits?: DigitSetting;
}

// ── types (a set of possible kinds, as a bit mask) ─────────────────────────

const NUM = 1n;
/** Text that starts with a letter, digit, space or sign (or is empty), not a combining mark. */
const STR_SAFE = 2n;
/** Text that might start with a combining mark (joining it to other text may renormalise it). */
const STR_RISKY = 64n;
const STR = STR_SAFE | STR_RISKY;
const BOOL = 4n;
const NULL = 8n;
const LIST = 16n;
const FUNC = 32n;
const KINDS = 127n;
/**
 * Every list is made by a list literal or by `+`; each such place ("site") has its own bit above
 * the kinds, so the analysis knows what a list may hold.
 */
const siteBit = (i: number): bigint => 1n << BigInt(7 + i);

/** True if every value of type `t` has one of the kinds in `kinds` (vacuously true for none). */
const only = (t: bigint, kinds: bigint): boolean => (t & ~kinds) === 0n;

const BUILTIN_RESULT: Readonly<Record<BuiltinKey, bigint>> = {
  length: NUM,
  typeOf: STR_SAFE,
  toNumber: NUM | NULL,
  toText: STR,
  toInteger: NUM,
  append: NULL,
  input: STR | NULL,
};

const BUILTIN_HELPER: Readonly<Record<BuiltinKey, string>> = {
  length: 'length',
  typeOf: 'type_name',
  toNumber: 'number',
  toText: 'text',
  toInteger: 'integer',
  append: 'append',
  input: 'ask',
};

// ── scopes and bindings ────────────────────────────────────────────────────

/** A Python function (or the module) that owns variables. */
class PyFunc {
  readonly children: PyFunc[] = [];
  readonly locals: Binding[] = [];
  /** Bindings this function or a nested one reads or writes, owned further out. */
  readonly free = new Set<Binding>();
  /** Non-boxed outer bindings this function assigns (needs `global` / `nonlocal`). */
  readonly writes = new Set<Binding>();
  /** Boxed outer bindings captured with a keyword-only parameter (see Binding.boxed). */
  readonly captures = new Set<Binding>();
  readonly names = new Set<string>();
  readonly returns: (Expression | null)[] = [];

  constructor(
    readonly parent: PyFunc | null,
    readonly decl: FunctionDeclaration | null,
  ) {
    parent?.children.push(this);
  }
}

type BindingKind = 'var' | 'func' | 'param' | 'builtin';

class Binding {
  pyName = '';
  /** The Python name of the `def` for a boxed function. */
  defName = '';
  type = 0n;
  /** For functions: what a call may return. */
  returnType = 0n;
  captured = false;
  escapes = false;
  reassigned = false;
  /** Referenced from a nested function before it may be declared, with something to fall back on. */
  dynamic = false;
  readonly values: Expression[] = [];
  readonly calls: CallExpression[] = [];

  constructor(
    readonly name: string,
    readonly kind: BindingKind,
    readonly owner: PyFunc,
    /** Index of the declaring statement in its scope (-1: parameter or built-in). */
    readonly index: number,
    /** Declared inside a loop body (in the same Python function). */
    readonly inLoop: boolean,
    readonly decl: VariableDeclaration | FunctionDeclaration | null,
    readonly builtin: BuiltinKey | null = null,
  ) {}

  /**
   * A variable declared in a loop body is a new variable on every iteration, and a function made
   * in that iteration keeps it. Python has one variable per function, so such variables live in a
   * one-item list (a "box") that each function captures when it is defined.
   */
  get boxed(): boolean {
    return this.inLoop && this.captured;
  }

  /** Starts as UNSET when its block begins, so code can tell whether it is declared yet. */
  get preset(): boolean {
    return this.boxed || this.dynamic;
  }
}

class Scope {
  readonly decls = new Map<string, Binding>();
  constructor(
    readonly parent: Scope | null,
    readonly isFunction: boolean,
    readonly py: PyFunc,
    readonly inLoop: boolean,
  ) {}
}

/** What a name refers to: maybe-declared bindings first (innermost), then the certain one. */
interface Ref {
  readonly name: string;
  readonly maybe: readonly Binding[];
  readonly sure: Binding | null;
}

const candidates = (ref: Ref): Binding[] => (ref.sure ? [...ref.maybe, ref.sure] : [...ref.maybe]);

// ── names ──────────────────────────────────────────────────────────────────

const PY_KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield __debug__'.split(
    ' ',
  ),
);

const PY_BUILTINS =
  'abs aiter all anext any ascii bin bool breakpoint bytearray bytes callable chr classmethod compile complex copyright credits delattr dict dir divmod enumerate eval exec exit filter float format frozenset getattr globals hasattr hash help hex id input int isinstance issubclass iter len license list locals map max memoryview min next object oct open ord pow print property quit range repr reversed round set setattr slice sorted staticmethod str sum super tuple type vars zip __import__ __name__ __file__ __doc__ __builtins__ __spec__ __loader__ __package__ Exception BaseException'.split(
    ' ',
  );

const HELPER_NAMES = [...Object.keys(HELPERS), ...HELPER_INTERNALS];
/** Function-local names only need to avoid what generated code itself calls. */
const LOCAL_RESERVED = new Set([...PY_KEYWORDS, ...HELPER_NAMES, 'print']);
const MODULE_RESERVED = new Set([...LOCAL_RESERVED, ...PY_BUILTINS]);

const ID_START = /^[\p{XID_Start}_]$/u;
const ID_CONTINUE = /^\p{XID_Continue}$/u;

/** A valid Python identifier close to an Asomiya name. */
function pythonBase(name: string): string {
  let out = '';
  for (const ch of name.normalize('NFKC')) {
    if (ch === '‌' || ch === '‍') continue;
    if (out === '' ? ID_START.test(ch) : ID_CONTINUE.test(ch)) out += ch;
    else out += out === '' && ID_CONTINUE.test(ch) ? `_${ch}` : '_';
  }
  if (out === '' || out.normalize('NFKC') !== out) out = 'name';
  return out;
}

// ── Python source helpers ──────────────────────────────────────────────────

function pyString(s: string): string {
  let out = '"';
  for (const ch of s) {
    const cp = ch.codePointAt(0) ?? 0;
    if (ch === '\\') out += '\\\\';
    else if (ch === '"') out += '\\"';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f))
      out += `\\x${cp.toString(16).padStart(2, '0')}`;
    else if ((cp >= 0xd800 && cp <= 0xdfff) || cp === 0x2028 || cp === 0x2029 || cp === 0xfeff) {
      out += `\\u${cp.toString(16).padStart(4, '0')}`;
    } else out += ch;
  }
  return out + '"';
}

/** Number literals are floats, like every Asomiya number (JavaScript doubles). */
function pyNumber(n: number): string {
  if (!Number.isFinite(n)) return 'math.inf';
  const s = String(n);
  return /[.e]/.test(s) ? s : `${s}.0`;
}

/** Can text starting with this character be joined to other text without renormalising? */
function startsSafely(s: string): boolean {
  const first = s.codePointAt(0);
  if (first === undefined) return true;
  if (/^\p{M}$/u.test(String.fromCodePoint(first))) return false;
  return !((first >= 0x1160 && first <= 0x11ff) || (first >= 0xd7b0 && first <= 0xd7ff));
}

/** Python operator precedence, lowest to highest. */
const P = { cond: 1, or: 2, and: 3, not: 4, cmp: 5, add: 6, mul: 7, unary: 8, atom: 9 } as const;

interface Code {
  readonly code: string;
  readonly prec: number;
}

const atom = (code: string): Code => ({ code, prec: P.atom });
const wrap = (c: Code, min: number): string => (c.prec < min ? `(${c.code})` : c.code);

/** No calls and no assignments: evaluating it can't change any variable. */
function isPure(e: Expression): boolean {
  switch (e.kind) {
    case 'CallExpression':
    case 'AssignmentExpression':
      return false;
    case 'ListLiteral':
      return e.elements.every(isPure);
    case 'UnaryExpression':
      return isPure(e.operand);
    case 'BinaryExpression':
    case 'LogicalExpression':
      return isPure(e.left) && isPure(e.right);
    case 'IndexExpression':
      return isPure(e.object) && isPure(e.index);
    default:
      return true;
  }
}

/** A literal list index Python can use as is: 0, 1, 2 … */
function plainIndex(e: Expression): number | null {
  return e.kind === 'NumberLiteral' &&
    Number.isInteger(e.value) &&
    e.value >= 0 &&
    e.value < 2 ** 31
    ? e.value
    : null;
}

function completesNormally(statements: readonly Statement[]): boolean {
  const last = statements[statements.length - 1];
  if (last === undefined) return true;
  if (last.kind === 'ReturnStatement') return false;
  if (last.kind === 'BlockStatement') return completesNormally(last.body);
  if (last.kind === 'IfStatement') {
    let s: IfStatement = last;
    for (;;) {
      if (completesNormally(s.consequent.body)) return true;
      if (s.alternate === null) return true;
      if (s.alternate.kind === 'BlockStatement') return completesNormally(s.alternate.body);
      s = s.alternate;
    }
  }
  return true;
}

// ── the translator ─────────────────────────────────────────────────────────

class Translator {
  private readonly module = new PyFunc(null, null);
  private readonly builtinScope: Scope;
  private readonly refs = new Map<Identifier | AssignmentExpression, Ref>();
  private readonly declared = new Map<VariableDeclaration | FunctionDeclaration, Binding | null>();
  private readonly scopes = new Map<BlockStatement | Program | FunctionDeclaration, Scope>();
  private readonly funcs = new Map<FunctionDeclaration, PyFunc>();
  private readonly bindings: Binding[] = [];
  /** Statement stack used while resolving: the scope and the index of the current statement. */
  private frames: { scope: Scope; index: number }[] = [];
  private py: PyFunc;
  private readonly used = new Set<string>();
  private readonly renamedBuiltins = new Set<BuiltinKey>();
  private types = new Map<Expression, bigint>();
  private readonly sites = new Map<Expression, number>();
  private siteElements: bigint[] = [];
  private readonly siteParts: Expression[][] = [];
  /** (list, value) pairs: values stored into lists by সংযোজন and by `list[i] = value`. */
  private readonly listWrites: { list: Expression; value: Expression }[] = [];
  private any = KINDS;
  private lists = LIST;
  private appendBinding: Binding | null = null;
  private readonly ascii: boolean;
  private readonly roman: boolean;

  constructor(
    private readonly program: Program,
    options: PythonOptions,
  ) {
    this.roman = program.roman;
    const digits = options.digits ?? 'auto';
    this.ascii = digits === 'ascii' || (digits === 'auto' && program.roman);
    this.py = this.module;
    this.builtinScope = new Scope(null, false, this.module, false);
    for (const key of Object.keys(BUILTIN_NAMES) as BuiltinKey[]) {
      const b = new Binding(BUILTIN_NAMES[key], 'builtin', this.module, -1, false, null, key);
      b.pyName = BUILTIN_HELPER[key];
      b.type = FUNC;
      if (key === 'append') this.appendBinding = b;
      for (const name of [BUILTIN_NAMES[key].normalize('NFC'), ...BUILTIN_ROMAN[key]]) {
        this.builtinScope.decls.set(name, b);
      }
    }
  }

  translate(): string {
    const scope = new Scope(this.builtinScope, false, this.module, false);
    this.scopes.set(this.program, scope);
    this.declareAll(this.program.body, scope);
    this.resolveStatements(this.program.body, scope);
    this.inferTypes();
    this.assignNames(this.module);
    const body = this.emitStatements(this.program.body, scope, '');
    return this.assemble(body);
  }

  // ── pass 1: scopes and name resolution ──────────────────────────────────

  private declareAll(statements: readonly Statement[], scope: Scope): void {
    statements.forEach((s, index) => {
      if (s.kind !== 'VariableDeclaration' && s.kind !== 'FunctionDeclaration') return;
      const name = s.name.name;
      if (scope.decls.has(name)) {
        this.declared.set(s, null); // declared twice: an error when it runs
        return;
      }
      const kind = s.kind === 'FunctionDeclaration' ? 'func' : 'var';
      const b = new Binding(name, kind, scope.py, index, scope.inLoop, s);
      scope.decls.set(name, b);
      scope.py.locals.push(b);
      this.bindings.push(b);
      this.declared.set(s, b);
    });
  }

  private resolveStatements(statements: readonly Statement[], scope: Scope): void {
    const frame = { scope, index: 0 };
    this.frames.push(frame);
    statements.forEach((s, index) => {
      frame.index = index;
      this.resolveStatement(s);
    });
    this.frames.pop();
  }

  private currentScope(): Scope {
    const frame = this.frames[this.frames.length - 1];
    if (frame === undefined) throw new Error('no scope');
    return frame.scope;
  }

  private resolveBlock(block: BlockStatement, loop: boolean): void {
    const parent = this.currentScope();
    const scope = new Scope(parent, false, this.py, parent.inLoop || loop);
    this.scopes.set(block, scope);
    this.declareAll(block.body, scope);
    this.resolveStatements(block.body, scope);
  }

  private resolveStatement(s: Statement): void {
    switch (s.kind) {
      case 'VariableDeclaration': {
        if (s.initializer !== null) this.resolveExpression(s.initializer, false);
        const b = this.declared.get(s);
        if (b) b.values.push(s.initializer ?? { kind: 'NullLiteral', span: s.span });
        return;
      }
      case 'FunctionDeclaration': {
        const parentPy = this.py;
        const py = new PyFunc(parentPy, s);
        this.funcs.set(s, py);
        const scope = new Scope(this.currentScope(), true, py, false);
        this.scopes.set(s, scope);
        for (const param of s.params) {
          const b = new Binding(param.name, 'param', py, -1, false, null);
          scope.decls.set(param.name, b);
          py.locals.push(b);
          this.bindings.push(b);
        }
        this.declareAll(s.body.body, scope);
        this.py = py;
        this.resolveStatements(s.body.body, scope);
        this.py = parentPy;
        return;
      }
      case 'IfStatement':
        this.resolveExpression(s.condition, false);
        this.resolveBlock(s.consequent, false);
        if (s.alternate?.kind === 'IfStatement') this.resolveStatement(s.alternate);
        else if (s.alternate) this.resolveBlock(s.alternate, false);
        return;
      case 'WhileStatement':
        this.resolveExpression(s.condition, false);
        this.resolveBlock(s.body, true);
        return;
      case 'BlockStatement':
        this.resolveBlock(s, false);
        return;
      case 'ReturnStatement':
        if (s.value !== null) this.resolveExpression(s.value, false);
        this.py.returns.push(s.value);
        return;
      case 'PrintStatement':
        for (const arg of s.args) this.resolveExpression(arg, false);
        return;
      case 'ExpressionStatement':
        this.resolveExpression(s.expression, false);
        return;
      case 'BreakStatement':
      case 'ContinueStatement':
        return;
    }
  }

  private resolveExpression(e: Expression, callee: boolean): void {
    switch (e.kind) {
      case 'Identifier':
        this.refs.set(e, this.lookup(e.name, callee, false));
        return;
      case 'ListLiteral':
        this.addSite(e, e.elements);
        for (const el of e.elements) this.resolveExpression(el, false);
        return;
      case 'UnaryExpression':
        this.resolveExpression(e.operand, false);
        return;
      case 'BinaryExpression':
        if (e.operator === '+') this.addSite(e, []);
        this.resolveExpression(e.left, false);
        this.resolveExpression(e.right, false);
        return;
      case 'LogicalExpression':
        this.resolveExpression(e.left, false);
        this.resolveExpression(e.right, false);
        return;
      case 'IndexExpression':
        this.resolveExpression(e.object, false);
        this.resolveExpression(e.index, false);
        return;
      case 'AssignmentExpression':
        if (e.target.kind === 'Identifier') {
          const ref = this.lookup(e.target.name, false, true);
          this.refs.set(e, ref);
          for (const b of candidates(ref)) b.values.push(e.value);
        } else {
          this.resolveExpression(e.target.object, false);
          this.resolveExpression(e.target.index, false);
          this.listWrites.push({ list: e.target.object, value: e.value });
        }
        this.resolveExpression(e.value, false);
        return;
      case 'CallExpression': {
        this.resolveExpression(e.callee, true);
        for (const arg of e.args) this.resolveExpression(arg, false);
        if (e.callee.kind === 'Identifier') {
          const ref = this.refs.get(e.callee);
          if (ref && ref.maybe.length === 0 && ref.sure) {
            ref.sure.calls.push(e);
            const [list, value] = e.args;
            if (ref.sure.builtin === 'append' && list && value)
              this.listWrites.push({ list, value });
          }
        }
        return;
      }
      default:
        return;
    }
  }

  /**
   * Which binding a name refers to at the current point. Asomiya looks names up when the code
   * runs, so a function may see a variable declared after it (if it is called later). Those
   * are "maybe" candidates; everything else is decided here.
   */
  private lookup(name: string, callee: boolean, write: boolean): Ref {
    const maybe: Binding[] = [];
    let sure: Binding | null = null;
    let crossedFunction = false;
    for (let f = this.frames.length - 1; f >= 0 && sure === null; f--) {
      const frame = this.frames[f];
      if (frame === undefined) break;
      const b = frame.scope.decls.get(name);
      if (b !== undefined) {
        if (b.kind === 'param' || b.index < frame.index) sure = b;
        else if (b.index === frame.index && b.kind === 'func')
          sure = b; // inside its own body
        else if (b.index > frame.index && crossedFunction) maybe.push(b);
      }
      if (frame.scope.isFunction) crossedFunction = true;
    }
    if (sure === null) sure = this.builtinScope.decls.get(name) ?? null;

    const ref: Ref = { name, maybe, sure };
    maybe.forEach((b, i) => {
      // Needs a declared-yet check if there is something to fall back on, or when written.
      if (i < maybe.length - 1 || sure !== null || write) b.dynamic = true;
    });
    for (const b of candidates(ref)) {
      if (!callee || maybe.length > 0) b.escapes = true;
      if (write) b.reassigned = true;
      if (b.kind === 'builtin') continue;
      if (b.owner !== this.py) {
        b.captured = true;
        for (let f: PyFunc | null = this.py; f !== null && f !== b.owner; f = f.parent) {
          f.free.add(b);
        }
        if (write) this.py.writes.add(b);
      }
    }
    return ref;
  }

  // ── pass 2: types ───────────────────────────────────────────────────────

  private addSite(e: Expression, parts: readonly Expression[]): void {
    this.sites.set(e, this.siteParts.length);
    this.siteParts.push([...parts]);
  }

  /** Union of what the lists in `t` may hold. */
  private elementsOf(t: bigint): bigint {
    let out = 0n;
    this.siteElements.forEach((elements, i) => {
      if (t & siteBit(i)) out |= elements;
    });
    return out;
  }

  private inferTypes(): void {
    const all = this.siteParts.reduce((bits, _, i) => bits | siteBit(i), 0n);
    this.any = KINDS | all;
    this.lists = LIST | all;
    this.siteElements = this.siteParts.map(() => 0n);
    // If সংযোজন is passed around as a value, any call might add anything to any list.
    const appendEscapes = this.appendBinding?.escapes ?? false;
    for (let round = 0; round < 10_000; round++) {
      this.types = new Map();
      let changed = false;
      for (const b of this.bindings) {
        const t = this.bindingType(b);
        if (t !== b.type) {
          b.type = t;
          changed = true;
        }
        if (b.kind === 'func' && b.decl?.kind === 'FunctionDeclaration') {
          const fn = this.funcs.get(b.decl);
          let r = b.returnType | (completesNormally(b.decl.body.body) ? NULL : 0n);
          for (const value of fn?.returns ?? []) r |= value === null ? NULL : this.typeOf(value);
          if (r !== b.returnType) {
            b.returnType = r;
            changed = true;
          }
        }
      }
      const next = this.siteElements.map((old, i) => {
        let t = old;
        for (const part of this.siteParts[i] ?? []) t |= this.typeOf(part);
        return appendEscapes ? this.any : t;
      });
      for (const [site, i] of this.sites) {
        if (site.kind !== 'BinaryExpression') continue;
        next[i] =
          (next[i] ?? 0n) | this.elementsOf(this.typeOf(site.left) | this.typeOf(site.right));
      }
      for (const { list, value } of this.listWrites) {
        const lists = this.typeOf(list);
        const v = this.typeOf(value);
        next.forEach((t, i) => {
          if (lists & siteBit(i)) next[i] = t | v;
        });
      }
      next.forEach((t, i) => {
        if (t !== this.siteElements[i]) changed = true;
      });
      this.siteElements = next;
      if (!changed) break;
    }
    this.types = new Map();
  }

  private bindingType(b: Binding): bigint {
    let t = b.type;
    for (const v of b.values) t |= this.typeOf(v);
    if (b.kind === 'func') t |= FUNC;
    if (b.kind === 'param') {
      const fn = this.paramFunction(b);
      if (fn === null) return this.any;
      const index = fn.decl?.params.findIndex((p) => p.name === b.name) ?? -1;
      for (const call of fn.calls) {
        const arg = call.args[index];
        if (call.args.length === fn.decl?.params.length && arg) t |= this.typeOf(arg);
      }
    }
    return t;
  }

  /** The function binding whose calls all go through its name (so its arguments are known). */
  private paramFunction(
    param: Binding,
  ): { decl: FunctionDeclaration | null; calls: CallExpression[] } | null {
    const decl = param.owner.decl;
    if (decl === null) return null;
    const scope = this.scopes.get(decl)?.parent;
    let fn: Binding | undefined;
    for (let s = scope; s && fn === undefined; s = s.parent) {
      const b = s.decls.get(decl.name.name);
      if (b?.decl === decl) fn = b;
    }
    if (fn === undefined || fn.escapes || fn.reassigned) return null;
    return { decl, calls: fn.calls };
  }

  private direct(b: Binding): boolean {
    return b.kind === 'func' && !b.escapes && !b.reassigned;
  }

  private typeOf(e: Expression): bigint {
    const cached = this.types.get(e);
    if (cached !== undefined) return cached;
    const t = this.computeType(e);
    this.types.set(e, t);
    return t;
  }

  private computeType(e: Expression): bigint {
    switch (e.kind) {
      case 'NumberLiteral':
        return NUM;
      case 'StringLiteral':
        return startsSafely(e.value) ? STR_SAFE : STR_RISKY;
      case 'BooleanLiteral':
        return BOOL;
      case 'NullLiteral':
        return NULL;
      case 'ListLiteral':
        return LIST | siteBit(this.sites.get(e) ?? 0);
      case 'Identifier': {
        const ref = this.refs.get(e);
        return ref ? candidates(ref).reduce((t, b) => t | b.type, 0n) : 0n;
      }
      case 'UnaryExpression':
        return e.operator === '-' ? NUM : BOOL;
      case 'BinaryExpression': {
        if (e.operator !== '+') return ['-', '*', '/', '%'].includes(e.operator) ? NUM : BOOL;
        const l = this.typeOf(e.left);
        const r = this.typeOf(e.right);
        let t = 0n;
        if (l & NUM && r & NUM) t |= NUM;
        if ((l & STR && r) || (r & STR && l)) t |= l & STR_RISKY || r & STR_RISKY ? STR : STR_SAFE;
        if (l & LIST && r & LIST) t |= LIST | siteBit(this.sites.get(e) ?? 0);
        return t;
      }
      case 'LogicalExpression':
        return BOOL;
      case 'IndexExpression': {
        const o = this.typeOf(e.object);
        return this.elementsOf(o) | (o & STR ? STR : 0n);
      }
      case 'AssignmentExpression':
        return this.typeOf(e.value);
      case 'CallExpression': {
        if (e.callee.kind !== 'Identifier') return this.any;
        const ref = this.refs.get(e.callee);
        const b = ref?.maybe.length === 0 ? ref.sure : null;
        if (!b) return ref && ref.maybe.length === 0 ? 0n : this.any;
        if (b.builtin === 'toText') {
          const arg = e.args[0];
          return arg && !(this.typeOf(arg) & STR_RISKY) ? STR_SAFE : STR;
        }
        if (b.builtin) return BUILTIN_RESULT[b.builtin];
        return this.direct(b) ? b.returnType : this.any;
      }
    }
  }

  // ── pass 3: Python names ────────────────────────────────────────────────

  private assignNames(py: PyFunc): void {
    const avoid = new Set(py === this.module ? MODULE_RESERVED : LOCAL_RESERVED);
    for (const b of py.free) avoid.add(b.pyName);
    const fresh = (base: string): string => {
      let name = base;
      for (let i = 2; avoid.has(name) || py.names.has(name); i++) name = `${base}_${i}`;
      py.names.add(name);
      return name;
    };
    for (const b of py.locals) {
      b.pyName = fresh(pythonBase(b.name));
      if (b.kind === 'func' && b.boxed) b.defName = fresh(`${b.pyName}_function`);
    }
    for (const child of py.children) {
      for (const b of child.free) {
        // A boxed variable is captured by the outermost function inside its owner.
        if (b.boxed && child.parent === b.owner) child.captures.add(b);
      }
      this.assignNames(child);
    }
  }

  // ── pass 4: emitting Python ─────────────────────────────────────────────

  private need(helper: string): string {
    this.used.add(helper);
    return helper;
  }

  private emitStatements(statements: readonly Statement[], scope: Scope, indent: string): string[] {
    const lines: string[] = [];
    for (const b of scope.decls.values()) {
      if (!b.preset || b.kind === 'param') continue;
      lines.push(
        `${indent}${b.pyName} = ${b.boxed ? `[${this.need('UNSET')}]` : this.need('UNSET')}`,
      );
    }
    for (const s of statements) lines.push(...this.emitStatement(s, indent));
    return lines;
  }

  private emitBody(block: BlockStatement, indent: string): string[] {
    const scope = this.scopes.get(block);
    if (!scope) throw new Error('unresolved block');
    const lines = this.emitStatements(block.body, scope, indent);
    return lines.length > 0 ? lines : [`${indent}pass`];
  }

  private condition(e: Expression): string {
    const c = this.expr(e);
    return only(this.typeOf(e), BOOL) ? c.code : `${this.need('is_true')}(${c.code})`;
  }

  private emitStatement(s: Statement, indent: string): string[] {
    switch (s.kind) {
      case 'VariableDeclaration': {
        const b = this.declared.get(s);
        const init = s.initializer === null ? null : this.expr(s.initializer).code;
        if (!b) {
          const args = [pyString(s.name.name), ...(init === null ? [] : [init])];
          return [`${indent}${this.need('redeclared')}(${args.join(', ')})`];
        }
        const target = b.boxed ? `${b.pyName}[0]` : b.pyName;
        return [`${indent}${target} = ${init ?? 'None'}`];
      }
      case 'FunctionDeclaration':
        return this.emitFunction(s, indent);
      case 'IfStatement': {
        const lines: string[] = [];
        let node: IfStatement = s;
        let keyword = 'if';
        for (;;) {
          lines.push(`${indent}${keyword} ${this.condition(node.condition)}:`);
          lines.push(...this.emitBody(node.consequent, indent + '    '));
          const alt = node.alternate;
          if (alt === null) break;
          if (alt.kind === 'IfStatement') {
            node = alt;
            keyword = 'elif';
            continue;
          }
          lines.push(`${indent}else:`);
          lines.push(...this.emitBody(alt, indent + '    '));
          break;
        }
        return lines;
      }
      case 'WhileStatement':
        return [
          `${indent}while ${this.condition(s.condition)}:`,
          ...this.emitBody(s.body, indent + '    '),
        ];
      case 'BreakStatement':
        return [`${indent}break`];
      case 'ContinueStatement':
        return [`${indent}continue`];
      case 'ReturnStatement':
        return [
          s.value === null ? `${indent}return` : `${indent}return ${this.expr(s.value).code}`,
        ];
      case 'PrintStatement': {
        const args = s.args.map((arg) => {
          const c = this.expr(arg);
          return only(this.typeOf(arg), STR) ? c.code : `${this.need('text')}(${c.code})`;
        });
        return [`${indent}print(${args.join(', ')})`];
      }
      case 'BlockStatement': {
        const scope = this.scopes.get(s);
        if (!scope) throw new Error('unresolved block');
        return this.emitStatements(s.body, scope, indent);
      }
      case 'ExpressionStatement': {
        const e = s.expression;
        if (e.kind === 'AssignmentExpression') return this.emitAssignStatement(e, indent);
        return [`${indent}${this.expr(e).code}`];
      }
    }
  }

  private emitFunction(s: FunctionDeclaration, indent: string): string[] {
    const b = this.declared.get(s);
    if (!b) return [`${indent}${this.need('redeclared')}(${pyString(s.name.name)})`];
    const py = this.funcs.get(s);
    const scope = this.scopes.get(s);
    if (!py || !scope) throw new Error('unresolved function');
    const inner = indent + '    ';
    const defName = b.boxed ? b.defName : b.pyName;
    const params = py.locals.filter((l) => l.kind === 'param').map((l) => l.pyName);
    const captures = [...py.captures].map((c) => `${c.pyName}=${c.pyName}`);
    const signature = [...params, ...(captures.length > 0 ? ['*', ...captures] : [])];

    const lines: string[] = [];
    if (indent === '') lines.push('', '');
    lines.push(`${indent}def ${defName}(${signature.join(', ')}):`);
    const header = lines.length;
    const globals = [...py.writes].filter((w) => !w.boxed && w.owner === this.module);
    const nonlocals = [...py.writes].filter((w) => !w.boxed && w.owner !== this.module);
    if (globals.length > 0) lines.push(`${inner}global ${globals.map((g) => g.pyName).join(', ')}`);
    if (nonlocals.length > 0) {
      lines.push(`${inner}nonlocal ${nonlocals.map((n) => n.pyName).join(', ')}`);
    }
    const body = this.emitStatements(s.body.body, scope, inner);
    lines.push(...(body.length > 0 || lines.length > header ? body : [`${inner}pass`]));
    if (b.boxed) lines.push(`${indent}${b.pyName}[0] = ${defName}`);
    if ((b.escapes || b.boxed) && defName !== b.name) {
      lines.push(`${indent}${defName}.__name__ = ${pyString(b.name)}`);
    }
    if (indent === '') lines.push('', '');
    return lines;
  }

  // ── names in expressions ────────────────────────────────────────────────

  private readBinding(b: Binding): string {
    if (b.builtin) {
      this.need(b.pyName);
      this.renamedBuiltins.add(b.builtin);
      return b.pyName;
    }
    return b.boxed ? `${b.pyName}[0]` : b.pyName;
  }

  private read(ref: Ref): Code {
    let result: Code = ref.sure
      ? atom(this.readBinding(ref.sure))
      : atom(`${this.need('undefined')}(${pyString(ref.name)})`);
    for (let i = ref.maybe.length - 1; i >= 0; i--) {
      const b = ref.maybe[i];
      if (b === undefined) continue;
      const value = this.readBinding(b);
      if (!b.preset) {
        result = atom(value); // not declared yet means Python raises NameError, as Asomiya does
        continue;
      }
      result = atom(`(${value} if ${value} is not ${this.need('UNSET')} else ${result.code})`);
    }
    return result;
  }

  private writeExpr(ref: Ref, value: string, maybe = ref.maybe): Code {
    const [first, ...rest] = maybe;
    if (first !== undefined) {
      const check = `${this.readBinding(first)} is not ${this.need('UNSET')}`;
      const here = first.boxed
        ? `${this.need('store')}(${first.pyName}, ${value})`
        : `(${first.pyName} := ${value})`;
      return atom(`(${here} if ${check} else ${this.writeExpr(ref, value, rest).code})`);
    }
    const b = ref.sure;
    if (b === null) return atom(`${this.need('undefined')}(${pyString(ref.name)}, ${value})`);
    if (b.builtin) return atom(`${this.need('read_only')}(${pyString(ref.name)}, ${value})`);
    if (b.boxed) return atom(`${this.need('store')}(${b.pyName}, ${value})`);
    return atom(`(${b.pyName} := ${value})`);
  }

  private emitAssignStatement(e: AssignmentExpression, indent: string): string[] {
    const value = this.expr(e.value);
    if (e.target.kind === 'IndexExpression') {
      const target = e.target;
      const index = plainIndex(target.index);
      const objectRef =
        target.object.kind === 'Identifier' ? this.refs.get(target.object) : undefined;
      if (
        index !== null &&
        objectRef?.maybe.length === 0 &&
        only(this.typeOf(target.object), this.lists) &&
        isPure(e.value)
      ) {
        return [`${indent}${this.expr(target.object).code}[${index}] = ${value.code}`];
      }
      return [`${indent}${this.expr(e).code}`];
    }
    const ref = this.refs.get(e);
    if (!ref) throw new Error('unresolved assignment');
    const b = ref.sure;
    if (ref.maybe.length === 0 && b !== null && !b.builtin) {
      return [`${indent}${b.boxed ? `${b.pyName}[0]` : b.pyName} = ${value.code}`];
    }
    if (ref.maybe.length > 0) {
      // Assign to the innermost variable that is declared by now.
      const lines: string[] = [];
      let keyword = 'if';
      for (const m of ref.maybe) {
        lines.push(`${indent}${keyword} ${this.readBinding(m)} is not ${this.need('UNSET')}:`);
        lines.push(`${indent}    ${m.boxed ? `${m.pyName}[0]` : m.pyName} = ${value.code}`);
        keyword = 'elif';
      }
      lines.push(`${indent}else:`);
      const rest = this.writeExpr(ref, value.code, []);
      const plain =
        b !== null && !b.builtin
          ? `${b.boxed ? `${b.pyName}[0]` : b.pyName} = ${value.code}`
          : rest.code;
      lines.push(`${indent}    ${plain}`);
      return lines;
    }
    return [`${indent}${this.writeExpr(ref, value.code).code}`];
  }

  // ── expressions ─────────────────────────────────────────────────────────

  private expr(e: Expression): Code {
    switch (e.kind) {
      case 'NumberLiteral':
        if (!Number.isFinite(e.value)) this.used.add('math');
        return atom(pyNumber(e.value));
      case 'StringLiteral':
        return atom(pyString(e.value));
      case 'BooleanLiteral':
        return atom(e.value ? 'True' : 'False');
      case 'NullLiteral':
        return atom('None');
      case 'ListLiteral':
        return atom(`[${e.elements.map((el) => this.expr(el).code).join(', ')}]`);
      case 'Identifier': {
        const ref = this.refs.get(e);
        if (!ref) throw new Error('unresolved name');
        return this.read(ref);
      }
      case 'UnaryExpression': {
        const operand = this.expr(e.operand);
        const t = this.typeOf(e.operand);
        if (e.operator === '-') {
          if (!only(t, NUM)) return atom(`${this.need('negate')}(${operand.code})`);
          const inner = wrap(operand, P.unary);
          return { code: inner.startsWith('-') ? `-(${inner})` : `-${inner}`, prec: P.unary };
        }
        const bool = only(t, BOOL)
          ? wrap(operand, P.not)
          : `${this.need('is_true')}(${operand.code})`;
        return { code: `not ${bool}`, prec: P.not };
      }
      case 'LogicalExpression': {
        const side = (x: Expression, min: number): string =>
          only(this.typeOf(x), BOOL)
            ? wrap(this.expr(x), min)
            : `${this.need('is_true')}(${this.expr(x).code})`;
        const [word, prec] = e.operator === '&&' ? ['and', P.and] : ['or', P.or];
        return { code: `${side(e.left, prec)} ${word} ${side(e.right, prec + 1)}`, prec };
      }
      case 'BinaryExpression':
        return this.binary(e);
      case 'IndexExpression': {
        const index = plainIndex(e.index);
        if (index !== null && only(this.typeOf(e.object), this.lists)) {
          return atom(`${wrap(this.expr(e.object), P.atom)}[${index}]`);
        }
        return atom(
          `${this.need('item')}(${this.expr(e.object).code}, ${this.expr(e.index).code})`,
        );
      }
      case 'AssignmentExpression': {
        if (e.target.kind === 'IndexExpression') {
          const t = e.target;
          return atom(
            `${this.need('put')}(${this.expr(t.object).code}, ${this.expr(t.index).code}, ${this.expr(e.value).code})`,
          );
        }
        const ref = this.refs.get(e);
        if (!ref) throw new Error('unresolved assignment');
        return this.writeExpr(ref, wrap(this.expr(e.value), P.cond));
      }
      case 'CallExpression':
        return this.call(e);
    }
  }

  private call(e: CallExpression): Code {
    const args = e.args.map((a) => this.expr(a).code);
    if (e.callee.kind === 'Identifier') {
      const ref = this.refs.get(e.callee);
      const b = ref?.maybe.length === 0 ? ref.sure : null;
      if (b?.builtin) {
        const [list, value] = e.args;
        if (
          b.builtin === 'append' &&
          list &&
          value &&
          e.args.length === 2 &&
          only(this.typeOf(list), this.lists)
        ) {
          return atom(`${wrap(this.expr(list), P.atom)}.append(${args[1]})`);
        }
        return atom(`${this.need(b.pyName)}(${args.join(', ')})`);
      }
    }
    return atom(`${wrap(this.expr(e.callee), P.atom)}(${args.join(', ')})`);
  }

  private binary(e: Expression & { kind: 'BinaryExpression' }): Code {
    const lt = this.typeOf(e.left);
    const rt = this.typeOf(e.right);
    const l = this.expr(e.left);
    const r = this.expr(e.right);
    const op = e.operator;
    const plain = (prec: number, sym: string, left = l, right = r): Code => ({
      code: `${wrap(left, prec)} ${sym} ${wrap(right, prec + 1)}`,
      prec,
    });
    const helper = (name: string, ...parts: string[]): Code =>
      atom(`${this.need(name)}(${parts.join(', ')})`);

    switch (op) {
      case '+': {
        if ((only(lt, NUM) && only(rt, NUM)) || (only(lt, this.lists) && only(rt, this.lists))) {
          return plain(P.add, '+');
        }
        // Plain + is exact when the right side can't start with a combining mark.
        const notText = this.any & ~STR;
        if (only(lt, STR) && only(rt, STR_SAFE)) return plain(P.add, '+');
        if (only(lt, STR) && only(rt, notText) && rt !== 0n) {
          return plain(P.add, '+', l, atom(`${this.need('text')}(${r.code})`));
        }
        if (only(lt, notText) && lt !== 0n && only(rt, STR_SAFE)) {
          return plain(P.add, '+', atom(`${this.need('text')}(${l.code})`), r);
        }
        return helper('add', l.code, r.code);
      }
      case '-':
      case '*':
      case '/':
        if (only(lt, NUM) && only(rt, NUM)) return plain(op === '-' ? P.add : P.mul, op);
        return helper(op === '-' ? 'subtract' : op === '*' ? 'multiply' : 'divide', l.code, r.code);
      case '%':
        return helper('remainder', l.code, r.code);
      case '<':
      case '<=':
      case '>':
      case '>=':
        if (only(lt, NUM) && only(rt, NUM)) {
          return { code: `${wrap(l, P.cmp + 1)} ${op} ${wrap(r, P.cmp + 1)}`, prec: P.cmp };
        }
        return helper('compare', l.code, pyString(op), r.code);
      case '==':
      case '!=': {
        const yes = op === '==';
        if (e.right.kind === 'NullLiteral' || e.left.kind === 'NullLiteral') {
          const other = e.right.kind === 'NullLiteral' ? l : r;
          return { code: `${wrap(other, P.cmp + 1)} ${yes ? 'is' : 'is not'} None`, prec: P.cmp };
        }
        if (this.plainEquality(lt, rt)) {
          return { code: `${wrap(l, P.cmp + 1)} ${op} ${wrap(r, P.cmp + 1)}`, prec: P.cmp };
        }
        const same = helper('same', l.code, r.code);
        return yes ? same : { code: `not ${same.code}`, prec: P.not };
      }
    }
  }

  /** Python's == agrees with Asomiya's unless it could compare a number with a boolean, or lists. */
  private plainEquality(a: bigint, b: bigint): boolean {
    if (only(a, STR) || only(b, STR) || only(a, NULL) || only(b, NULL)) return true;
    if (a & NUM && b & BOOL) return false;
    if (a & BOOL && b & NUM) return false;
    return !(a & LIST && b & LIST);
  }

  // ── putting it together ─────────────────────────────────────────────────

  private settings(): string {
    const word = (id: 'true' | 'false' | 'null'): string =>
      this.roman ? keywordRoman(id) : keywordWord(id);
    const typeName = (k: ValueKind): string =>
      this.roman ? ROMAN_TYPE_NAMES[k] : TYPE_NAMES[k].as;
    const kinds: ValueKind[] = ['number', 'string', 'boolean', 'null', 'list', 'function'];
    const names = kinds.map((k) => `    ${pyString(k)}: ${pyString(typeName(k))},`).join('\n');
    const lines = [
      `# How this program shows values (the playground's settings when it was translated).`,
      `TRUE_WORD, FALSE_WORD, NULL_WORD = ${pyString(word('true'))}, ${pyString(word('false'))}, ${pyString(word('null'))}`,
      `FUNCTION_WORD = ${pyString(typeName('function'))}`,
    ];
    if (this.ascii) {
      lines.push(`NAN_WORD, INFINITY_WORD = "NaN", "Infinity"`);
      lines.push(`DIGIT_TABLE = {}  # numbers print with 0-9`);
    } else {
      lines.push(`NAN_WORD, INFINITY_WORD = "অনিৰ্ণেয়", "অসীম"`);
      lines.push(`DIGIT_TABLE = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")  # numbers print as ১২৩`);
    }
    if (this.used.has('type_name')) lines.push(`TYPE_NAMES = {\n${names}\n}`);
    return lines.join('\n');
  }

  private assemble(body: string[]): string {
    // Close the helper set over its dependencies, in dependency order.
    const order: string[] = [];
    const visit = (name: string): void => {
      if (order.includes(name)) return;
      const helper = HELPERS[name];
      for (const dep of helper?.needs ?? []) if (dep !== 'settings') visit(dep);
      order.push(name);
    };
    for (const name of [...this.used]) if (HELPERS[name]) visit(name);
    const needsSettings = order.some((n) => HELPERS[n]?.needs.includes('settings'));
    const imports = new Set<string>(['sys']);
    if (this.used.has('math')) imports.add('math');
    for (const name of order) for (const i of HELPERS[name]?.imports ?? []) imports.add(i);

    const out: string[] = [
      '# Translated from Asomiya (https://asomiya.codes).',
      '# It prints exactly what the Asomiya program prints. Where plain Python behaves',
      '# differently, the code uses one of the small helper functions defined first.',
      '',
      ...[...imports].sort().map((i) => `import ${i}`),
      '',
      '# Print Assamese text correctly on every computer.',
      'if hasattr(sys.stdout, "reconfigure"):',
      '    sys.stdout.reconfigure(encoding="utf-8", newline="\\n")',
    ];
    if (order.length > 0) {
      out.push(
        '',
        '',
        '# ── helpers ─────────────────────────────────────────────────────────────',
      );
      if (needsSettings) out.push('', this.settings());
      for (const name of order) out.push('', '', HELPERS[name]?.code ?? '');
      const renamed = [...this.renamedBuiltins].map(
        (key) => `${BUILTIN_HELPER[key]}.__name__ = ${pyString(BUILTIN_NAMES[key])}`,
      );
      if (renamed.length > 0) out.push('', ...renamed);
    }
    out.push(
      '',
      '',
      '# ── the program ─────────────────────────────────────────────────────────',
      '',
    );
    while (body[body.length - 1] === '') body.pop();
    out.push(...body);
    return out.join('\n').replace(/\n{4,}/g, '\n\n\n') + '\n';
  }
}

/** Translates a parsed program into Python source. */
export function toPython(program: Program, options: PythonOptions = {}): string {
  return new Translator(program, options).translate();
}
