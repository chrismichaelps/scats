/**
 * Implementation of Scala-like Tuples
 * 
 * @example
 * ```ts
 * import { Tuple, Tuple2 } from 'scats/tuple';
 * 
 * const pair = Tuple.of(1, "hello");
 * const first = pair._1;  // 1
 * const swapped = pair.swap();  // Tuple2("hello", 1)
 * 
 * // Destructuring
 * const [num, str] = pair;
 * 
 * // Creating a tuple of 3 elements
 * const triple = Tuple.of(1, "hello", true);
 * ```
 */

/**
 * Tuple2 represents an ordered pair of values.
 */
export class Tuple2<T1, T2> implements Iterable<T1 | T2> {
  /**
   * Creates a new Tuple2 with the given values.
   */
  constructor(
    readonly _1: T1,
    readonly _2: T2
  ) { }

  /**
   * Returns a new Tuple2 with the elements swapped.
   */
  swap(): Tuple2<T2, T1> {
    return new Tuple2(this._2, this._1);
  }

  /**
   * Maps the first element of this Tuple2 using the provided function.
   */
  map1<U>(f: (value: T1) => U): Tuple2<U, T2> {
    return new Tuple2(f(this._1), this._2);
  }

  /**
   * Maps the second element of this Tuple2 using the provided function.
   */
  map2<U>(f: (value: T2) => U): Tuple2<T1, U> {
    return new Tuple2(this._1, f(this._2));
  }

  /**
   * Maps both elements of this Tuple2 using the provided functions.
   */
  bimap<U1, U2>(f1: (value: T1) => U1, f2: (value: T2) => U2): Tuple2<U1, U2> {
    return new Tuple2(f1(this._1), f2(this._2));
  }

  /**
   * Converts this Tuple2 to an array.
   */
  toArray(): [T1, T2] {
    return [this._1, this._2];
  }

  /**
   * Returns a string representation of this Tuple2.
   */
  toString(): string {
    return `(${this._1}, ${this._2})`;
  }

  /**
   * Returns an iterator over the elements of this Tuple2.
   */
  [Symbol.iterator](): Iterator<T1 | T2> {
    let index = 0;
    const tuple = this;

    return {
      next(): IteratorResult<T1 | T2> {
        if (index === 0) {
          index++;
          return { value: tuple._1, done: false };
        } else if (index === 1) {
          index++;
          return { value: tuple._2, done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
}

/**
 * Tuple3 represents an ordered triplet of values.
 */
export class Tuple3<T1, T2, T3> implements Iterable<T1 | T2 | T3> {
  /**
   * Creates a new Tuple3 with the given values.
   */
  constructor(
    readonly _1: T1,
    readonly _2: T2,
    readonly _3: T3
  ) { }

  /**
   * Maps the first element of this Tuple3 using the provided function.
   */
  map1<U>(f: (value: T1) => U): Tuple3<U, T2, T3> {
    return new Tuple3(f(this._1), this._2, this._3);
  }

  /**
   * Maps the second element of this Tuple3 using the provided function.
   */
  map2<U>(f: (value: T2) => U): Tuple3<T1, U, T3> {
    return new Tuple3(this._1, f(this._2), this._3);
  }

  /**
   * Maps the third element of this Tuple3 using the provided function.
   */
  map3<U>(f: (value: T3) => U): Tuple3<T1, T2, U> {
    return new Tuple3(this._1, this._2, f(this._3));
  }

  /**
   * Maps all elements of this Tuple3 using the provided functions.
   */
  map<U1, U2, U3>(f1: (value: T1) => U1, f2: (value: T2) => U2, f3: (value: T3) => U3): Tuple3<U1, U2, U3> {
    return new Tuple3(f1(this._1), f2(this._2), f3(this._3));
  }

  /**
   * Converts this Tuple3 to a Tuple2 by removing the third element.
   */
  toTuple2(): Tuple2<T1, T2> {
    return new Tuple2(this._1, this._2);
  }

  /**
   * Converts this Tuple3 to an array.
   */
  toArray(): [T1, T2, T3] {
    return [this._1, this._2, this._3];
  }

  /**
   * Returns a string representation of this Tuple3.
   */
  toString(): string {
    return `(${this._1}, ${this._2}, ${this._3})`;
  }

  /**
   * Returns an iterator over the elements of this Tuple3.
   */
  [Symbol.iterator](): Iterator<T1 | T2 | T3> {
    let index = 0;
    const tuple = this;

    return {
      next(): IteratorResult<T1 | T2 | T3> {
        if (index === 0) {
          index++;
          return { value: tuple._1, done: false };
        } else if (index === 1) {
          index++;
          return { value: tuple._2, done: false };
        } else if (index === 2) {
          index++;
          return { value: tuple._3, done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
}

/**
 * Tuple namespace containing utility functions for creating tuples.
 */
export const Tuple = {
  /**
   * Creates a tuple from the given values.
   */
  of(...values: any[]): any {
    if (values.length === 2) {
      return new Tuple2(values[0], values[1]);
    } else if (values.length === 3) {
      return new Tuple3(values[0], values[1], values[2]);
    } else {
      throw new Error(`Unsupported number of arguments: ${values.length}`);
    }
  },

  /**
   * Creates a Tuple2 from an array with two elements.
   */
  fromArray2<T1, T2>(array: [T1, T2]): Tuple2<T1, T2> {
    return new Tuple2(array[0], array[1]);
  },

  /**
   * Creates a Tuple3 from an array with three elements.
   */
  fromArray3<T1, T2, T3>(array: [T1, T2, T3]): Tuple3<T1, T2, T3> {
    return new Tuple3(array[0], array[1], array[2]);
  },

  /**
   * Creates a Tuple2 from an entry (key-value pair).
   */
  fromEntry<K, V>(entry: [K, V]): Tuple2<K, V> {
    return this.fromArray2(entry);
  }
};

// Default export
export default Tuple; 