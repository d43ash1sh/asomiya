import { keywordWord } from '../language/keywords';
import { typeName } from '../language/types';
import { asciiDigitsToAssamese } from '../lexer/unicode';
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

/** Thrown when a display form would exceed the requested maximum length. */
export class DisplayTooLongError extends Error {
  constructor() {
    super('display form too long');
    this.name = 'DisplayTooLongError';
  }
}

/**
 * Renders into an accumulator with a running length, so that a list holding many references to
 * the same sub-list (whose display grows exponentially) fails fast instead of exhausting memory.
 */
class Renderer {
  private readonly parts: string[] = [];
  private length = 0;
  private readonly seen = new Set<ListValue>();

  constructor(
    private readonly digits: DigitStyle,
    private readonly maxLength: number,
  ) {}

  push(text: string): void {
    this.length += text.length;
    if (this.length > this.maxLength) throw new DisplayTooLongError();
    this.parts.push(text);
  }

  render(value: Value, quoteStrings: boolean): void {
    switch (value.kind) {
      case 'number':
        this.push(formatNumber(value.value, this.digits));
        return;
      case 'string':
        this.push(quoteStrings ? quote(value.value) : value.value);
        return;
      case 'boolean':
        this.push(keywordWord(value.value ? 'true' : 'false'));
        return;
      case 'null':
        this.push(keywordWord('null'));
        return;
      case 'function':
        this.push(`<${typeName('function', 'as')} ${value.name}>`);
        return;
      case 'list': {
        if (this.seen.has(value)) {
          this.push('[…]');
          return;
        }
        this.seen.add(value);
        this.push('[');
        value.elements.forEach((el, i) => {
          if (i > 0) this.push(', ');
          this.render(el, true);
        });
        this.push(']');
        this.seen.delete(value);
        return;
      }
    }
  }

  toString(): string {
    return this.parts.join('');
  }
}

function renderValue(
  value: Value,
  digits: DigitStyle,
  quoteStrings: boolean,
  maxLength: number,
): string {
  const renderer = new Renderer(digits, maxLength);
  renderer.render(value, quoteStrings);
  return renderer.toString();
}

/**
 * The form used by কোৱা, পাঠ() and string concatenation. Top-level text is not quoted.
 * Throws DisplayTooLongError past `maxLength` code units.
 */
export function displayValue(
  value: Value,
  digits: DigitStyle,
  maxLength = Number.POSITIVE_INFINITY,
): string {
  return renderValue(value, digits, false, maxLength);
}

/** The form used by the REPL to echo results. Text is quoted so "১" and ১ look different. */
export function reprValue(
  value: Value,
  digits: DigitStyle,
  maxLength = Number.POSITIVE_INFINITY,
): string {
  return renderValue(value, digits, true, maxLength);
}
