/**
 * Pattern matching implementation inspired by Scala's match expressions.
 * This module provides a way to match values against patterns and extract parts of them.
 * 
 * @example
 * ```ts
 * import { match, when, otherwise } from 'scats';
 * 
 * // Simple value matching
 * const result = match(value)
 *   .with(1, () => "one")
 *   .with(2, () => "two")
 *   .with(3, () => "three")
 *   .otherwise(() => "other");
 * 
 * // Type matching with Option
 * const optRes = match(opt)
 *   .when(Some, (some) => `Value: ${some.get()}`)
 *   .when(None, () => "No value")
 *   .run();
 * 
 * // Pattern matching with extractors
 * const person = { name: "John", age: 30 };
 * const greeting = match(person)
 *   .with({ name: "John", age: when((a) => a > 18) }, () => "Hello Mr. John")
 *   .with({ name: "John" }, () => "Hello John")
 *   .otherwise(() => "Hello stranger");
 * ```
 */

// Type Utilities
type Constructor<T> = new (...args: any[]) => T;
type TypePredicate<T> = (value: any) => value is T;
type PredicateFunction<T> = (value: T) => boolean;
type ExtractorFunction<T, R> = (value: T) => R;

/**
 * Represents a pattern that can be matched against a value
 */
export interface Pattern<T, R = T> {
  match(value: any): { matched: boolean; extracted?: R };
}

/**
 * Pattern that checks if a value equals the provided value
 */
class ValuePattern<T> implements Pattern<T> {
  constructor(private readonly expected: T) { }

  match(value: any): { matched: boolean; extracted?: T } {
    return { matched: value === this.expected, extracted: value };
  }
}

/**
 * Pattern that checks if a value is an instance of the provided class
 */
class TypePattern<T> implements Pattern<T> {
  constructor(
    private readonly typeCheck: Constructor<T> | TypePredicate<T>
  ) { }

  match(value: any): { matched: boolean; extracted?: T } {
    if (typeof this.typeCheck === 'function' && !isClass(this.typeCheck)) {
      return { matched: (this.typeCheck as TypePredicate<T>)(value), extracted: value };
    }
    return { matched: value instanceof this.typeCheck, extracted: value };
  }
}

/**
 * Pattern that checks if a value satisfies the provided predicate
 */
class PredicatePattern<T> implements Pattern<T> {
  constructor(private readonly predicate: PredicateFunction<T>) { }

  match(value: any): { matched: boolean; extracted?: T } {
    return { matched: this.predicate(value), extracted: value };
  }
}

/**
 * Pattern that extracts a value using the provided extractor function
 */
class ExtractorPattern<T, R> implements Pattern<T, R> {
  constructor(private readonly extractor: ExtractorFunction<T, R>) { }

  match(value: any): { matched: boolean; extracted?: R } {
    try {
      const extracted = this.extractor(value);
      return { matched: true, extracted };
    } catch (e) {
      return { matched: false };
    }
  }
}

/**
 * Pattern that matches an object with specific properties
 */
class ObjectPattern<T extends object> implements Pattern<T> {
  constructor(private readonly pattern: Partial<{ [K in keyof T]: Pattern<T[K]> | T[K] }>) { }

  match(value: any): { matched: boolean; extracted?: T } {
    if (value == null || typeof value !== 'object') {
      return { matched: false };
    }

    for (const key in this.pattern) {
      const patternValue = this.pattern[key];

      if (!(key in value)) {
        return { matched: false };
      }

      if (isPattern(patternValue)) {
        const result = (patternValue as Pattern<T[typeof key]>).match(value[key]);
        if (!result.matched) {
          return { matched: false };
        }
      } else if (patternValue !== value[key]) {
        return { matched: false };
      }
    }

    return { matched: true, extracted: value };
  }
}

/**
 * Pattern that matches an array with specific elements
 */
class ArrayPattern<T> implements Pattern<T[]> {
  constructor(private readonly patterns: (Pattern<T> | T)[]) { }

  match(value: any): { matched: boolean; extracted?: T[] } {
    if (!Array.isArray(value) || value.length !== this.patterns.length) {
      return { matched: false };
    }

    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      if (isPattern(pattern)) {
        const result = (pattern as Pattern<T>).match(value[i]);
        if (!result.matched) {
          return { matched: false };
        }
      } else if (pattern !== value[i]) {
        return { matched: false };
      }
    }

    return { matched: true, extracted: value };
  }
}

/**
 * Pattern that matches if any of the provided patterns match
 */
class OrPattern<T> implements Pattern<T> {
  constructor(private readonly patterns: Pattern<T>[]) { }

  match(value: any): { matched: boolean; extracted?: T } {
    for (const pattern of this.patterns) {
      const result = pattern.match(value);
      if (result.matched) {
        return result;
      }
    }
    return { matched: false };
  }
}

/**
 * Pattern that matches if all of the provided patterns match
 */
class AndPattern<T> implements Pattern<T> {
  constructor(private readonly patterns: Pattern<T>[]) { }

  match(value: any): { matched: boolean; extracted?: T } {
    for (const pattern of this.patterns) {
      const result = pattern.match(value);
      if (!result.matched) {
        return { matched: false };
      }
    }
    return { matched: true, extracted: value };
  }
}

/**
 * Pattern that always matches
 */
class WildcardPattern<T> implements Pattern<T> {
  match(value: any): { matched: boolean; extracted?: T } {
    return { matched: true, extracted: value };
  }
}

/**
 * Pattern that negates another pattern
 */
class NotPattern<T> implements Pattern<T> {
  constructor(private readonly pattern: Pattern<T>) { }

  match(value: any): { matched: boolean; extracted?: T } {
    const result = this.pattern.match(value);
    return { matched: !result.matched, extracted: result.matched ? undefined : value };
  }
}

/**
 * Represents a match expression
 */
class MatchExpression<T, R> {
  private cases: { pattern: Pattern<T>; handler: (value: any) => R }[] = [];
  private otherwiseHandler: ((value: T) => R) | null = null;

  constructor(private readonly value: T) { }

  /**
   * Adds a case with the provided pattern and handler
   */
  with<P>(pattern: P | Pattern<T>, handler: (value: P extends Pattern<T, infer X> ? X : T) => R): MatchExpression<T, R> {
    this.cases.push({
      pattern: isPattern(pattern) ? pattern as Pattern<T> : pattern as any,
      handler: handler as any,
    });
    return this;
  }

  /**
   * Adds a case that matches if the value is of the provided type
   */
  when<P>(typeCheck: Constructor<P> | TypePredicate<P>, handler: (value: P) => R): MatchExpression<T, R> {
    this.cases.push({
      pattern: new TypePattern(typeCheck) as unknown as Pattern<T>,
      handler: handler as any,
    });
    return this;
  }

  /**
   * Adds a default case that matches if no other case matches
   */
  otherwise(handler: (value: T) => R): MatchExpression<T, R> {
    this.otherwiseHandler = handler;
    return this;
  }

  /**
   * Runs the match expression and returns the result
   */
  run(): R {
    for (const { pattern, handler } of this.cases) {
      const result = isPattern(pattern)
        ? pattern.match(this.value)
        : new ValuePattern(pattern).match(this.value);

      if (result.matched) {
        return handler(result.extracted);
      }
    }

    if (this.otherwiseHandler) {
      return this.otherwiseHandler(this.value);
    }

    throw new Error("Match error: No case matched and no otherwise clause provided");
  }
}

// Utility functions to check if a value is a pattern or a class
function isPattern(value: any): value is Pattern<any> {
  return value != null && typeof value === 'object' && 'match' in value && typeof value.match === 'function';
}

function isClass(func: any): boolean {
  return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}

/**
 * Creates a match expression for the provided value
 */
export function match<T, R = any>(value: T): MatchExpression<T, R> {
  return new MatchExpression<T, R>(value);
}

/**
 * Creates a pattern that matches if the value satisfies the provided predicate
 */
export function when<T>(predicate: PredicateFunction<T>): Pattern<T> {
  return new PredicatePattern(predicate);
}

/**
 * Creates a pattern that always matches
 */
export function otherwise<T>(): Pattern<T> {
  return new WildcardPattern<T>();
}

/**
 * Creates a pattern that extracts a value using the provided extractor function
 */
export function extract<T, R>(extractor: ExtractorFunction<T, R>): Pattern<T, R> {
  return new ExtractorPattern(extractor);
}

/**
 * Creates a pattern that matches if the value equals the provided value
 */
export function value<T>(expected: T): Pattern<T> {
  return new ValuePattern(expected);
}

/**
 * Creates a pattern that matches an object with the provided properties
 */
export function object<T extends object>(pattern: Partial<{ [K in keyof T]: Pattern<T[K]> | T[K] }>): Pattern<T> {
  return new ObjectPattern(pattern);
}

/**
 * Creates a pattern that matches an array with the provided elements
 */
export function array<T>(patterns: (Pattern<T> | T)[]): Pattern<T[]> {
  return new ArrayPattern(patterns);
}

/**
 * Creates a pattern that matches if any of the provided patterns match
 */
export function or<T>(...patterns: Pattern<T>[]): Pattern<T> {
  return new OrPattern(patterns);
}

/**
 * Creates a pattern that matches if all of the provided patterns match
 */
export function and<T>(...patterns: Pattern<T>[]): Pattern<T> {
  return new AndPattern(patterns);
}

/**
 * Creates a pattern that matches if the provided pattern does not match
 */
export function not<T>(pattern: Pattern<T>): Pattern<T> {
  return new NotPattern(pattern);
}

/**
 * Creates a pattern that matches if the value is of the provided type
 */
export function type<T>(typeCheck: Constructor<T> | TypePredicate<T>): Pattern<T> {
  return new TypePattern(typeCheck);
} 