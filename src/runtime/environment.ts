import { runtimeError, type RuntimeError } from '../errors/runtime-error';
import { suggestRoman } from '../language/roman';
import type { Span } from '../lexer/token';
import type { Value } from './values';

/** A lexical scope: a mapping from (NFC-normalised) names to values, with a parent link. */
export class Environment {
  private readonly bindings = new Map<string, Value>();
  readonly parent: Environment | null;
  /** Bindings of a read-only scope (the built-ins) can be shadowed but not reassigned. */
  private readonly readOnly: boolean;

  constructor(parent: Environment | null = null, readOnly = false) {
    this.parent = parent;
    this.readOnly = readOnly;
  }

  /** Declares `name` in this scope. Re-declaring in the same scope is an error unless allowed. */
  declare(name: string, value: Value, span: Span, allowRedeclare = false): void {
    if (!allowRedeclare && this.bindings.has(name)) {
      throw runtimeError('R002', { name }, span);
    }
    this.bindings.set(name, value);
  }

  lookup(name: string, span: Span): Value {
    const value = this.find(name)?.bindings.get(name);
    if (value === undefined) throw undefinedName(name, span);
    return value;
  }

  /** Assigns to the nearest scope that declares `name`. */
  assign(name: string, value: Value, span: Span): void {
    const owner = this.find(name);
    if (owner === null) throw undefinedName(name, span);
    if (owner.readOnly) throw runtimeError('R020', { name }, span);
    owner.bindings.set(name, value);
  }

  /** The nearest scope (this one or an ancestor) that declares `name`. Depth is lexical nesting. */
  private find(name: string): Environment | null {
    if (this.bindings.has(name)) return this;
    return this.parent === null ? null : this.parent.find(name);
  }
}

function undefinedName(name: string, span: Span): RuntimeError {
  const suggestion = suggestRoman(name);
  return runtimeError('R001', suggestion === undefined ? { name } : { name, suggestion }, span);
}
