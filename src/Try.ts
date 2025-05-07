/**
 * Try<A> represents a computation that may either result in a value of type A
 * or an exception. It's similar to Either<Error, A> but specifically for handling exceptions.
 * 
 * @example
 * ```ts
 * import { Try, Success, Failure, TryAsync } from 'scats';
 * 
 * // Creating instances
 * const a = Try.of(() => JSON.parse('{"valid": "json"}'));
 * const b = Try.of(() => JSON.parse('invalid json'));
 * 
 * // Using Try
 * const result = a
 *   .map(obj => obj.valid)
 *   .flatMap(str => Try.of(() => str.toUpperCase()))
 *   .getOrElse("default");
 * 
 * // Async version
 * const asyncResult = await TryAsync.of(async () => {
 *   const response = await fetch('https://api.example.com');
 *   return response.json();
 * }).map(data => data.value).toPromise();
 * ```
 */

import { Either, Left, Right } from './Either';
import { Option, Some, None } from './Option';

/**
 * Try<A> interface that all Try implementations must satisfy
 */
export interface Try<A> {
  /**
   * Returns true if this is a Success, false otherwise
   */
  readonly isSuccess: boolean;

  /**
   * Returns true if this is a Failure, false otherwise
   */
  readonly isFailure: boolean;

  /**
   * Returns the value if this is a Success, or throws the error if this is a Failure
   * @throws Error if this is a Failure
   */
  get(): A;

  /**
   * Returns the value if this is a Success, or returns the provided default value if this is a Failure
   */
  getOrElse<B>(defaultValue: B): A | B;

  /**
   * Returns the error if this is a Failure, or throws if this is a Success
   * @throws Error if this is a Success
   */
  getError(): Error;

  /**
   * Returns a Try containing the exception if this is a Failure, or a Failure if this is a Success
   */
  failed(): Try<Error>;

  /**
   * Maps the value if this is a Success, otherwise returns this Failure unchanged
   */
  map<B>(f: (a: A) => B): Try<B>;

  /**
   * Returns the result of applying f if this is a Success, otherwise returns this Failure unchanged
   */
  flatMap<B>(f: (a: A) => Try<B>): Try<B>;

  /**
   * Recovers from a failure by returning the result of the provided function
   */
  recover<B>(f: (error: Error) => B): Try<A | B>;

  /**
   * Recovers from a failure by returning the result of the provided function
   */
  recoverWith<B>(f: (error: Error) => Try<B>): Try<A | B>;

  /**
   * Transforms this Try to another Try using the provided functions
   */
  transform<B>(s: (a: A) => Try<B>, f: (error: Error) => Try<B>): Try<B>;

  /**
   * Converts this Try to an Option, discarding the error if this is a Failure
   */
  toOption(): Option<A>;

  /**
   * Converts this Try to an Either with the error as Left and value as Right
   */
  toEither(): Either<Error, A>;

  /**
   * Executes one of the provided functions based on whether this is a Success or a Failure
   */
  fold<B>(onFailure: (error: Error) => B, onSuccess: (value: A) => B): B;

  /**
   * Returns the result of applying the appropriate function
   */
  match<B>(patterns: { Success: (value: A) => B; Failure: (error: Error) => B }): B;
}

/**
 * Success<A> represents a successful computation with a value
 */
export class SuccessImpl<A> implements Try<A> {
  constructor(private readonly value: A) { }

  get isSuccess(): boolean {
    return true;
  }

  get isFailure(): boolean {
    return false;
  }

  get(): A {
    return this.value;
  }

  getOrElse<B>(_defaultValue: B): A {
    return this.value;
  }

  getError(): Error {
    throw new Error("Cannot get error from Success");
  }

  failed(): Try<Error> {
    return new FailureImpl(new Error("Success has no failure"));
  }

  map<B>(f: (a: A) => B): Try<B> {
    try {
      return new SuccessImpl(f(this.value));
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  flatMap<B>(f: (a: A) => Try<B>): Try<B> {
    try {
      return f(this.value);
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  recover<B>(_f: (error: Error) => B): Try<A> {
    return this;
  }

  recoverWith<B>(_f: (error: Error) => Try<B>): Try<A> {
    return this;
  }

  transform<B>(s: (a: A) => Try<B>, _f: (error: Error) => Try<B>): Try<B> {
    try {
      return s(this.value);
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  toOption(): Option<A> {
    return Some(this.value);
  }

  toEither(): Either<Error, A> {
    return Right(this.value);
  }

  fold<B>(_onFailure: (error: Error) => B, onSuccess: (value: A) => B): B {
    return onSuccess(this.value);
  }

  match<B>(patterns: { Success: (value: A) => B; Failure: (error: Error) => B }): B {
    return patterns.Success(this.value);
  }

  toString(): string {
    return `Success(${this.value})`;
  }
}

/**
 * Failure<A> represents a failed computation with an error
 */
export class FailureImpl<A> implements Try<A> {
  constructor(private readonly error: Error) { }

  get isSuccess(): boolean {
    return false;
  }

  get isFailure(): boolean {
    return true;
  }

  get(): A {
    throw this.error;
  }

  getOrElse<B>(defaultValue: B): B {
    return defaultValue;
  }

  getError(): Error {
    return this.error;
  }

  failed(): Try<Error> {
    return new SuccessImpl(this.error);
  }

  map<B>(_f: (a: A) => B): Try<B> {
    return this as unknown as Try<B>;
  }

  flatMap<B>(_f: (a: A) => Try<B>): Try<B> {
    return this as unknown as Try<B>;
  }

  recover<B>(f: (error: Error) => B): Try<B> {
    try {
      return new SuccessImpl(f(this.error));
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  recoverWith<B>(f: (error: Error) => Try<B>): Try<B> {
    try {
      return f(this.error);
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  transform<B>(_s: (a: A) => Try<B>, f: (error: Error) => Try<B>): Try<B> {
    try {
      return f(this.error);
    } catch (e) {
      return new FailureImpl(e instanceof Error ? e : new Error(String(e)));
    }
  }

  toOption(): Option<A> {
    return None;
  }

  toEither(): Either<Error, A> {
    return Left(this.error);
  }

  fold<B>(onFailure: (error: Error) => B, _onSuccess: (value: A) => B): B {
    return onFailure(this.error);
  }

  match<B>(patterns: { Success: (value: A) => B; Failure: (error: Error) => B }): B {
    return patterns.Failure(this.error);
  }

  toString(): string {
    return `Failure(${this.error})`;
  }
}

/**
 * Creates a Success instance
 */
export function Success<A>(value: A): Try<A> {
  return new SuccessImpl(value);
}

/**
 * Creates a Failure instance
 */
export function Failure<A>(error: Error): Try<A> {
  return new FailureImpl(error);
}

/**
 * Try namespace containing utility functions
 */
export namespace Try {
  /**
   * Creates a Try from a function that might throw
   */
  export function of<A>(f: () => A): Try<A> {
    try {
      return Success(f());
    } catch (e) {
      return Failure(e instanceof Error ? e : new Error(String(e)));
    }
  }

  /**
   * Returns a Success containing an array of all values if all tries are Success, otherwise returns the first Failure
   */
  export function sequence<A>(tries: Try<A>[]): Try<A[]> {
    const values: A[] = [];
    for (const t of tries) {
      if (t.isFailure) return t as Try<A[]>;
      values.push(t.get());
    }
    return Success(values);
  }

  /**
   * Maps an array of values using a function that returns a Try, then sequences the result
   */
  export function traverse<A, B>(
    values: A[],
    f: (a: A) => Try<B>
  ): Try<B[]> {
    return sequence(values.map(f));
  }
}

/**
 * TryAsync<A> represents an asynchronous computation that may either result in a value of type A
 * or an exception. It's the asynchronous counterpart to Try<A>.
 */
export interface TryAsync<A> {
  /**
   * Maps the value if this is a Success, otherwise returns this Failure unchanged
   */
  map<B>(f: (a: A) => B | Promise<B>): TryAsync<B>;

  /**
   * Returns the result of applying f if this is a Success, otherwise returns this Failure unchanged
   */
  flatMap<B>(f: (a: A) => TryAsync<B> | Promise<TryAsync<B>>): TryAsync<B>;

  /**
   * Recovers from a failure by returning the result of the provided function
   */
  recover<B>(f: (error: Error) => B | Promise<B>): TryAsync<A | B>;

  /**
   * Recovers from a failure by returning the result of the provided function
   */
  recoverWith<B>(f: (error: Error) => TryAsync<B> | Promise<TryAsync<B>>): TryAsync<A | B>;

  /**
   * Converts this async Try to a Promise
   */
  toPromise(): Promise<A>;
}

class TryAsyncImpl<A> implements TryAsync<A> {
  constructor(private readonly promise: Promise<Try<A>>) { }

  map<B>(f: (a: A) => B | Promise<B>): TryAsync<B> {
    return new TryAsyncImpl<B>(
      this.promise.then(async (result) => {
        if (result.isFailure) return result as unknown as Try<B>;
        try {
          const value = await f(result.get());
          return Success(value);
        } catch (e) {
          return Failure(e instanceof Error ? e : new Error(String(e)));
        }
      })
    );
  }

  flatMap<B>(f: (a: A) => TryAsync<B> | Promise<TryAsync<B>>): TryAsync<B> {
    return new TryAsyncImpl<B>(
      this.promise.then(async (result) => {
        if (result.isFailure) return result as unknown as Try<B>;
        try {
          const tryAsync = await f(result.get());
          return await tryAsync.toPromise().then(Success).catch(e =>
            Failure(e instanceof Error ? e : new Error(String(e)))
          );
        } catch (e) {
          return Failure(e instanceof Error ? e : new Error(String(e)));
        }
      })
    );
  }

  recover<B>(f: (error: Error) => B | Promise<B>): TryAsync<A | B> {
    return new TryAsyncImpl<A | B>(
      this.promise.then(async (result) => {
        if (result.isSuccess) return result as Try<A | B>;
        try {
          const value = await f(result.getError());
          return Success<A | B>(value);
        } catch (e) {
          return Failure<A | B>(e instanceof Error ? e : new Error(String(e)));
        }
      })
    );
  }

  recoverWith<B>(f: (error: Error) => TryAsync<B> | Promise<TryAsync<B>>): TryAsync<A | B> {
    return new TryAsyncImpl<A | B>(
      this.promise.then(async (result) => {
        if (result.isSuccess) return result as Try<A | B>;
        try {
          const tryAsync = await f(result.getError());
          return await tryAsync.toPromise().then(value =>
            Success<A | B>(value)
          ).catch(e =>
            Failure<A | B>(e instanceof Error ? e : new Error(String(e)))
          );
        } catch (e) {
          return Failure<A | B>(e instanceof Error ? e : new Error(String(e)));
        }
      })
    );
  }

  async toPromise(): Promise<A> {
    const result = await this.promise;
    if (result.isSuccess) {
      return result.get();
    } else {
      throw result.getError();
    }
  }
}

/**
 * TryAsync namespace containing utility functions
 */
export namespace TryAsync {
  /**
   * Creates a TryAsync from a function that returns a Promise
   */
  export function of<A>(f: () => Promise<A>): TryAsync<A> {
    return new TryAsyncImpl(
      Promise.resolve().then(async () => {
        try {
          const value = await f();
          return Success(value);
        } catch (e) {
          return Failure(e instanceof Error ? e : new Error(String(e)));
        }
      })
    );
  }

  /**
   * Creates a successful TryAsync
   */
  export function success<A>(value: A): TryAsync<A> {
    return new TryAsyncImpl(Promise.resolve(Success(value)));
  }

  /**
   * Creates a failed TryAsync
   */
  export function failure<A>(error: Error): TryAsync<A> {
    return new TryAsyncImpl(Promise.resolve(Failure(error)));
  }

  /**
   * Converts a Promise to a TryAsync
   */
  export function fromPromise<A>(promise: Promise<A>): TryAsync<A> {
    return of(() => promise);
  }
} 