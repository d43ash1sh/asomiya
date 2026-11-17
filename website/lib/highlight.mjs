// Syntax highlighting with Asomiya's own lexer, at build time. Comments are not tokens, so they
// are found in the gaps between tokens.
import { BUILTIN_NAMES, BUILTIN_ROMAN, tokenize } from '../../dist/index.js';
import { esc } from './html.mjs';

const BUILTINS = new Set([...Object.values(BUILTIN_NAMES), ...Object.values(BUILTIN_ROMAN).flat()]);
const LITERALS = new Set(['True', 'False', 'Null']);
const STRUCTURAL = new Set([
  'LeftParen',
  'RightParen',
  'LeftBrace',
  'RightBrace',
  'LeftBracket',
  'RightBracket',
  'Comma',
  'Semicolon',
  'Danda',
]);

function classFor(token, next) {
  if (token.type === 'String') return 'str';
  if (token.type === 'Number') return 'num';
  if (LITERALS.has(token.type)) return 'lit';
  if (token.type === 'Identifier') {
    if (BUILTINS.has(token.name)) return 'fn';
    if (next?.type === 'LeftParen') return 'call';
    return 'id';
  }
  if (STRUCTURAL.has(token.type)) return 'punc';
  return /^\p{L}/u.test(token.lexeme) ? 'kw' : 'op';
}

function gap(text) {
  // A gap holds whitespace and comments only.
  return text.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|([^/]+|\/)/g, (m, comment) =>
    comment === undefined ? esc(m) : `<span class="tok-com">${esc(m)}</span>`,
  );
}

export function highlight(source) {
  let tokens;
  try {
    tokens = tokenize(source).filter((t) => t.type !== 'EOF' && t.type !== 'Newline');
  } catch {
    return esc(source);
  }
  let out = '';
  let pos = 0;
  tokens.forEach((token, i) => {
    const { offset: start } = token.span.start;
    const { offset: end } = token.span.end;
    out += gap(source.slice(pos, start));
    out += `<span class="tok-${classFor(token, tokens[i + 1])}">${esc(source.slice(start, end))}</span>`;
    pos = end;
  });
  return out + gap(source.slice(pos));
}
