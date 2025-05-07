/**
 * For-comprehension implementation inspired by Scala's for expressions.
 * This module provides a way to sequence monadic operations in a readable way,
 * similar to how `async/await` works for Promises, but for any monad.
 * 
 * @example
 * ```ts
 * import { For, Some, None, Option, List } from 'scats';
 * 
 * // Using for-comprehension with Options
 * const result = For.of<Option<number>>()
 *   .bind('a', () => Some(1))
 *   .bind('b', ({ a }) => Some(a + 1))
 *   .bind('c', ({ a, b }) => Some(a + b))
 *   .yield(({ a, b, c }) => a + b + c);  // Some(6)
 * 
 * // Early return if any step returns None
 * const noResult = For.of<Option<number>>()
 *   .bind('a', () => Some(1))
 *   .bind('b', ({ a }) => None)
 *   .bind('c', ({ a, b }) => Some(a + b))
 *   .yield(({ a, b, c }) => a + b + c);  // None
 * 
 * // Using for-comprehension with Lists
 * const cartesianProduct = For.of<List<[number, string]>>()
 *   .bind('a', () => List.of(1, 2, 3))
 *   .bind('b', () => List.of('x', 'y'))
 *   .yield(({ a, b }) => [a, b] as [number, string]);  // List([1, 'x'], [1, 'y'], [2, 'x'], [2, 'y'], [3, 'x'], [3, 'y'])
 * ```
 */

import { Option, Some, None } from './Option';
import { List, empty as emptyList } from './List';
import { Try, Success } from './Try';
import { Either, Right } from './Either';

/**
 * An interface that represents monads with map and flatMap operations
 */
export interface Monad<A> {
  map<B>(f: (a: A) => B): Monad<B>;
  flatMap<B>(f: (a: A) => Monad<B>): Monad<B>;
}

/**
 * Type for the environment object in for-comprehension
 */
export type Env = Record<string, any>;

/**
 * A monadic context that accumulates bindings for for-comprehension
 */
export class ForComprehension<M, T extends Env = {}> {
  constructor(
    private readonly pure: <A>(a: A) => M,
    private readonly flatMap: <A>(ma: M, f: (a: A) => M) => M,
    private readonly value: M = pure({} as T)
  ) { }

  /**
   * Binds a new value to the given name in the environment
   */
  bind<K extends string, A>(name: K, f: (env: T) => M): ForComprehension<M, T & Record<K, A>> {
    return new ForComprehension<M, T & Record<K, A>>(
      this.pure,
      this.flatMap,
      this.flatMap(this.value, (env: T) =>
        this.flatMap(f(env), (a: A) =>
          this.pure({ ...env, [name]: a })
        )
      )
    );
  }

  /**
   * Adds a filter condition to the for-comprehension
   */
  filter(predicate: (env: T) => boolean): ForComprehension<M, T> {
    return new ForComprehension<M, T>(
      this.pure,
      this.flatMap,
      this.flatMap(this.value, (env: T) =>
        predicate(env) ? this.pure(env) : this.empty()
      )
    );
  }

  /**
   * Yields a final result from the for-comprehension
   */
  yield<R>(f: (env: T) => R): M {
    return this.flatMap(this.value, (env: T) => this.pure(f(env)));
  }

  /**
   * Returns an empty value for the given monad
   */
  private empty(): M {
    // This is a simplification. In a full implementation, this would 
    // depend on the monad type. Here we just return a default "zero" element.
    if (this.isOptionMonad()) {
      return None as unknown as M;
    } else if (this.isListMonad()) {
      return emptyList() as unknown as M;
    } else {
      // For other monads, we don't have a way to provide an empty value
      throw new Error("Filter operation not supported for this monad type");
    }
  }

  /**
   * Checks if the monad is an Option
   */
  private isOptionMonad(): boolean {
    return this.pure(42) instanceof Object && (this.pure(42) as any).isSome !== undefined;
  }

  /**
   * Checks if the monad is a List
   */
  private isListMonad(): boolean {
    return this.pure(42) instanceof Object && (this.pure(42) as any).isEmpty !== undefined;
  }
}

/**
 * Factory for creating for-comprehensions for different monads
 */
export namespace For {
  /**
   * Creates a for-comprehension for Option
   */
  export function option<T extends Env = {}>(): ForComprehension<Option<any>, T> {
    return new ForComprehension<Option<any>, T>(
      <A>(a: A) => Some(a),
      <A, B>(ma: Option<A>, f: (a: A) => Option<B>) => ma.flatMap(f)
    );
  }

  /**
   * Creates a for-comprehension for Either
   */
  export function either<E, T extends Env = {}>(): ForComprehension<Either<E, any>, T> {
    return new ForComprehension<Either<E, any>, T>(
      <A>(a: A) => Right<A, E>(a),
      <A, B>(ma: Either<E, A>, f: (a: A) => Either<E, B>) => ma.flatMap(f)
    );
  }

  /**
   * Creates a for-comprehension for List
   */
  export function list<T extends Env = {}>(): ForComprehension<List<any>, T> {
    return new ForComprehension<List<any>, T>(
      <A>(a: A) => List.of(a),
      <A, B>(ma: List<A>, f: (a: A) => List<B>) => ma.flatMap(f)
    );
  }

  /**
   * Creates a for-comprehension for Try
   */
  export function tryM<T extends Env = {}>(): ForComprehension<Try<any>, T> {
    return new ForComprehension<Try<any>, T>(
      <A>(a: A) => Success(a),
      <A, B>(ma: Try<A>, f: (a: A) => Try<B>) => ma.flatMap(f)
    );
  }

  /**
   * Creates a generic for-comprehension for any monad
   */
  export function of<M, T extends Env = {}>(): ForComprehensionBuilder<M, T> {
    return new ForComprehensionBuilder<M, T>();
  }
}

/**
 * Builder for creating for-comprehensions
 */
export class ForComprehensionBuilder<M, T extends Env = {}> {
  /**
   * Creates a for-comprehension for Option
   */
  option(): ForComprehension<Option<any>, T> {
    return For.option<T>();
  }

  /**
   * Creates a for-comprehension for Either
   */
  either<E>(): ForComprehension<Either<E, any>, T> {
    return For.either<E, T>();
  }

  /**
   * Creates a for-comprehension for List
   */
  list(): ForComprehension<List<any>, T> {
    return For.list<T>();
  }

  /**
   * Creates a for-comprehension for Try
   */
  tryM(): ForComprehension<Try<any>, T> {
    return For.tryM<T>();
  }

  /**
   * Creates a for-comprehension for a custom monad
   */
  custom(
    pure: <X>(b: X) => M,
    flatMap: <X>(mb: M, f: (b: X) => M) => M
  ): ForComprehension<M, T> {
    return new ForComprehension<M, T>(pure, flatMap);
  }
} 