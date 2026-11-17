import { runtimeError } from '../errors/runtime-error';
import { BUILTIN_NAMES, BUILTIN_ROMAN, type BuiltinKey } from '../language/glossary';
import { ROMAN_TYPE_NAMES, typeName, type ValueKind } from '../language/types';
import { assameseDigitsToAscii, graphemes } from '../lexer/unicode';
import { MAX_LIST_LENGTH, MAX_TEXT_LENGTH } from './limits';
import {
  NULL,
  num,
  str,
  type BuiltinContext,
  type BuiltinFunctionValue,
  type ListValue,
  type NumberValue,
  type StringValue,
  type Value,
} from './values';

function builtin(
  name: string,
  minArgs: number,
  maxArgs: number,
  call: BuiltinFunctionValue['call'],
): BuiltinFunctionValue {
  return { kind: 'function', variant: 'builtin', name, minArgs, maxArgs, call };
}

function argAt(args: readonly Value[], index: number): Value {
  return args[index] ?? NULL;
}

function typeError(
  name: string,
  index: number,
  expected: readonly ValueKind[],
  got: Value,
  ctx: BuiltinContext,
): never {
  throw runtimeError(
    'R014',
    { name, position: index + 1, expected, got: got.kind },
    ctx.argSpans[index] ?? ctx.callSpan,
  );
}

const ASCII_NUMBER = /^-?[0-9]+(\.[0-9]+)?$/;
const ASSAMESE_NUMBER = /^-?[০-৯]+(\.[০-৯]+)?$/u;

/** Parses "২৪", "-3.5" … Returns null for anything that isn't a plain decimal number. */
function parseNumberText(text: string): number | null {
  const trimmed = text.trim();
  if (!ASCII_NUMBER.test(trimmed) && !ASSAMESE_NUMBER.test(trimmed)) return null;
  return Number(assameseDigitsToAscii(trimmed));
}

const length = builtin(BUILTIN_NAMES.length, 1, 1, (args, ctx) => {
  const x = argAt(args, 0);
  if (x.kind === 'string') {
    ctx.chargeFor(x.value.length);
    return num(graphemes(x.value).length);
  }
  if (x.kind === 'list') return num(x.elements.length);
  return typeError(BUILTIN_NAMES.length, 0, ['string', 'list'], x, ctx);
});

const typeOf = builtin(BUILTIN_NAMES.typeOf, 1, 1, (args, ctx) => {
  const kind = argAt(args, 0).kind;
  return str(ctx.roman ? ROMAN_TYPE_NAMES[kind] : typeName(kind, 'as'));
});

const toNumber = builtin(BUILTIN_NAMES.toNumber, 1, 1, (args, ctx): NumberValue | typeof NULL => {
  const x = argAt(args, 0);
  if (x.kind === 'number') return x;
  if (x.kind === 'string') {
    const parsed = parseNumberText(x.value);
    return parsed === null ? NULL : num(parsed);
  }
  return typeError(BUILTIN_NAMES.toNumber, 0, ['string', 'number'], x, ctx);
});

const toText = builtin(BUILTIN_NAMES.toText, 1, 1, (args, ctx): StringValue =>
  str(ctx.display(argAt(args, 0))),
);

const toInteger = builtin(BUILTIN_NAMES.toInteger, 1, 1, (args, ctx) => {
  const x = argAt(args, 0);
  if (x.kind !== 'number') return typeError(BUILTIN_NAMES.toInteger, 0, ['number'], x, ctx);
  return num(Math.trunc(x.value) + 0); // `+ 0` turns -0 into 0
});

const append = builtin(BUILTIN_NAMES.append, 2, 2, (args, ctx) => {
  const target = argAt(args, 0);
  if (target.kind !== 'list') return typeError(BUILTIN_NAMES.append, 0, ['list'], target, ctx);
  if (target.elements.length >= MAX_LIST_LENGTH) {
    throw runtimeError('R019', { type: 'list', limit: MAX_LIST_LENGTH }, ctx.callSpan);
  }
  (target satisfies ListValue).elements.push(argAt(args, 1));
  return NULL;
});

const input = builtin(BUILTIN_NAMES.input, 0, 1, (args, ctx) => {
  if (ctx.readLine === null) throw runtimeError('R015', {}, ctx.callSpan);
  const prompt = args[0];
  if (prompt !== undefined) ctx.write(ctx.display(prompt));
  const line = ctx.readLine();
  if (line === null) return NULL;
  // Input is text like any other, so it obeys the same size limit.
  if (line.length > MAX_TEXT_LENGTH) {
    throw runtimeError('R019', { type: 'string', limit: MAX_TEXT_LENGTH }, ctx.callSpan);
  }
  return str(line);
});

/** All built-ins, keyed by their (already NFC) names. */
export function createBuiltins(): ReadonlyMap<string, BuiltinFunctionValue> {
  const byKey: Readonly<Record<BuiltinKey, BuiltinFunctionValue>> = {
    length,
    typeOf,
    toNumber,
    toText,
    toInteger,
    append,
    input,
  };
  const out = new Map<string, BuiltinFunctionValue>();
  for (const key of Object.keys(byKey) as BuiltinKey[]) {
    const fn = byKey[key];
    out.set(fn.name.normalize('NFC'), fn);
    // Romanised names (BUILTIN_ROMAN) call the same function; messages use the Assamese name.
    for (const spelling of BUILTIN_ROMAN[key]) out.set(spelling, fn);
  }
  return out;
}
