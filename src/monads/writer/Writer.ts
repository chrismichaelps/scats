/**
 * The Writer monad represents a computation that produces a value along with a log.
 * It's useful for collecting log messages, building up computations with a log of changes, etc.
 * 
 * Example:
 * ```
 * // Create a writer that logs some text and returns a value
 * const logNumber = (n: number) => 
 *   Writer.tell<string, number>(`Processing ${n}`).flatMap(() => Writer.of(n * 2), Monoids.string);
 * 
 * // Run computations that accumulate logs
 * const result = logNumber(5)
 *   .flatMap(n => Writer.tell(`Result is ${n}`).flatMap(() => Writer.of(n), Monoids.string), Monoids.string);
 * 
 * // Extract result and logs
 * const [value, logs] = result.run();
 * // value: 10, logs: "Processing 5Result is 10"
 * ```
 */

/**
 * Represents a semigroup that can be combined with another value of the same type.
 */
export interface Semigroup<T> {
  concat(a: T, b: T): T;
}

/**
 * Represents a monoid, which is a semigroup with an identity element.
 */
export interface Monoid<T> extends Semigroup<T> {
  empty(): T;
}

/**
 * A Writer monad implementation that produces a value along with a log.
 */
export class WriterMonad<W, A> {
  constructor(private readonly value: A, private readonly log: W) { }

  /**
   * Runs this writer computation and returns the result value and log.
   */
  run(): [A, W] {
    return [this.value, this.log];
  }

  /**
   * Returns the value from this writer computation.
   */
  getValue(): A {
    return this.value;
  }

  /**
   * Returns the log from this writer computation.
   */
  getLog(): W {
    return this.log;
  }

  /**
   * Maps the result of this writer computation using the given function.
   */
  map<B>(f: (a: A) => B): WriterMonad<W, B> {
    return new WriterMonad<W, B>(f(this.value), this.log);
  }

  /**
   * Chains this writer computation with another one.
   * The logs are combined using the provided monoid.
   */
  flatMap<B>(f: (a: A) => WriterMonad<W, B>, monoid: Monoid<W>): WriterMonad<W, B> {
    const [b, w2] = f(this.value).run();
    return new WriterMonad<W, B>(b, monoid.concat(this.log, w2));
  }

  /**
   * Applies a function inside a writer to a value inside this writer.
   * The logs are combined using the provided monoid.
   */
  ap<B>(wf: WriterMonad<W, (a: A) => B>, monoid: Monoid<W>): WriterMonad<W, B> {
    const [f, w2] = wf.run();
    return new WriterMonad<W, B>(f(this.value), monoid.concat(this.log, w2));
  }

  /**
   * Maps both the value and the log using provided functions.
   */
  bimap<B, X>(f: (a: A) => B, g: (w: W) => X): WriterMonad<X, B> {
    return new WriterMonad<X, B>(f(this.value), g(this.log));
  }

  /**
   * Maps the log using a provided function.
   */
  mapLog<X>(f: (w: W) => X): WriterMonad<X, A> {
    return new WriterMonad<X, A>(this.value, f(this.log));
  }
}

/**
 * Commonly used monoids
 */
export const Monoids = {
  /**
   * A monoid for strings, where concat is string concatenation.
   */
  string: {
    empty: () => '',
    concat: (a: string, b: string) => a + b
  },

  /**
   * A monoid for arrays, where concat is array concatenation.
   */
  array<T>(): Monoid<T[]> {
    return {
      empty: () => [],
      concat: (a: T[], b: T[]) => [...a, ...b]
    };
  }
};

/**
 * Writer monad utilities and constructors
 */
export const Writer = {
  /**
   * Creates a new Writer that returns the given value with an empty log.
   */
  of<W, A>(value: A, monoid: Monoid<W>): WriterMonad<W, A> {
    return new WriterMonad<W, A>(value, monoid.empty());
  },

  /**
   * Creates a new Writer that adds the given log message with a default value.
   */
  tell<W, A = void>(log: W): WriterMonad<W, void> {
    return new WriterMonad<W, void>(undefined, log);
  },

  /**
   * Creates a new Writer that returns the value of the given writer without its log.
   */
  listen<W, A>(w: WriterMonad<W, A>): WriterMonad<W, [A, W]> {
    const [a, log] = w.run();
    return new WriterMonad<W, [A, W]>([a, log], log);
  },

  /**
   * Creates a new Writer that passes both the value and log to a function to produce a new writer.
   */
  pass<W, A>(w: WriterMonad<W, [A, (w: W) => W]>): WriterMonad<W, A> {
    const [[a, f], log] = w.run();
    return new WriterMonad<W, A>(a, f(log));
  },

  /**
   * Helper function to create a Writer with a string log.
   */
  withString<A>(value: A, log: string = ''): WriterMonad<string, A> {
    return new WriterMonad<string, A>(value, log);
  },

  /**
   * Helper function to create a Writer with an array log.
   */
  withArray<W, A>(value: A, log: W[] = []): WriterMonad<W[], A> {
    return new WriterMonad<W[], A>(value, log);
  }
};

/**
 * Type alias for convenience
 */
export type Writer<W, A> = WriterMonad<W, A>;

export default Writer; 