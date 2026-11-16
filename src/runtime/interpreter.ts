import { runtimeError } from '../errors/runtime-error';
import type { Span } from '../lexer/token';
import { graphemes } from '../lexer/unicode';
import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Expression,
  IndexExpression,
  LogicalExpression,
  Program,
  Statement,
  UnaryExpression,
} from '../parser/ast';
import { createBuiltins } from './builtins';
import { displayValue, reprValue } from './display';
import { Environment } from './environment';
import {
  NULL,
  bool,
  list,
  num,
  str,
  valuesEqual,
  type BuiltinContext,
  type DigitStyle,
  type Value,
} from './values';

export const DEFAULT_MAX_STEPS = 10_000_000;
/** Kept well below what Node's default stack can hold (~700–900 levels for typical bodies). */
export const DEFAULT_MAX_CALL_DEPTH = 500;

export interface InterpreterOptions {
  /** Receives all program output. Defaults to discarding it. */
  readonly write?: (text: string) => void;
  /** Supplies one line of input per call, or null at end of input. `null` disables input. */
  readonly readLine?: (() => string | null) | null;
  /** Execution budget per `run` call. `Infinity` disables the limit. */
  readonly maxSteps?: number;
  readonly maxCallDepth?: number;
  readonly digits?: DigitStyle;
  /** Lets top-level `ধৰা` re-declare a name (useful in the REPL). */
  readonly allowTopLevelRedeclaration?: boolean;
}

/** How a statement finished. Control flow is data, not exceptions. */
type Completion =
  | { readonly type: 'normal' }
  | { readonly type: 'break' }
  | { readonly type: 'return'; readonly value: Value };

const NORMAL: Completion = { type: 'normal' };
const BREAK: Completion = { type: 'break' };

/**
 * A tree-walking evaluator. It only ever calls back to the host through `write` and `readLine`.
 */
export class Interpreter {
  readonly globals: Environment;
  private readonly write: (text: string) => void;
  private readonly readLine: (() => string | null) | null;
  private readonly maxSteps: number;
  private readonly maxCallDepth: number;
  private readonly digits: DigitStyle;
  private readonly allowTopLevelRedeclaration: boolean;
  private steps = 0;
  private callDepth = 0;
  private lastCallSpan: Span | null = null;

  constructor(options: InterpreterOptions = {}) {
    this.write = options.write ?? (() => undefined);
    this.readLine = options.readLine ?? null;
    this.maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS;
    this.maxCallDepth = options.maxCallDepth ?? DEFAULT_MAX_CALL_DEPTH;
    this.digits = options.digits ?? 'assamese';
    this.allowTopLevelRedeclaration = options.allowTopLevelRedeclaration ?? false;

    const builtinScope = new Environment(null);
    for (const [name, fn] of createBuiltins()) {
      builtinScope.declare(name, fn, { start: zero, end: zero });
    }
    this.globals = new Environment(builtinScope);
  }

  /**
   * Runs a program in the global scope (state persists between calls, as in a REPL).
   * Returns the value of the last top-level expression statement, if any.
   */
  run(program: Program): Value | undefined {
    this.steps = 0;
    this.callDepth = 0;
    let last: Value | undefined;
    try {
      for (const statement of program.body) {
        if (statement.kind === 'ExpressionStatement') {
          this.tick(statement.span);
          last = this.evaluate(statement.expression, this.globals);
        } else {
          last = undefined;
          this.execute(statement, this.globals, true);
        }
      }
    } catch (error) {
      // The call-depth limit normally fires first, but a raised limit can still exhaust the
      // host stack. Report that as a language error, never as a JS crash.
      if (error instanceof RangeError) {
        throw runtimeError('R018', {}, this.lastCallSpan ?? program.span);
      }
      throw error;
    }
    return last;
  }

  /** Display form of a value under this interpreter's digit style. */
  display(value: Value): string {
    return displayValue(value, this.digits);
  }

  repr(value: Value): string {
    return reprValue(value, this.digits);
  }

  private tick(span: Span): void {
    if (++this.steps > this.maxSteps) {
      throw runtimeError('R008', { limit: this.maxSteps }, span);
    }
  }

  // ── statements ──────────────────────────────────────────────────────

  private executeBlock(statements: readonly Statement[], env: Environment): Completion {
    for (const statement of statements) {
      const completion = this.execute(statement, env, false);
      if (completion.type !== 'normal') return completion;
    }
    return NORMAL;
  }

  private execute(statement: Statement, env: Environment, topLevel: boolean): Completion {
    this.tick(statement.span);
    switch (statement.kind) {
      case 'VariableDeclaration': {
        const value =
          statement.initializer === null ? NULL : this.evaluate(statement.initializer, env);
        env.declare(
          statement.name.name,
          value,
          statement.name.span,
          topLevel && this.allowTopLevelRedeclaration,
        );
        return NORMAL;
      }
      case 'FunctionDeclaration': {
        env.declare(
          statement.name.name,
          {
            kind: 'function',
            variant: 'user',
            name: statement.name.name,
            params: statement.params.map((p) => p.name),
            body: statement.body,
            closure: env,
          },
          statement.name.span,
          topLevel && this.allowTopLevelRedeclaration,
        );
        return NORMAL;
      }
      case 'IfStatement': {
        if (this.condition(statement.condition, env)) {
          return this.executeBlock(statement.consequent.body, new Environment(env));
        }
        const alt = statement.alternate;
        if (alt === null) return NORMAL;
        return alt.kind === 'IfStatement'
          ? this.execute(alt, env, false)
          : this.executeBlock(alt.body, new Environment(env));
      }
      case 'WhileStatement': {
        while (this.condition(statement.condition, env)) {
          const completion = this.executeBlock(statement.body.body, new Environment(env));
          if (completion.type === 'break') break;
          if (completion.type === 'return') return completion;
        }
        return NORMAL;
      }
      case 'BreakStatement':
        return BREAK;
      case 'ReturnStatement':
        return {
          type: 'return',
          value: statement.value === null ? NULL : this.evaluate(statement.value, env),
        };
      case 'PrintStatement': {
        const parts = statement.args.map((arg) => this.display(this.evaluate(arg, env)));
        this.write(parts.join(' ') + '\n');
        return NORMAL;
      }
      case 'BlockStatement':
        return this.executeBlock(statement.body, new Environment(env));
      case 'ExpressionStatement':
        this.evaluate(statement.expression, env);
        return NORMAL;
    }
  }

  private condition(expression: Expression, env: Environment): boolean {
    const value = this.evaluate(expression, env);
    if (value.kind !== 'boolean') {
      throw runtimeError('R007', { type: value.kind }, expression.span);
    }
    return value.value;
  }

  // ── expressions ─────────────────────────────────────────────────────

  private evaluate(expression: Expression, env: Environment): Value {
    this.tick(expression.span);
    switch (expression.kind) {
      case 'NumberLiteral':
        return num(expression.value);
      case 'StringLiteral':
        return str(expression.value);
      case 'BooleanLiteral':
        return bool(expression.value);
      case 'NullLiteral':
        return NULL;
      case 'ListLiteral':
        return list(expression.elements.map((el) => this.evaluate(el, env)));
      case 'Identifier':
        return env.lookup(expression.name, expression.span);
      case 'UnaryExpression':
        return this.unary(expression, env);
      case 'BinaryExpression':
        return this.binary(expression, env);
      case 'LogicalExpression':
        return this.logical(expression, env);
      case 'IndexExpression':
        return this.index(expression, env);
      case 'AssignmentExpression':
        return this.assign(expression, env);
      case 'CallExpression':
        return this.call(expression, env);
    }
  }

  private unary(expression: UnaryExpression, env: Environment): Value {
    const operand = this.evaluate(expression.operand, env);
    if (expression.operator === '-' && operand.kind === 'number') return num(-operand.value);
    if (expression.operator === '!' && operand.kind === 'boolean') return bool(!operand.value);
    throw runtimeError('R013', { op: expression.operator, type: operand.kind }, expression.span);
  }

  private binary(expression: BinaryExpression, env: Environment): Value {
    const left = this.evaluate(expression.left, env);
    const right = this.evaluate(expression.right, env);
    const op = expression.operator;

    switch (op) {
      case '==':
        return bool(valuesEqual(left, right));
      case '!=':
        return bool(!valuesEqual(left, right));
      case '+':
        if (left.kind === 'number' && right.kind === 'number') return num(left.value + right.value);
        if (left.kind === 'string' || right.kind === 'string') {
          return str(this.display(left) + this.display(right));
        }
        if (left.kind === 'list' && right.kind === 'list') {
          return list([...left.elements, ...right.elements]);
        }
        break;
      case '<':
      case '<=':
      case '>':
      case '>=':
        if (
          (left.kind === 'number' && right.kind === 'number') ||
          (left.kind === 'string' && right.kind === 'string')
        ) {
          return bool(compare(op, left.value, right.value));
        }
        break;
      case '-':
      case '*':
      case '/':
      case '%':
        if (left.kind === 'number' && right.kind === 'number') {
          if ((op === '/' || op === '%') && right.value === 0) {
            throw runtimeError('R004', {}, expression.operatorSpan);
          }
          return num(arithmetic(op, left.value, right.value));
        }
        break;
    }
    throw runtimeError('R003', { op, left: left.kind, right: right.kind }, expression.operatorSpan);
  }

  private logical(expression: LogicalExpression, env: Environment): Value {
    const op = expression.operatorText;
    const left = this.evaluate(expression.left, env);
    if (left.kind !== 'boolean') {
      throw runtimeError('R017', { op, type: left.kind }, expression.left.span);
    }
    if (expression.operator === '&&' && !left.value) return left;
    if (expression.operator === '||' && left.value) return left;
    const right = this.evaluate(expression.right, env);
    if (right.kind !== 'boolean') {
      throw runtimeError('R017', { op, type: right.kind }, expression.right.span);
    }
    return right;
  }

  private index(expression: IndexExpression, env: Environment): Value {
    const object = this.evaluate(expression.object, env);
    const indexValue = this.evaluate(expression.index, env);
    if (object.kind === 'list') {
      const i = this.checkIndex(indexValue, object.elements.length, expression.index.span);
      return object.elements[i] ?? NULL;
    }
    if (object.kind === 'string') {
      const parts = graphemes(object.value);
      const i = this.checkIndex(indexValue, parts.length, expression.index.span);
      return str(parts[i] ?? '');
    }
    throw runtimeError('R012', { type: object.kind }, expression.object.span);
  }

  private checkIndex(value: Value, length: number, span: Span): number {
    if (value.kind !== 'number' || !Number.isInteger(value.value)) {
      throw runtimeError('R011', { value: this.repr(value) }, span);
    }
    if (value.value < 0 || value.value >= length) {
      throw runtimeError('R010', { index: value.value, length }, span);
    }
    return value.value;
  }

  private assign(expression: AssignmentExpression, env: Environment): Value {
    const target = expression.target;
    if (target.kind === 'Identifier') {
      const value = this.evaluate(expression.value, env);
      env.assign(target.name, value, target.span);
      return value;
    }
    const object = this.evaluate(target.object, env);
    const indexValue = this.evaluate(target.index, env);
    const value = this.evaluate(expression.value, env);
    if (object.kind === 'list') {
      const i = this.checkIndex(indexValue, object.elements.length, target.index.span);
      object.elements[i] = value;
      return value;
    }
    if (object.kind === 'string') throw runtimeError('R016', {}, target.span);
    throw runtimeError('R012', { type: object.kind }, target.object.span);
  }

  private call(expression: CallExpression, env: Environment): Value {
    const callee = this.evaluate(expression.callee, env);
    const args = expression.args.map((arg) => this.evaluate(arg, env));
    if (callee.kind !== 'function') {
      throw runtimeError('R005', { type: callee.kind }, expression.callee.span);
    }

    if (callee.variant === 'builtin') {
      if (args.length < callee.minArgs || args.length > callee.maxArgs) {
        throw runtimeError(
          'R006',
          { name: callee.name, min: callee.minArgs, max: callee.maxArgs, got: args.length },
          expression.span,
        );
      }
      const ctx: BuiltinContext = {
        callSpan: expression.span,
        argSpans: expression.args.map((a) => a.span),
        digits: this.digits,
        write: this.write,
        readLine: this.readLine,
      };
      return callee.call(args, ctx);
    }

    const arity = callee.params.length;
    if (args.length !== arity) {
      throw runtimeError(
        'R006',
        { name: callee.name, min: arity, max: arity, got: args.length },
        expression.span,
      );
    }
    if (this.callDepth >= this.maxCallDepth) {
      throw runtimeError('R009', { limit: this.maxCallDepth }, expression.span);
    }

    const scope = new Environment(callee.closure);
    callee.params.forEach((name, i) => {
      scope.declare(name, args[i] ?? NULL, expression.span);
    });

    this.callDepth++;
    this.lastCallSpan = expression.span;
    try {
      const completion = this.executeBlock(callee.body.body, scope);
      return completion.type === 'return' ? completion.value : NULL;
    } finally {
      this.callDepth--;
    }
  }
}

const zero = { offset: 0, line: 1, column: 1 };

function compare(op: '<' | '<=' | '>' | '>=', a: number | string, b: number | string): boolean {
  switch (op) {
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
  }
}

function arithmetic(op: '-' | '*' | '/' | '%', a: number, b: number): number {
  switch (op) {
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
    case '%':
      return a % b;
  }
}
