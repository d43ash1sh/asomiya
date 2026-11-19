/** A small Python highlighter for the playground's Python view. Pure: returns tokens, no DOM. */

export interface PyToken {
  readonly text: string;
  /** CSS class (the site's tok-* classes), or '' for plain text. */
  readonly cls: string;
}

const KEYWORDS = new Set(
  'and as break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(
    ' ',
  ),
);
const LITERALS = new Set(['True', 'False', 'None']);

const TOKEN =
  /(#[^\n]*)|([rbfu]{0,2}"""[\s\S]*?"""|[rbfu]{0,2}"(?:[^"\\\n]|\\.)*"|[rbfu]{0,2}'(?:[^'\\\n]|\\.)*')|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\bmath\.inf\b)|([\p{L}_][\p{L}\p{M}\p{N}_]*)|(\s+)|([^\s])/gu;

export function highlightPython(source: string): PyToken[] {
  const out: PyToken[] = [];
  let afterDef = false;
  for (const m of source.matchAll(TOKEN)) {
    const [text, comment, string, number, word] = m;
    let cls = '';
    if (comment !== undefined) cls = 'tok-com';
    else if (string !== undefined) cls = 'tok-str';
    else if (number !== undefined) cls = 'tok-num';
    else if (word !== undefined) {
      if (KEYWORDS.has(word)) cls = 'tok-kw';
      else if (LITERALS.has(word)) cls = 'tok-lit';
      else if (afterDef || source[m.index + word.length] === '(') cls = 'tok-call';
      afterDef = word === 'def' || word === 'class';
    }
    if (word === undefined && !/^\s+$/.test(text)) afterDef = false;
    const last = out[out.length - 1];
    if (last && last.cls === cls) out[out.length - 1] = { text: last.text + text, cls };
    else out.push({ text, cls });
  }
  return out;
}

/** Splits a translation into the helper section and the program itself. */
export function splitPython(python: string): { helpers: string; program: string } {
  const marker = python.indexOf('# ── the program');
  if (marker < 0) return { helpers: '', program: python };
  const start = python.indexOf('\n', marker) + 1;
  return {
    helpers: python.slice(0, marker).trimEnd(),
    program: python.slice(start).replace(/^\n+/, ''),
  };
}
