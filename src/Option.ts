/**
 * Option<A> represents an optional value that may or may not be present.
 * It's a type-safe alternative to using null or undefined.
 * 
 * @example
 * ```ts
 * import { Option, Some, None } from 'scats';
 * 
 * // Creating options
 * const a = Some(42);
 * const b = None;
 * const c = Option.fromNullable(maybeNull);
 * 
 * // Using options
 * const result = a
 *   .map(n => n * 2)
 *   .flatMap(n => n > 50 ? Some(n) : None)
 *   .getOrElse(0);
 * ```
 */

/**
 * Option<A> interface that all option implementations must satisfy
 */
export interface Option<A> {
  /**
   * Returns true if the option is a Some, false otherwise
   */
  readonly isSome: boolean;

  /**
   * Returns true if the option is a None, false otherwise
   */
  readonly isNone: boolean;

  /**
   * Returns the value if this is a Some, otherwise throws an error
   * @throws Error if the option is None
   */
  get(): A;

  /**
   * Returns the value if this is a Some, otherwise returns the provided default value
   */
  getOrElse<B>(defaultValue: B): A | B;

  /**
   * Returns the value if this is a Some, otherwise returns the result of the provided function
   */
  getOrCall<B>(f: () => B): A | B;

  /**
   * Returns the value if this is a Some, otherwise throws the provided error
   */
  getOrThrow(error: Error): A;

  /**
   * Maps the value if this is a Some, otherwise returns None
   */
  map<B>(f: (a: A) => B): Option<B>;

  /**
   * Maps the value if this is a Some, otherwise returns the provided default value wrapped in Some
   */
  mapOr<B>(defaultValue: B, f: (a: A) => B): Option<B>;

  /**
   * Returns the result of applying f if this is a Some, otherwise returns None
   */
  flatMap<B>(f: (a: A) => Option<B>): Option<B>;

  /**
   * Returns the option if it is a Some, otherwise returns the provided option
   */
  orElse<B>(alternative: Option<B>): Option<A | B>;

  /**
   * Returns the option if it is a Some, otherwise returns the result of the provided function
   */
  orCall<B>(f: () => Option<B>): Option<A | B>;

  /**
   * Returns None if the predicate is not satisfied, otherwise returns this option
   */
  filter(predicate: (a: A) => boolean): Option<A>;

  /**
   * Executes the provided function if this is a Some
   */
  forEach(f: (a: A) => void): void;

  /**
   * Converts the option to an array with the value if it's a Some, or an empty array if it's a None
   */
  toArray(): A[];

  /**
   * Converts this option to an Either with the provided left value if this is a None
   */
  toEither<E>(left: E): Either<E, A>;

  /**
   * Returns the result of applying the appropriate function
   */
  match<B>(patterns: { Some: (value: A) => B; None: () => B }): B;
}

/**
 * Some<A> represents an optional value that is present
 */
export class SomeImpl<A> implements Option<A> {
  constructor(private readonly value: A) {
    if (value === null || value === undefined) {
      throw new Error("Cannot create Some with null or undefined value");
    }
  }

  get isSome(): boolean {
    return true;
  }

  get isNone(): boolean {
    return false;
  }

  get(): A {
    return this.value;
  }

  getOrElse<B>(_defaultValue: B): A {
    return this.value;
  }

  getOrCall<B>(_f: () => B): A {
    return this.value;
  }

  getOrThrow(_error: Error): A {
    return this.value;
  }

  map<B>(f: (a: A) => B): Option<B> {
    return Some(f(this.value));
  }

  mapOr<B>(_defaultValue: B, f: (a: A) => B): Option<B> {
    return Some(f(this.value));
  }

  flatMap<B>(f: (a: A) => Option<B>): Option<B> {
    return f(this.value);
  }

  orElse<B>(_alternative: Option<B>): Option<A> {
    return this;
  }

  orCall<B>(_f: () => Option<B>): Option<A> {
    return this;
  }

  filter(predicate: (a: A) => boolean): Option<A> {
    return predicate(this.value) ? this : None;
  }

  forEach(f: (a: A) => void): void {
    f(this.value);
  }

  toArray(): A[] {
    return [this.value];
  }

  toEither<E>(_left: E): Either<E, A> {
    return Right(this.value) as any; // Forward reference to Either module
  }

  match<B>(patterns: { Some: (value: A) => B; None: () => B }): B {
    return patterns.Some(this.value);
  }

  toString(): string {
    return `Some(${this.value})`;
  }
}

/**
 * None represents an optional value that is not present
 */
export class NoneImpl implements Option<never> {
  get isSome(): boolean {
    return false;
  }

  get isNone(): boolean {
    return true;
  }

  get(): never {
    throw new Error("Cannot get value from None");
  }

  getOrElse<B>(defaultValue: B): B {
    return defaultValue;
  }

  getOrCall<B>(f: () => B): B {
    return f();
  }

  getOrThrow(error: Error): never {
    throw error;
  }

  map<B>(_f: (a: never) => B): Option<B> {
    return this as unknown as Option<B>;
  }

  mapOr<B>(defaultValue: B, _f: (a: never) => B): Option<B> {
    return Some(defaultValue);
  }

  flatMap<B>(_f: (a: never) => Option<B>): Option<B> {
    return this as unknown as Option<B>;
  }

  orElse<B>(alternative: Option<B>): Option<B> {
    return alternative;
  }

  orCall<B>(f: () => Option<B>): Option<B> {
    return f();
  }

  filter(_predicate: (a: never) => boolean): Option<never> {
    return this;
  }

  forEach(_f: (a: never) => void): void {
    // Do nothing
  }

  toArray(): never[] {
    return [];
  }

  toEither<E>(left: E): Either<E, never> {
    return Left(left) as any; // Forward reference to Either module
  }

  match<B>(patterns: { Some: (value: never) => B; None: () => B }): B {
    return patterns.None();
  }

  toString(): string {
    return "None";
  }
}

// Singleton instance of None
export const None = new NoneImpl();

// Constructor function for Some
export function Some<A>(value: A): Option<A> {
  if (value === null || value === undefined) {
    return None as Option<A>;
  }
  return new SomeImpl(value);
}

// Option namespace with utility functions
export namespace Option {
  /**
   * Creates an Option from a nullable value
   */
  export function fromNullable<A>(value: A | null | undefined): Option<A> {
    return value === null || value === undefined ? None : Some(value);
  }

  /**
   * Creates an Option from a function that might throw
   */
  export function tryCatch<A>(f: () => A): Option<A> {
    try {
      return Some(f());
    } catch (e) {
      return None;
    }
  }

  /**
   * Returns the first Some in the list, or None if all are None
   */
  export function firstSome<A>(...options: Option<A>[]): Option<A> {
    for (const option of options) {
      if (option.isSome) return option;
    }
    return None;
  }

  /**
   * Returns a Some containing an array of all values if all options are Some, None otherwise
   */
  export function sequence<A>(options: Option<A>[]): Option<A[]> {
    const values: A[] = [];
    for (const option of options) {
      if (option.isNone) return None;
      values.push(option.get());
    }
    return Some(values);
  }

  /**
   * Maps an array of values using a function that returns an Option, then sequences the result
   */
  export function traverse<A, B>(
    values: A[],
    f: (a: A) => Option<B>
  ): Option<B[]> {
    return sequence(values.map(f));
  }
}

// Forward references to Either types - removing unused type parameters
export interface Either<E, A> {
  isLeft: boolean;
  isRight: boolean;
  get(): A;
  getLeft(): E;
  // More definitions in Either.ts
}

export function Left<E>(left: E): Either<E, never> {
  return {
    isLeft: true,
    isRight: false,
    get: () => { throw new Error("Cannot get value from Left"); },
    getLeft: () => left
  } as any; // Simplified for forward reference
}

export function Right<A>(right: A): Either<never, A> {
  return {
    isLeft: false,
    isRight: true,
    get: () => right,
    getLeft: () => { throw new Error("Cannot get left from Right"); }
  } as any; // Simplified for forward reference
} 