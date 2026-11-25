import type { Span } from '../lexer/token';

interface Node {
  readonly span: Span;
}

// ── expressions ─────────────────────────────────────────────────────────

export interface NumberLiteral extends Node {
  readonly kind: 'NumberLiteral';
  readonly value: number;
}

export interface StringLiteral extends Node {
  readonly kind: 'StringLiteral';
  readonly value: string;
}

export interface BooleanLiteral extends Node {
  readonly kind: 'BooleanLiteral';
  readonly value: boolean;
}

export interface NullLiteral extends Node {
  readonly kind: 'NullLiteral';
}

export interface ListLiteral extends Node {
  readonly kind: 'ListLiteral';
  readonly elements: readonly Expression[];
}

export interface Identifier extends Node {
  readonly kind: 'Identifier';
  /** Normalised (NFC) name. */
  readonly name: string;
}

export type UnaryOperator = '-' | '!';

export interface UnaryExpression extends Node {
  readonly kind: 'UnaryExpression';
  readonly operator: UnaryOperator;
  readonly operand: Expression;
}

export type BinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=';

export interface BinaryExpression extends Node {
  readonly kind: 'BinaryExpression';
  readonly operator: BinaryOperator;
  readonly left: Expression;
  readonly right: Expression;
  /** Span of the operator token, for error messages. */
  readonly operatorSpan: Span;
}

export type LogicalOperator = '&&' | '||';

export interface LogicalExpression extends Node {
  readonly kind: 'LogicalExpression';
  readonly operator: LogicalOperator;
  /** How the operator was written: `&&`, `আৰু`, … */
  readonly operatorText: string;
  readonly left: Expression;
  readonly right: Expression;
}

export interface IndexExpression extends Node {
  readonly kind: 'IndexExpression';
  readonly object: Expression;
  readonly index: Expression;
}

export interface AssignmentExpression extends Node {
  readonly kind: 'AssignmentExpression';
  readonly target: Identifier | IndexExpression;
  readonly value: Expression;
}

export interface CallExpression extends Node {
  readonly kind: 'CallExpression';
  readonly callee: Expression;
  readonly args: readonly Expression[];
}

export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral
  | ListLiteral
  | Identifier
  | UnaryExpression
  | BinaryExpression
  | LogicalExpression
  | IndexExpression
  | AssignmentExpression
  | CallExpression;

// ── statements ──────────────────────────────────────────────────────────

export interface VariableDeclaration extends Node {
  readonly kind: 'VariableDeclaration';
  readonly name: Identifier;
  readonly initializer: Expression | null;
}

export interface FunctionDeclaration extends Node {
  readonly kind: 'FunctionDeclaration';
  readonly name: Identifier;
  readonly params: readonly Identifier[];
  readonly body: BlockStatement;
}

export interface IfStatement extends Node {
  readonly kind: 'IfStatement';
  readonly condition: Expression;
  readonly consequent: BlockStatement;
  readonly alternate: BlockStatement | IfStatement | null;
}

export interface WhileStatement extends Node {
  readonly kind: 'WhileStatement';
  readonly condition: Expression;
  readonly body: BlockStatement;
}

/** `প্ৰতিটো নাম তালিকা মাজত { … }`: runs the body once for each element (or letter, for text). */
export interface ForEachStatement extends Node {
  readonly kind: 'ForEachStatement';
  readonly variable: Identifier;
  readonly iterable: Expression;
  readonly body: BlockStatement;
}

export interface BreakStatement extends Node {
  readonly kind: 'BreakStatement';
}

export interface ContinueStatement extends Node {
  readonly kind: 'ContinueStatement';
}

export interface ReturnStatement extends Node {
  readonly kind: 'ReturnStatement';
  readonly value: Expression | null;
}

export interface PrintStatement extends Node {
  readonly kind: 'PrintStatement';
  readonly args: readonly Expression[];
}

export interface BlockStatement extends Node {
  readonly kind: 'BlockStatement';
  readonly body: readonly Statement[];
}

export interface ExpressionStatement extends Node {
  readonly kind: 'ExpressionStatement';
  readonly expression: Expression;
}

export type Statement =
  | VariableDeclaration
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForEachStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement
  | PrintStatement
  | BlockStatement
  | ExpressionStatement;

export interface Program extends Node {
  readonly kind: 'Program';
  readonly body: readonly Statement[];
  /** True if any keyword is written in Latin letters (dhora, kowa …). */
  readonly roman: boolean;
}
