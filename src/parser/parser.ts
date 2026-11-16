import type { Found, NameRole } from '../errors/diagnostic';
import { parserError } from '../errors/parser-error';
import { tokenize } from '../lexer/lexer';
import { spanFrom, type Token } from '../lexer/token';
import { PUNCTUATION_TEXT, type PunctuationTokenType, type TokenType } from '../lexer/token-types';
import { isLetter } from '../lexer/unicode';
import type {
  BlockStatement,
  Expression,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  PrintStatement,
  Program,
  Statement,
  UnaryOperator,
  VariableDeclaration,
  WhileStatement,
} from './ast';
import { INFIX_RULES, Precedence, type PrecedenceLevel } from './precedence';

/** Maximum depth of nested expressions/blocks; keeps the recursive parser off the host stack limit. */
export const MAX_NESTING = 256;

/**
 * Recursive-descent parser for statements with a Pratt (precedence-climbing) core for
 * expressions. Produces a fully-typed AST; never executes anything.
 */
export class Parser {
  private readonly tokens: readonly Token[];
  private pos = 0;
  private loopDepth = 0;
  private functionDepth = 0;
  private nesting = 0;

  constructor(tokens: readonly Token[]) {
    if (tokens.length === 0 || tokens[tokens.length - 1]?.type !== 'EOF') {
      throw new Error('Token stream must end with an EOF token');
    }
    this.tokens = tokens;
  }

  parseProgram(): Program {
    const body = this.parseStatementList('EOF');
    const first = this.tokens[0];
    const eof = this.peek();
    return {
      kind: 'Program',
      body,
      span: first === undefined ? eof.span : spanFrom(first.span, eof.span),
    };
  }

  // ── token helpers ───────────────────────────────────────────────────

  private enter(): void {
    if (++this.nesting > MAX_NESTING) {
      throw parserError('P010', { limit: MAX_NESTING }, this.peek().span);
    }
  }

  private leave(): void {
    this.nesting--;
  }

  private peek(ahead = 0): Token {
    const index = Math.min(this.pos + ahead, this.tokens.length - 1);
    const token = this.tokens[index];
    if (token === undefined) throw new Error('unreachable: empty token stream');
    return token;
  }

  private previous(): Token {
    const token = this.tokens[Math.max(0, this.pos - 1)];
    if (token === undefined) throw new Error('unreachable: empty token stream');
    return token;
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private advance(): Token {
    const token = this.peek();
    if (token.type !== 'EOF') this.pos++;
    return token;
  }

  private match(type: TokenType): boolean {
    if (!this.check(type)) return false;
    this.advance();
    return true;
  }

  private expect(type: PunctuationTokenType): Token {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw parserError(
      'P001',
      { expected: PUNCTUATION_TEXT[type], found: describe(token) },
      token.span,
      token.type === 'EOF',
    );
  }

  private skipNewlines(): void {
    while (this.check('Newline')) this.advance();
  }

  private skipSeparators(): void {
    while (this.check('Newline') || this.check('Semicolon')) this.advance();
  }

  private isStatementEnd(token: Token): boolean {
    return (
      token.type === 'Newline' ||
      token.type === 'Semicolon' ||
      token.type === 'RightBrace' ||
      token.type === 'EOF'
    );
  }

  // ── statements ──────────────────────────────────────────────────────

  private parseStatementList(end: 'EOF' | 'RightBrace'): Statement[] {
    const statements: Statement[] = [];
    this.skipSeparators();
    while (!this.check(end) && !this.check('EOF')) {
      statements.push(this.parseStatement());
      const next = this.peek();
      if (next.type === end || next.type === 'EOF') break;
      if (next.type === 'Newline' || next.type === 'Semicolon') {
        this.skipSeparators();
        continue;
      }
      // A statement that ends in a block (`যদি … { }`, `ফাংচন … { }`) needs no separator.
      if (this.previous().type === 'RightBrace') continue;
      throw parserError('P007', { found: describe(next) }, next.span);
    }
    return statements;
  }

  private parseStatement(): Statement {
    this.enter();
    try {
      return this.parseStatementInner();
    } finally {
      this.leave();
    }
  }

  private parseStatementInner(): Statement {
    const token = this.peek();
    switch (token.type) {
      case 'Let':
        return this.parseVariableDeclaration();
      case 'Function':
        return this.parseFunctionDeclaration();
      case 'If':
        return this.parseIf();
      case 'While':
        return this.parseWhile();
      case 'Print':
        return this.parsePrint();
      case 'LeftBrace':
        return this.parseBlock();
      case 'Break': {
        this.advance();
        if (this.loopDepth === 0) throw parserError('P004', {}, token.span);
        return { kind: 'BreakStatement', span: token.span };
      }
      case 'Return': {
        this.advance();
        if (this.functionDepth === 0) throw parserError('P005', {}, token.span);
        if (this.isStatementEnd(this.peek())) {
          return { kind: 'ReturnStatement', value: null, span: token.span };
        }
        const value = this.parseExpression();
        return { kind: 'ReturnStatement', value, span: spanFrom(token.span, value.span) };
      }
      default: {
        const expression = this.parseExpression();
        return { kind: 'ExpressionStatement', expression, span: expression.span };
      }
    }
  }

  private parseName(role: NameRole): Identifier {
    const token = this.peek();
    if (token.type === 'Identifier') {
      this.advance();
      return { kind: 'Identifier', name: token.name, span: token.span };
    }
    const first = token.lexeme.charAt(0);
    if (token.type !== 'EOF' && first !== '' && isLetter(first)) {
      // A letter-spelled token that isn't an identifier must be a keyword.
      throw parserError('P009', { keyword: token.lexeme }, token.span);
    }
    throw parserError('P008', { role, found: describe(token) }, token.span, token.type === 'EOF');
  }

  private parseVariableDeclaration(): VariableDeclaration {
    const keyword = this.advance();
    const name = this.parseName('variable');
    let initializer: Expression | null = null;
    if (this.match('Equal')) {
      this.skipNewlines();
      initializer = this.parseExpression();
    }
    return {
      kind: 'VariableDeclaration',
      name,
      initializer,
      span: spanFrom(keyword.span, (initializer ?? name).span),
    };
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
    const keyword = this.advance();
    const name = this.parseName('function');
    this.expect('LeftParen');
    const params: Identifier[] = [];
    const seen = new Set<string>();
    while (!this.check('RightParen')) {
      const param = this.parseName('parameter');
      if (seen.has(param.name)) {
        throw parserError('P006', { name: param.name }, param.span);
      }
      seen.add(param.name);
      params.push(param);
      if (!this.match('Comma')) break;
    }
    this.expect('RightParen');

    const savedLoopDepth = this.loopDepth;
    this.loopDepth = 0; // `ৰখা` can't break out of a function into an enclosing loop
    this.functionDepth++;
    try {
      const body = this.parseBlock();
      return {
        kind: 'FunctionDeclaration',
        name,
        params,
        body,
        span: spanFrom(keyword.span, body.span),
      };
    } finally {
      this.functionDepth--;
      this.loopDepth = savedLoopDepth;
    }
  }

  private parseIf(): IfStatement {
    const keyword = this.advance();
    const condition = this.parseExpression();
    const consequent = this.parseBlock();
    let alternate: BlockStatement | IfStatement | null = null;

    // `নহ'লে` may be on the line after the closing brace.
    let ahead = 0;
    while (this.peek(ahead).type === 'Newline') ahead++;
    if (this.peek(ahead).type === 'Else') {
      this.pos += ahead + 1;
      alternate = this.check('If') ? this.parseIf() : this.parseBlock();
    }
    return {
      kind: 'IfStatement',
      condition,
      consequent,
      alternate,
      span: spanFrom(keyword.span, (alternate ?? consequent).span),
    };
  }

  private parseWhile(): WhileStatement {
    const keyword = this.advance();
    const condition = this.parseExpression();
    this.loopDepth++;
    try {
      const body = this.parseBlock();
      return { kind: 'WhileStatement', condition, body, span: spanFrom(keyword.span, body.span) };
    } finally {
      this.loopDepth--;
    }
  }

  private parsePrint(): PrintStatement {
    const keyword = this.advance();
    this.expect('LeftParen');
    const args = this.parseExpressionList('RightParen');
    return { kind: 'PrintStatement', args, span: spanFrom(keyword.span, this.previous().span) };
  }

  private parseBlock(): BlockStatement {
    const open = this.expect('LeftBrace');
    const body = this.parseStatementList('RightBrace');
    const close = this.expect('RightBrace');
    return { kind: 'BlockStatement', body, span: spanFrom(open.span, close.span) };
  }

  /** Parses `a, b, c` up to and including `closer`. A trailing comma is allowed. */
  private parseExpressionList(closer: 'RightParen' | 'RightBracket'): Expression[] {
    const items: Expression[] = [];
    while (!this.check(closer)) {
      items.push(this.parseExpression());
      if (!this.match('Comma')) break;
    }
    this.expect(closer);
    return items;
  }

  // ── expressions (Pratt) ─────────────────────────────────────────────

  parseExpression(minPrecedence: PrecedenceLevel = Precedence.Lowest): Expression {
    this.enter();
    try {
      return this.parseExpressionInner(minPrecedence);
    } finally {
      this.leave();
    }
  }

  private parseExpressionInner(minPrecedence: PrecedenceLevel): Expression {
    let left = this.parsePrefix();

    for (;;) {
      const token = this.peek();
      const rule = INFIX_RULES[token.type];
      if (rule === undefined || rule.precedence <= minPrecedence) break;
      this.advance();

      switch (rule.kind) {
        case 'binary': {
          this.skipNewlines();
          const right = this.parseExpression(rule.precedence);
          left = {
            kind: 'BinaryExpression',
            operator: rule.operator,
            left,
            right,
            operatorSpan: token.span,
            span: spanFrom(left.span, right.span),
          };
          break;
        }
        case 'logical': {
          this.skipNewlines();
          const right = this.parseExpression(rule.precedence);
          left = {
            kind: 'LogicalExpression',
            operator: rule.operator,
            operatorText: token.lexeme,
            left,
            right,
            span: spanFrom(left.span, right.span),
          };
          break;
        }
        case 'assign': {
          if (left.kind !== 'Identifier' && left.kind !== 'IndexExpression') {
            throw parserError('P003', {}, left.span);
          }
          this.skipNewlines();
          // Right-associative: parse the value one level lower.
          const value = this.parseExpression(Precedence.Lowest);
          left = {
            kind: 'AssignmentExpression',
            target: left,
            value,
            span: spanFrom(left.span, value.span),
          };
          break;
        }
        case 'call': {
          const args = this.parseExpressionList('RightParen');
          left = {
            kind: 'CallExpression',
            callee: left,
            args,
            span: spanFrom(left.span, this.previous().span),
          };
          break;
        }
        case 'index': {
          const index = this.parseExpression();
          const close = this.expect('RightBracket');
          left = {
            kind: 'IndexExpression',
            object: left,
            index,
            span: spanFrom(left.span, close.span),
          };
          break;
        }
      }
    }
    return left;
  }

  private parsePrefix(): Expression {
    const token = this.peek();
    switch (token.type) {
      case 'Number':
        this.advance();
        return { kind: 'NumberLiteral', value: token.value, span: token.span };
      case 'String':
        this.advance();
        return { kind: 'StringLiteral', value: token.value, span: token.span };
      case 'Identifier':
        this.advance();
        return { kind: 'Identifier', name: token.name, span: token.span };
      case 'True':
      case 'False':
        this.advance();
        return { kind: 'BooleanLiteral', value: token.type === 'True', span: token.span };
      case 'Null':
        this.advance();
        return { kind: 'NullLiteral', span: token.span };
      case 'LeftParen': {
        this.advance();
        const inner = this.parseExpression();
        this.expect('RightParen');
        return inner;
      }
      case 'LeftBracket': {
        this.advance();
        const elements = this.parseExpressionList('RightBracket');
        return { kind: 'ListLiteral', elements, span: spanFrom(token.span, this.previous().span) };
      }
      case 'Minus':
      case 'Bang': {
        this.advance();
        const operand = this.parseExpression(Precedence.Prefix);
        const operator: UnaryOperator = token.type === 'Minus' ? '-' : '!';
        return {
          kind: 'UnaryExpression',
          operator,
          operand,
          span: spanFrom(token.span, operand.span),
        };
      }
      default:
        throw parserError('P002', { found: describe(token) }, token.span, token.type === 'EOF');
    }
  }
}

function describe(token: Token): Found {
  if (token.type === 'EOF') return { kind: 'eof' };
  if (token.type === 'Newline') return { kind: 'newline' };
  return { kind: 'token', text: token.lexeme };
}

export function parse(source: string): Program {
  return new Parser(tokenize(source)).parseProgram();
}
