/**
 * Either<E, A> represents a value of one of two possible types: Left (E) or Right (A).
 * Left is conventionally used for errors, while Right is used for success.
 * 
 * @example
 * ```ts
 * import { Either, Left, Right } from 'scats';
 * 
 * // Creating eithers
 * const success = Right(42);
 * const failure = Left(new Error("Something went wrong"));
 * 
 * // Using eithers
 * const result = success
 *   .map(n => n * 2)
 *   .flatMap(n => n > 50 ? Right(n) : Left("Value too small"))
 *   .getOrElse(0);
 * ```
 */

import { Option, Some, None } from './Option';

/**
 * Either<E, A> interface that all Either implementations must satisfy
 */
export interface Either<E, A> {
  /**
   * Returns true if this is a Left, false otherwise
   */
  readonly isLeft: boolean;

  /**
   * Returns true if this is a Right, false otherwise
   */
  readonly isRight: boolean;

  /**
   * Returns the value from this Right, or throws an error if this is a Left
   * @throws Error if this is a Left
   */
  get(): A;

  /**
   * Returns the left value if this is a Left, or throws an error if this is a Right
   * @throws Error if this is a Right
   */
  getLeft(): E;

  /**
   * Returns the value from this Right, or returns the provided default value if this is a Left
   */
  getOrElse<B>(defaultValue: B): A | B;

  /**
   * Returns the value from this Right, or returns the result of the provided function if this is a Left
   */
  getOrCall<B>(f: (e: E) => B): A | B;

  /**
   * Returns the value from this Right, or throws the provided error if this is a Left
   */
  getOrThrow(error: Error): A;

  /**
   * Maps the Right value if this is a Right, otherwise returns this Left unchanged
   */
  map<B>(f: (a: A) => B): Either<E, B>;

  /**
   * Maps the Left value if this is a Left, otherwise returns this Right unchanged
   */
  mapLeft<F>(f: (e: E) => F): Either<F, A>;

  /**
   * Returns the result of applying f if this is a Right, otherwise returns this Left unchanged
   */
  flatMap<B>(f: (a: A) => Either<E, B>): Either<E, B>;

  /**
   * Returns this Right if this is a Right, otherwise returns the provided alternative
   */
  orElse<F, B>(alternative: Either<F, B>): Either<E | F, A | B>;

  /**
   * Returns this Right if this is a Right, otherwise returns the result of the provided function
   */
  orCall<F, B>(f: (e: E) => Either<F, B>): Either<E | F, A | B>;

  /**
   * Executes one of the provided functions based on whether this is a Left or a Right
   */
  fold<B>(onLeft: (e: E) => B, onRight: (a: A) => B): B;

  /**
   * Executes the provided function if this is a Right
   */
  forEach(f: (a: A) => void): void;

  /**
   * Executes the provided function if this is a Left
   */
  forEachLeft(f: (e: E) => void): void;

  /**
   * Converts this Either to an Option, discarding the Left value if this is a Left
   */
  toOption(): Option<A>;

  /**
   * Swaps the Left and Right values of this Either
   */
  swap(): Either<A, E>;

  /**
   * Returns the result of applying the appropriate function
   */
  match<B>(patterns: { Left: (value: E) => B; Right: (value: A) => B }): B;
}

/**
 * Left<E, A> represents the Left case of an Either
 */
export class LeftImpl<E, A = never> implements Either<E, A> {
  constructor(private readonly value: E) {
    if (value === null || value === undefined) {
      throw new Error("Cannot create Left with null or undefined value");
    }
  }

  get isLeft(): boolean {
    return true;
  }

  get isRight(): boolean {
    return false;
  }

  get(): A {
    throw new Error("Cannot get Right value from Left");
  }

  getLeft(): E {
    return this.value;
  }

  getOrElse<B>(defaultValue: B): B {
    return defaultValue;
  }

  getOrCall<B>(f: (e: E) => B): B {
    return f(this.value);
  }

  getOrThrow(error: Error): A {
    throw error;
  }

  map<B>(_f: (a: A) => B): Either<E, B> {
    return this as unknown as Either<E, B>;
  }

  mapLeft<F>(f: (e: E) => F): Either<F, A> {
    return Left(f(this.value));
  }

  flatMap<B>(_f: (a: A) => Either<E, B>): Either<E, B> {
    return this as unknown as Either<E, B>;
  }

  orElse<F, B>(alternative: Either<F, B>): Either<F, B> {
    return alternative;
  }

  orCall<F, B>(f: (e: E) => Either<F, B>): Either<F, B> {
    return f(this.value);
  }

  fold<B>(onLeft: (e: E) => B, _onRight: (a: A) => B): B {
    return onLeft(this.value);
  }

  forEach(_f: (a: A) => void): void {
    // Do nothing
  }

  forEachLeft(f: (e: E) => void): void {
    f(this.value);
  }

  toOption(): Option<A> {
    return None;
  }

  swap(): Either<A, E> {
    return Right(this.value) as Either<A, E>;
  }

  match<B>(patterns: { Left: (value: E) => B; Right: (value: A) => B }): B {
    return patterns.Left(this.value);
  }

  toString(): string {
    return `Left(${this.value})`;
  }
}

/**
 * Right<E, A> represents the Right case of an Either
 */
export class RightImpl<E, A> implements Either<E, A> {
  constructor(private readonly value: A) {
    if (value === null || value === undefined) {
      throw new Error("Cannot create Right with null or undefined value");
    }
  }

  get isLeft(): boolean {
    return false;
  }

  get isRight(): boolean {
    return true;
  }

  get(): A {
    return this.value;
  }

  getLeft(): E {
    throw new Error("Cannot get Left value from Right");
  }

  getOrElse<B>(_defaultValue: B): A {
    return this.value;
  }

  getOrCall<B>(_f: (e: E) => B): A {
    return this.value;
  }

  getOrThrow(_error: Error): A {
    return this.value;
  }

  map<B>(f: (a: A) => B): Either<E, B> {
    return Right(f(this.value));
  }

  mapLeft<F>(_f: (e: E) => F): Either<F, A> {
    return this as unknown as Either<F, A>;
  }

  flatMap<B>(f: (a: A) => Either<E, B>): Either<E, B> {
    return f(this.value);
  }

  orElse<F, B>(_alternative: Either<F, B>): Either<E | F, A | B> {
    return this as unknown as Either<E | F, A | B>;
  }

  orCall<F, B>(_f: (e: E) => Either<F, B>): Either<E | F, A | B> {
    return this as unknown as Either<E | F, A | B>;
  }

  fold<B>(_onLeft: (e: E) => B, onRight: (a: A) => B): B {
    return onRight(this.value);
  }

  forEach(f: (a: A) => void): void {
    f(this.value);
  }

  forEachLeft(_f: (e: E) => void): void {
    // Do nothing
  }

  toOption(): Option<A> {
    return Some(this.value);
  }

  swap(): Either<A, E> {
    return Left(this.value) as unknown as Either<A, E>;
  }

  match<B>(patterns: { Left: (value: E) => B; Right: (value: A) => B }): B {
    return patterns.Right(this.value);
  }

  toString(): string {
    return `Right(${this.value})`;
  }
}

/**
 * Creates a Left instance
 */
export function Left<E, A = never>(left: E): Either<E, A> {
  if (left === null || left === undefined) {
    throw new Error("Cannot create Left with null or undefined value");
  }
  return new LeftImpl(left);
}

/**
 * Creates a Right instance
 */
export function Right<A, E = never>(right: A): Either<E, A> {
  if (right === null || right === undefined) {
    throw new Error("Cannot create Right with null or undefined value");
  }
  return new RightImpl<E, A>(right);
}

/**
 * Either namespace containing utility functions
 */
export namespace Either {
  /**
   * Creates an Either from a function that might throw, capturing the error in the Left
   */
  export function tryCatch<A>(f: () => A): Either<unknown, A> {
    try {
      return Right(f());
    } catch (e) {
      return Left(e);
    }
  }

  /**
   * Returns a Right containing an array of all values if all inputs are Right, otherwise returns the first Left
   */
  export function sequence<E, A>(eithers: Either<E, A>[]): Either<E, A[]> {
    const values: A[] = [];
    for (const either of eithers) {
      if (either.isLeft) return either as Either<E, A[]>;
      values.push(either.get());
    }
    return Right(values);
  }

  /**
   * Maps an array of values using a function that returns an Either, then sequences the result
   */
  export function traverse<E, A, B>(
    values: A[],
    f: (a: A) => Either<E, B>
  ): Either<E, B[]> {
    return sequence(values.map(f));
  }
} 