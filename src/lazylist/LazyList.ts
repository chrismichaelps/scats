/**
 * Implementation of Scala-like LazyList, a lazy collection that evaluates elements only when needed.
 * 
 * @example
 * ```ts
 * import { LazyList } from 'scats/lazylist';
 * 
 * // Creating an infinite stream of numbers
 * const naturals = LazyList.from(0).map(n => n + 1);
 * 
 * // Taking only the first 5 elements
 * const firstFive = naturals.take(5).toArray(); // [1, 2, 3, 4, 5]
 * ```
 */

import { Option, Some, None } from '../Option';

/**
 * A state of LazyList that is either empty or contains a head value and a tail LazyList.
 */
type State<A> = Empty | Cons<A>;

/**
 * Represents an empty LazyList.
 */
class Empty {
  readonly isEmpty = true;
}

/**
 * Represents a non-empty LazyList with a head element and a thunk that evaluates to the tail.
 */
class Cons<A> {
  readonly isEmpty = false;

  constructor(
    readonly head: A,
    readonly tail: () => LazyList<A>
  ) { }
}

/**
 * LazyList is an immutable, lazy evaluated sequence.
 * Elements are evaluated only when needed, making it efficient for representing
 * potentially infinite sequences.
 */
export class LazyList<A> {
  private readonly state: () => State<A>;

  /**
   * Creates a new LazyList with the given state thunk.
   */
  private constructor(state: () => State<A>) {
    this.state = state;
  }

  /**
   * Returns whether this LazyList is empty.
   */
  isEmpty(): boolean {
    return this.state().isEmpty;
  }

  /**
   * Returns the first element of this LazyList, or None if it's empty.
   */
  headOption(): Option<A> {
    const s = this.state();
    return s.isEmpty ? None : Some((s as Cons<A>).head);
  }

  /**
   * Returns the first element of this LazyList.
   * @throws Error if the LazyList is empty
   */
  head(): A {
    const s = this.state();
    if (s.isEmpty) {
      throw new Error("head of empty LazyList");
    }
    return (s as Cons<A>).head;
  }

  /**
   * Returns the tail of this LazyList, or an empty LazyList if it's empty.
   */
  tail(): LazyList<A> {
    const s = this.state();
    return s.isEmpty ? LazyList.empty<A>() : (s as Cons<A>).tail();
  }

  /**
   * Takes the first n elements of this LazyList.
   */
  take(n: number): LazyList<A> {
    if (n <= 0) {
      return LazyList.empty<A>();
    }

    return LazyList.suspend(() => {
      const s = this.state();
      if (s.isEmpty) {
        return new Empty();
      }
      const cons = s as Cons<A>;
      return new Cons(cons.head, () => cons.tail().take(n - 1));
    });
  }

  /**
   * Skips the first n elements of this LazyList.
   */
  drop(n: number): LazyList<A> {
    return LazyList.suspend(() => {
      if (n <= 0) {
        return this.state();
      }
      const s = this.state();
      if (s.isEmpty) {
        return new Empty();
      }
      return (s as Cons<A>).tail().drop(n - 1).state();
    });
  }

  /**
   * Maps each element of this LazyList using the provided function.
   */
  map<B>(f: (a: A) => B): LazyList<B> {
    return LazyList.suspend(() => {
      const s = this.state();
      if (s.isEmpty) {
        return new Empty();
      }
      const cons = s as Cons<A>;
      return new Cons(f(cons.head), () => cons.tail().map(f));
    });
  }

  /**
   * Applies the given function to each element and concatenates the results.
   */
  flatMap<B>(f: (a: A) => LazyList<B>): LazyList<B> {
    return LazyList.suspend(() => {
      const s = this.state();
      if (s.isEmpty) {
        return new Empty();
      }

      const cons = s as Cons<A>;
      return prependAll(f(cons.head), cons.tail().flatMap(f)).state();
    });
  }

  /**
   * Filters elements of this LazyList using the provided predicate.
   */
  filter(p: (a: A) => boolean): LazyList<A> {
    return LazyList.suspend(() => {
      const s = this.state();
      if (s.isEmpty) {
        return new Empty();
      }

      const cons = s as Cons<A>;
      const h = cons.head;
      const t = cons.tail;

      return p(h)
        ? new Cons(h, () => t().filter(p))
        : t().filter(p).state();
    });
  }

  /**
   * Folds this LazyList from left to right using the provided function.
   */
  foldLeft<B>(z: B, f: (b: B, a: A) => B): B {
    let result = z;
    let current: LazyList<A> = this;

    while (!current.isEmpty()) {
      const s = current.state();
      if (!s.isEmpty) {
        const cons = s as Cons<A>;
        result = f(result, cons.head);
        current = cons.tail();
      }
    }

    return result;
  }

  /**
   * Converts this LazyList to an array.
   * This will force the evaluation of all elements.
   */
  toArray(): A[] {
    return this.foldLeft<A[]>([], (acc, a) => {
      acc.push(a);
      return acc;
    });
  }

  /**
   * Returns a LazyList consisting of the results of applying
   * the given function to the elements of this LazyList.
   */
  static map<A, B>(la: LazyList<A>, f: (a: A) => B): LazyList<B> {
    return la.map(f);
  }

  /**
   * Creates a LazyList containing the given elements.
   */
  static of<A>(...elements: A[]): LazyList<A> {
    if (elements.length === 0) {
      return LazyList.empty();
    }

    let result: LazyList<A> = LazyList.empty();
    for (let i = elements.length - 1; i >= 0; i--) {
      result = LazyList.cons(elements[i], () => result);
    }

    return result;
  }

  /**
   * Creates an empty LazyList.
   */
  static empty<A>(): LazyList<A> {
    return new LazyList<A>(() => new Empty());
  }

  /**
   * Creates a LazyList with the given head and tail.
   */
  static cons<A>(head: A, tail: () => LazyList<A>): LazyList<A> {
    return new LazyList<A>(() => new Cons(head, tail));
  }

  /**
   * Suspends a state computation in a thunk.
   */
  static suspend<A>(state: () => State<A>): LazyList<A> {
    return new LazyList<A>(state);
  }

  /**
   * Creates a LazyList from an iterable source.
   */
  static from<A>(iterable: Iterable<A>): LazyList<A> {
    const iterator = iterable[Symbol.iterator]();

    function nextState(): State<A> {
      const next = iterator.next();
      return next.done
        ? new Empty()
        : new Cons(next.value, () => LazyList.suspend(nextState));
    }

    return LazyList.suspend(nextState);
  }

  /**
   * Creates a range of numbers from start (inclusive) to end (exclusive).
   */
  static range(start: number, end?: number, step: number = 1): LazyList<number> {
    if (end === undefined) {
      // Infinite range from start
      let current = start;
      return LazyList.suspend(() =>
        new Cons(current, () => {
          current += step;
          return LazyList.suspend(() => new Cons(current, () => LazyList.range(current + step, undefined, step)))
        })
      );
    } else {
      // Finite range from start to end
      if (start >= end && step > 0) {
        return LazyList.empty();
      }
      if (start <= end && step < 0) {
        return LazyList.empty();
      }

      return LazyList.suspend(() =>
        start === end
          ? new Empty()
          : new Cons(start, () => LazyList.range(start + step, end, step))
      );
    }
  }

  /**
   * Creates an infinite LazyList by repeated application of a function.
   */
  static iterate<A>(seed: A, f: (a: A) => A): LazyList<A> {
    return LazyList.suspend(() =>
      new Cons(seed, () => LazyList.iterate(f(seed), f))
    );
  }

  /**
   * Creates an infinite LazyList that repeatedly applies f.
   */
  static continually<A>(f: () => A): LazyList<A> {
    return LazyList.suspend(() =>
      new Cons(f(), () => LazyList.continually(f))
    );
  }
}

/**
 * Prepends all elements of a LazyList to another LazyList.
 */
function prependAll<A>(prefix: LazyList<A>, list: LazyList<A>): LazyList<A> {
  if (prefix.isEmpty()) {
    return list;
  }

  const head = prefix.head();
  const tail = prefix.tail();
  return LazyList.cons(head, () => prependAll(tail, list));
}

// Default export
export default LazyList; 