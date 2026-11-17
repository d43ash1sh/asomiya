import type { Span } from '../lexer/token';
import type { BlockStatement } from '../parser/ast';
import type { Environment } from './environment';

export interface NumberValue {
  readonly kind: 'number';
  readonly value: number;
}

export interface StringValue {
  readonly kind: 'string';
  /** Always NFC-normalised. */
  readonly value: string;
}

export interface BooleanValue {
  readonly kind: 'boolean';
  readonly value: boolean;
}

export interface NullValue {
  readonly kind: 'null';
}

export interface ListValue {
  readonly kind: 'list';
  /** Mutable: lists are shared by reference. */
  readonly elements: Value[];
}

export interface UserFunctionValue {
  readonly kind: 'function';
  readonly variant: 'user';
  readonly name: string;
  readonly params: readonly string[];
  readonly body: BlockStatement;
  readonly closure: Environment;
}

export type DigitStyle = 'assamese' | 'ascii';

/**
 * How numbers are printed. `auto` uses Assamese digits, except for programs whose keywords are
 * written in Latin letters (dhora, kowa …), which get 0-9.
 */
export type DigitSetting = DigitStyle | 'auto';

/** What a built-in may touch. Built-ins get nothing else from the host. */
export interface BuiltinContext {
  readonly callSpan: Span;
  readonly argSpans: readonly Span[];
  /** Display form of a value, enforcing the text-length limit. */
  readonly display: (value: Value) => string;
  /** Charges extra execution steps for work proportional to `size`. */
  readonly chargeFor: (size: number) => void;
  readonly write: (text: string) => void;
  readonly readLine: (() => string | null) | null;
}

export interface BuiltinFunctionValue {
  readonly kind: 'function';
  readonly variant: 'builtin';
  readonly name: string;
  readonly minArgs: number;
  readonly maxArgs: number;
  readonly call: (args: readonly Value[], ctx: BuiltinContext) => Value;
}

export type FunctionValue = UserFunctionValue | BuiltinFunctionValue;

export type Value =
  NumberValue | StringValue | BooleanValue | NullValue | ListValue | FunctionValue;

export const NULL: NullValue = { kind: 'null' };
const TRUE: BooleanValue = { kind: 'boolean', value: true };
const FALSE: BooleanValue = { kind: 'boolean', value: false };

export const num = (value: number): NumberValue => ({ kind: 'number', value });
export const str = (value: string): StringValue => ({
  kind: 'string',
  value: value.normalize('NFC'),
});
export const bool = (value: boolean): BooleanValue => (value ? TRUE : FALSE);
export const list = (elements: Value[]): ListValue => ({ kind: 'list', elements });

/**
 * Structural equality for lists, identity for functions, value equality otherwise. No coercion.
 * `visit` is called once per list element compared, so the caller can charge execution steps:
 * lists that share references can make this exponential.
 */
export function valuesEqual(
  a: Value,
  b: Value,
  visit: () => void = () => undefined,
  seen: Set<ListValue> = new Set(),
): boolean {
  switch (a.kind) {
    case 'number':
    case 'string':
    case 'boolean':
      return b.kind === a.kind && a.value === b.value;
    case 'null':
      return b.kind === 'null';
    case 'function':
      return a === b;
    case 'list': {
      if (b.kind !== 'list') return false;
      if (a === b || seen.has(a)) return true; // identical or already being compared (cycle)
      if (a.elements.length !== b.elements.length) return false;
      seen.add(a);
      const equal = a.elements.every((el, i) => {
        visit();
        const other = b.elements[i];
        return other !== undefined && valuesEqual(el, other, visit, seen);
      });
      seen.delete(a);
      return equal;
    }
  }
}
