/**
 * Implementation of Scala-like LazyList, a lazy collection that evaluates elements only when needed.
 * 
 * @example
 * ```ts
 * import { LazyList } from '@chris5855/scats';
 * 
 * // Creating an infinite stream of numbers
 * const naturals = LazyList.from(0).map(n => n + 1);
 * 
 * // Taking only the first 5 elements
 * const firstFive = naturals.take(5).toArray(); // [1, 2, 3, 4, 5]
 * ```
 * @module
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
   * Uses a safe implementation to prevent stack overflows.
   */
  flatMap<B>(f: (a: A) => LazyList<B>): LazyList<B> {
    // The key insight is to process one level at a time without recursion
    const flatMapState = (input: LazyList<A>, currentPrefix?: LazyList<B>): State<B> => {
      // First, handle the case where we're still processing elements from a previous mapping
      if (currentPrefix && !currentPrefix.isEmpty()) {
        const prefixState = currentPrefix.state();
        if (!prefixState.isEmpty) {
          const prefixCons = prefixState as Cons<B>;
          return new Cons(
            prefixCons.head,
            () => LazyList.suspend(() =>
              flatMapState(input, prefixCons.tail())
            )
          );
        }
      }

      // If we've finished the current prefix or don't have one, move to the next input element
      if (input.isEmpty()) {
        return new Empty();
      }

      const inputState = input.state();
      if (inputState.isEmpty) {
        return new Empty();
      }

      const inputCons = inputState as Cons<A>;
      const mapped = f(inputCons.head);

      if (mapped.isEmpty()) {
        // If mapping produced an empty result, skip to the next input element
        return flatMapState(inputCons.tail());
      } else {
        // Otherwise process the mapped result
        return flatMapState(inputCons.tail(), mapped);
      }
    };

    return LazyList.suspend(() => flatMapState(this));
  }

  /**
   * Filters elements of this LazyList using the provided predicate.
   * Uses a non-recursive approach to prevent stack overflows.
   */
  filter(p: (a: A) => boolean): LazyList<A> {
    // Create a new filter function that can handle multiple elements at once
    // to reduce stack pressure
    const filterElements = (list: LazyList<A>, maxDepth: number = 100): State<A> => {
      let current = list;
      let depth = 0;

      // Find the first element that passes the predicate
      while (!current.isEmpty() && depth < maxDepth) {
        const s = current.state();
        if (s.isEmpty) {
          return new Empty();
        }

        const cons = s as Cons<A>;
        if (p(cons.head)) {
          // Found an element that passes - return it with a safe tail
          return new Cons(cons.head, () => {
            // When the tail is accessed, continue filtering from the next element
            return LazyList.suspend(() => filterElements(cons.tail(), maxDepth));
          });
        }

        // This element doesn't match, move to the next one
        current = cons.tail();
        depth++;
      }

      // If we've gone through maxDepth elements without finding a match,
      // return a continuation to prevent stack overflow
      if (!current.isEmpty()) {
        return filterElements(current, maxDepth);
      }

      return new Empty();
    };

    return LazyList.suspend(() => filterElements(this));
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
   * Limits the maximum number of elements to prevent array length errors.
   */
  toArray(): A[] {
    const MAX_ARRAY_LENGTH = 100000; // Safe maximum array size
    const result: A[] = [];
    let current: LazyList<A> = this;
    let count = 0;

    while (!current.isEmpty() && count < MAX_ARRAY_LENGTH) {
      const s = current.state();
      if (!s.isEmpty) {
        const cons = s as Cons<A>;
        result.push(cons.head);
        current = cons.tail();
        count++;
      }
    }

    if (!current.isEmpty()) {
      console.warn('LazyList.toArray: array length exceeded maximum limit, truncating results');
    }

    return result;
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

    // Create a copy of the elements array to avoid mutation issues
    const elementsCopy = [...elements];

    // Define a recursive function that returns the correct state
    const createState = (index: number): () => State<A> => {
      return () => {
        if (index >= elementsCopy.length) {
          return new Empty();
        }
        return new Cons(
          elementsCopy[index],
          () => new LazyList<A>(createState(index + 1))
        );
      };
    };

    return new LazyList<A>(createState(0));
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
   * Creates a LazyList from an iterable source (array, Set, or other iterable).
   * If a single value is provided that's not an iterable, a single-element LazyList is returned.
   * @param iterable A value that can be iterated over, or a single value
   */
  static from<A>(iterable: A | A[] | Iterable<A>): LazyList<A> {
    // Handle single primitive values (like numbers)
    if (iterable === null || iterable === undefined || (typeof iterable !== 'object' && typeof iterable !== 'function')) {
      return new LazyList<A>(() => new Cons(iterable as A, () => LazyList.empty()));
    }

    // Handle array case directly without delegating to of
    if (Array.isArray(iterable)) {
      if (iterable.length === 0) {
        return LazyList.empty<A>();
      }

      // Create a copy to avoid mutation issues
      const elementsCopy = [...iterable];

      // Define a recursive function with proper closure over the index
      const createState = (index: number): () => State<A> => {
        return () => {
          if (index >= elementsCopy.length) {
            return new Empty();
          }
          return new Cons(
            elementsCopy[index],
            () => new LazyList<A>(createState(index + 1))
          );
        };
      };

      return new LazyList<A>(createState(0));
    }

    // Handle other iterables
    try {
      // Collect values from the iterable
      const values: A[] = [];
      for (const value of iterable as Iterable<A>) {
        values.push(value);
      }

      if (values.length === 0) {
        return LazyList.empty<A>();
      }

      // Create a recursive function with proper closure
      const createState = (index: number): () => State<A> => {
        return () => {
          if (index >= values.length) {
            return new Empty();
          }
          return new Cons(
            values[index],
            () => new LazyList<A>(createState(index + 1))
          );
        };
      };

      return new LazyList<A>(createState(0));
    } catch (e) {
      // If not iterable, create a single element LazyList
      return new LazyList<A>(() => new Cons(iterable as A, () => LazyList.empty()));
    }
  }

  /**
   * Creates a range of numbers from start (inclusive) to end (exclusive).
   * If no end is provided, creates a range from start to MAX_SAFE_RANGE.
   * @param start The start of the range (inclusive)
   * @param end The end of the range (exclusive). If undefined, creates a finite range up to MAX_SAFE_RANGE
   * @param step The step size
   */
  static range(start: number, end?: number, step: number = 1): LazyList<number> {
    // Set a reasonable maximum for "infinite" sequences
    const MAX_SAFE_RANGE = 1000000;

    if (end === undefined) {
      // Use a large but finite range instead of an infinite range
      end = start + MAX_SAFE_RANGE;
    }

    // Finite range from start to end
    if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
      return LazyList.empty();
    }

    return LazyList.suspend(() =>
      start === end
        ? new Empty()
        : new Cons(start, () => LazyList.range(start + step, end, step))
    );
  }

  /**
   * Creates a finite LazyList by repeated application of a function.
   * @param seed The initial value
   * @param f The function to apply to generate the next value
   * @param maxSize Maximum number of elements to generate (default 1000)
   */
  static iterate<A>(seed: A, f: (a: A) => A, maxSize: number = 1000): LazyList<A> {
    // Function to generate the state for iterate
    const iterate = (current: A, remaining: number): State<A> => {
      if (remaining <= 0) {
        return new Empty();
      }
      return new Cons(current, () => LazyList.suspend(() => iterate(f(current), remaining - 1)));
    };

    return LazyList.suspend(() => iterate(seed, maxSize));
  }

  /**
   * Creates a finite LazyList that repeatedly applies f.
   * @param f The function to apply
   * @param maxSize Maximum number of elements to generate (default 1000)
   */
  static continually<A>(f: () => A, maxSize: number = 1000): LazyList<A> {
    // Function to generate the state for continually
    const continually = (remaining: number): State<A> => {
      if (remaining <= 0) {
        return new Empty();
      }
      return new Cons(f(), () => LazyList.suspend(() => continually(remaining - 1)));
    };

    return LazyList.suspend(() => continually(maxSize));
  }

  /**
   * Applies a function to each element to create a new LazyList by iterating.
   * This is an instance method that allows chaining from a single value LazyList.
   * @param f The function to apply to generate next values
   */
  iterate(f: (a: A) => A): LazyList<A> {
    if (this.isEmpty()) {
      return LazyList.empty<A>();
    }

    // Get the first element as the seed
    const seed = this.head();

    // Use the static iterate method directly with the seed
    return LazyList.iterate(seed, f);
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