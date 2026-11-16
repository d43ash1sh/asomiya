import { describe, expect, it } from 'vitest';
import { ParserError } from '../../src/errors/parser-error';
import type { Expression, Statement } from '../../src/parser/ast';
import { parse } from '../../src/parser/parser';

function statements(source: string): readonly Statement[] {
  return parse(source).body;
}

function expr(source: string): Expression {
  const [first] = statements(source);
  if (first?.kind !== 'ExpressionStatement') throw new Error('expected an expression statement');
  return first.expression;
}

/** Compact S-expression view of an expression, to check tree shape. */
function show(e: Expression): string {
  switch (e.kind) {
    case 'NumberLiteral':
      return String(e.value);
    case 'StringLiteral':
      return JSON.stringify(e.value);
    case 'BooleanLiteral':
      return String(e.value);
    case 'NullLiteral':
      return 'null';
    case 'Identifier':
      return e.name;
    case 'ListLiteral':
      return `[${e.elements.map(show).join(' ')}]`;
    case 'UnaryExpression':
      return `(${e.operator} ${show(e.operand)})`;
    case 'BinaryExpression':
    case 'LogicalExpression':
      return `(${e.operator} ${show(e.left)} ${show(e.right)})`;
    case 'AssignmentExpression':
      return `(= ${show(e.target)} ${show(e.value)})`;
    case 'IndexExpression':
      return `(index ${show(e.object)} ${show(e.index)})`;
    case 'CallExpression':
      return `(call ${show(e.callee)}${e.args.map((a) => ' ' + show(a)).join('')})`;
  }
}

function parseError(source: string) {
  try {
    parse(source);
  } catch (error) {
    if (error instanceof ParserError) return error.diagnostic;
    throw error;
  }
  throw new Error('expected a parser error');
}

describe('operator precedence', () => {
  it.each([
    ['১ + ২ * ৩', '(+ 1 (* 2 3))'],
    ['(১ + ২) * ৩', '(* (+ 1 2) 3)'],
    ['১ - ২ - ৩', '(- (- 1 2) 3)'],
    ['১ / ২ / ৩', '(/ (/ 1 2) 3)'],
    ['১ + ২ % ৩', '(+ 1 (% 2 3))'],
    ['-১ * ২', '(* (- 1) 2)'],
    ['- -১', '(- (- 1))'],
    ['!ক == খ', '(== (! ক) খ)'],
    ['ক < খ == গ > ঘ', '(== (< ক খ) (> গ ঘ))'],
    ['ক + ১ < খ * ২', '(< (+ ক 1) (* খ 2))'],
    ['ক || খ && গ', '(|| ক (&& খ গ))'],
    ['ক বা খ আৰু গ', '(|| ক (&& খ গ))'],
    ['ক == খ && গ != ঘ', '(&& (== ক খ) (!= গ ঘ))'],
    ['ক = খ = ৩', '(= ক (= খ 3))'],
    ['ক = খ + ১', '(= ক (+ খ 1))'],
    ['ক[০] = ৫', '(= (index ক 0) 5)'],
    ['ফ(১)(২)', '(call (call ফ 1) 2)'],
    ['ক[১][২]', '(index (index ক 1) 2)'],
    ['-ক[০]', '(- (index ক 0))'],
    ['ফ(১, ২ + ৩)', '(call ফ 1 (+ 2 3))'],
    ['[১, [২, ৩], "ক"]', '[1 [2 3] "ক"]'],
  ])('%s  ⇒  %s', (source, tree) => {
    expect(show(expr(source))).toBe(tree);
  });
});

describe('statements', () => {
  it('parses variable declarations with and without initialisers', () => {
    const [a, b] = statements('ধৰা ক = ৫\nধৰা খ');
    expect(a?.kind === 'VariableDeclaration' && a.initializer?.kind).toBe('NumberLiteral');
    expect(b?.kind === 'VariableDeclaration' && b.initializer).toBeNull();
  });

  it('parses a function declaration', () => {
    const [f] = statements('ফাংচন যোগ(ক, খ) {\n    ঘূৰাইদিয়া ক + খ\n}');
    expect(f?.kind).toBe('FunctionDeclaration');
    if (f?.kind !== 'FunctionDeclaration') return;
    expect(f.name.name).toBe('যোগ');
    expect(f.params.map((p) => p.name)).toEqual(['ক', 'খ']);
    expect(f.body.body[0]?.kind).toBe('ReturnStatement');
  });

  it('parses a bare return', () => {
    const [f] = statements('ফাংচন ফ() { ঘূৰাইদিয়া }');
    const ret = f?.kind === 'FunctionDeclaration' ? f.body.body[0] : undefined;
    expect(ret?.kind === 'ReturnStatement' && ret.value).toBeNull();
  });

  it('parses else-if chains as nested if statements', () => {
    const [s] = statements("যদি (ক) { } নহ'লে যদি (খ) { } নহ'লে { }");
    expect(s?.kind).toBe('IfStatement');
    if (s?.kind !== 'IfStatement') return;
    expect(s.alternate?.kind).toBe('IfStatement');
    if (s.alternate?.kind !== 'IfStatement') return;
    expect(s.alternate.alternate?.kind).toBe('BlockStatement');
  });

  it("allows নহ'লে on the line after the closing brace", () => {
    const [s] = statements("যদি (ক) {\n}\nনহ'লে {\n}");
    expect(s?.kind === 'IfStatement' && s.alternate?.kind).toBe('BlockStatement');
  });

  it('allows the condition without parentheses', () => {
    const [s] = statements('যেতিয়ালৈকে ক < ৩ { }');
    expect(s?.kind === 'WhileStatement' && show(s.condition)).toBe('(< ক 3)');
  });

  it('parses print with zero, one and many arguments', () => {
    const counts = statements('কোৱা()\nকোৱা(১)\nকোৱা(১, ২, ৩)').map((s) =>
      s.kind === 'PrintStatement' ? s.args.length : -1,
    );
    expect(counts).toEqual([0, 1, 3]);
  });

  it('allows trailing commas and multi-line argument lists', () => {
    const [s] = statements('কোৱা(\n  ১,\n  ২,\n)');
    expect(s?.kind === 'PrintStatement' && s.args.length).toBe(2);
  });
});

describe('newlines and separators', () => {
  it('separates statements with newlines, ; and ।', () => {
    expect(statements('ক\nখ; গ। ঘ')).toHaveLength(4);
  });

  it('continues an expression after a trailing binary operator', () => {
    expect(show(expr('ক +\n  খ'))).toBe('(+ ক খ)');
    expect(show(expr('ক আৰু\n  খ'))).toBe('(&& ক খ)');
  });

  it('does not treat a parenthesis on the next line as a call', () => {
    const body = statements('ক\n(খ)');
    expect(body).toHaveLength(2);
  });

  it('needs no separator after a statement that ends with a block', () => {
    expect(statements('যদি (ক) { } কোৱা(১)')).toHaveLength(2);
  });

  it('rejects two expression statements on one line', () => {
    expect(parseError('ক খ').code).toBe('P007');
  });
});

describe('syntax errors', () => {
  it('P001 — missing closing parenthesis', () => {
    const d = parseError('কোৱা(১ ২)');
    expect(d.code).toBe('P001');
    expect(d.params).toEqual({ expected: ')', found: { kind: 'token', text: '২' } });
  });

  it('P002 — missing expression', () => {
    expect(parseError('ধৰা ক = ').code).toBe('P002');
    expect(parseError('১ + * ২').code).toBe('P002');
  });

  it('P003 — invalid assignment target', () => {
    expect(parseError('১ = ২').code).toBe('P003');
    expect(parseError('ক + খ = ২').code).toBe('P003');
  });

  it('P004 — break outside a loop, including inside a function inside a loop', () => {
    expect(parseError('ৰখা').code).toBe('P004');
    expect(parseError('যেতিয়ালৈকে (সঁচা) { ফাংচন ফ() { ৰখা } }').code).toBe('P004');
  });

  it('P005 — return outside a function', () => {
    expect(parseError('ঘূৰাইদিয়া ১').code).toBe('P005');
  });

  it('P006 — duplicate parameter', () => {
    expect(parseError('ফাংচন ফ(ক, ক) { }').code).toBe('P006');
  });

  it('P008 — missing name', () => {
    expect(parseError('ধৰা = ৫').code).toBe('P008');
    expect(parseError('ফাংচন (ক) { }').code).toBe('P008');
  });

  it('P009 — keyword used as a name', () => {
    const d = parseError('ধৰা যদি = ৫');
    expect(d.code).toBe('P009');
    expect(d.params).toEqual({ keyword: 'যদি' });
  });

  it('P010 — nesting too deep', () => {
    expect(parseError('('.repeat(1000) + '১' + ')'.repeat(1000)).code).toBe('P010');
    expect(parseError('{'.repeat(1000) + '}'.repeat(1000)).code).toBe('P010');
  });

  it('points at the offending token', () => {
    const d = parseError('ধৰা ক = ১\nকোৱা(ক ক)');
    expect(d.span.start).toMatchObject({ line: 2, column: 8 });
  });
});

describe('incomplete input (used by the REPL)', () => {
  it.each(['যদি (ক) {', 'ফাংচন ফ(ক) {\n  ঘূৰাইদিয়া ক', 'কোৱা(১,', '[১, ২', 'ধৰা ক = ১ +'])(
    'marks %j as incomplete',
    (source) => {
      expect(parseError(source).incomplete).toBe(true);
    },
  );

  it('does not mark a genuine mistake as incomplete', () => {
    expect(parseError('কোৱা(১ ২)').incomplete).toBe(false);
  });
});
