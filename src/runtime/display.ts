import { asciiDigitsToAssamese } from '../lexer/unicode';
import { keywordWord } from '../language/keywords';
import { typeName } from '../language/types';
import type { DigitStyle, ListValue, Value } from './values';

export function formatNumber(n: number, digits: DigitStyle): string {
  if (Number.isNaN(n)) return digits === 'assamese' ? 'অনিৰ্ণেয়' : 'NaN';
  if (!Number.isFinite(n)) {
    const sign = n < 0 ? '-' : '';
    return sign + (digits === 'assamese' ? 'অসীম' : 'Infinity');
  }
  const text = String(Object.is(n, -0) ? 0 : n);
  return digits === 'assamese' ? asciiDigitsToAssamese(text) : text;
}

const QUOTE_ESCAPES: Readonly<Record<string, string>> = {
  '\\': '\\\\',
  '"': '\\"',
  '\n': '\\n',
  '\t': '\\t',
  '\r': '\\r',
};

function quote(text: string): string {
  return `"${text.replace(/[\\"\n\t\r]/g, (c) => QUOTE_ESCAPES[c] ?? c)}"`;
}

function render(
  value: Value,
  digits: DigitStyle,
  quoteStrings: boolean,
  seen: Set<ListValue>,
): string {
  switch (value.kind) {
    case 'number':
      return formatNumber(value.value, digits);
    case 'string':
      return quoteStrings ? quote(value.value) : value.value;
    case 'boolean':
      return keywordWord(value.value ? 'true' : 'false');
    case 'null':
      return keywordWord('null');
    case 'function':
      return `<${typeName('function', 'as')} ${value.name}>`;
    case 'list': {
      if (seen.has(value)) return '[…]';
      seen.add(value);
      const inner = value.elements.map((el) => render(el, digits, true, seen)).join(', ');
      seen.delete(value);
      return `[${inner}]`;
    }
  }
}

/** The form used by কোৱা, পাঠ() and string concatenation. Top-level text is not quoted. */
export function displayValue(value: Value, digits: DigitStyle): string {
  return render(value, digits, false, new Set());
}

/** The form used by the REPL to echo results. Text is quoted so "১" and ১ look different. */
export function reprValue(value: Value, digits: DigitStyle): string {
  return render(value, digits, true, new Set());
}
