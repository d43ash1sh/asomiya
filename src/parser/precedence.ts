import type { TokenType } from '../lexer/token-types';
import type { BinaryOperator, LogicalOperator } from './ast';

/** Binding power, lowest to highest. See docs/GRAMMAR.md. */
export const Precedence = {
  Lowest: 0,
  Assignment: 1,
  Or: 2,
  And: 3,
  Equality: 4,
  Comparison: 5,
  Sum: 6,
  Product: 7,
  Prefix: 8,
  Postfix: 9,
} as const;

export type PrecedenceLevel = (typeof Precedence)[keyof typeof Precedence];

export type InfixRule =
  | {
      readonly kind: 'binary';
      readonly precedence: PrecedenceLevel;
      readonly operator: BinaryOperator;
    }
  | {
      readonly kind: 'logical';
      readonly precedence: PrecedenceLevel;
      readonly operator: LogicalOperator;
    }
  | { readonly kind: 'assign'; readonly precedence: PrecedenceLevel }
  | { readonly kind: 'call'; readonly precedence: PrecedenceLevel }
  | { readonly kind: 'index'; readonly precedence: PrecedenceLevel };

const binary = (precedence: PrecedenceLevel, operator: BinaryOperator): InfixRule => ({
  kind: 'binary',
  precedence,
  operator,
});

export const INFIX_RULES: Partial<Readonly<Record<TokenType, InfixRule>>> = {
  Equal: { kind: 'assign', precedence: Precedence.Assignment },
  OrOr: { kind: 'logical', precedence: Precedence.Or, operator: '||' },
  AndAnd: { kind: 'logical', precedence: Precedence.And, operator: '&&' },
  EqualEqual: binary(Precedence.Equality, '=='),
  BangEqual: binary(Precedence.Equality, '!='),
  Less: binary(Precedence.Comparison, '<'),
  LessEqual: binary(Precedence.Comparison, '<='),
  Greater: binary(Precedence.Comparison, '>'),
  GreaterEqual: binary(Precedence.Comparison, '>='),
  Plus: binary(Precedence.Sum, '+'),
  Minus: binary(Precedence.Sum, '-'),
  Star: binary(Precedence.Product, '*'),
  Slash: binary(Precedence.Product, '/'),
  Percent: binary(Precedence.Product, '%'),
  LeftParen: { kind: 'call', precedence: Precedence.Postfix },
  LeftBracket: { kind: 'index', precedence: Precedence.Postfix },
};
