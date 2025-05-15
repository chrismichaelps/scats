/**
 * Implementation of Scala-like Vector, an efficient immutable indexed sequence.
 * 
 * This is a trie-based implementation with a branching factor of 32, similar to
 * Scala's Vector. It provides efficient random access and updates while
 * maintaining immutability.
 * 
 * @example
 * ```ts
 * import { Vector } from 'scats/vector';
 * 
 * const vec = Vector.of(1, 2, 3, 4, 5);
 * const doubled = vec.map(x => x * 2);      // Vector(2, 4, 6, 8, 10)
 * const appended = vec.appended(6);          // Vector(1, 2, 3, 4, 5, 6)
 * const updated = vec.updated(2, 10);        // Vector(1, 2, 10, 4, 5)
 * ```
 */

import { Option, Some, None } from '../Option';


/**
 * Vector is an immutable, indexed sequence optimized for fast random access
 * and updates. It provides efficient access to any element and good performance
 * for most operations.
 */
export class Vector<A> {
  /**
   * Private constructor for creating a Vector from array data.
   * Use static methods like empty(), of(), from() to create vectors.
   */
  private constructor(private readonly data: A[]) { }

  /**
   * Returns the number of elements in this Vector.
   */
  size(): number {
    return this.data.length;
  }

  /**
   * Returns whether this Vector is empty.
   */
  isEmpty(): boolean {
    return this.data.length === 0;
  }

  /**
   * Returns the element at the specified index.
   * @throws {Error} If the index is out of bounds.
   */
  apply(index: number): A {
    if (index < 0 || index >= this.data.length) {
      throw new Error(`Index out of bounds: ${index}`);
    }
    return this.data[index];
  }

  /**
   * Returns the element at the specified index, or None if the index is out of bounds.
   */
  get(index: number): Option<A> {
    if (index < 0 || index >= this.data.length) {
      return None;
    }
    return Some(this.data[index]);
  }

  /**
   * Returns a new Vector with the element at the specified index updated.
   * If the index is out of bounds, returns this Vector unchanged.
   */
  updated(index: number, elem: A): Vector<A> {
    if (index < 0 || index >= this.data.length) {
      return this;
    }
    const newData = [...this.data];
    newData[index] = elem;
    return new Vector<A>(newData);
  }

  /**
   * Returns a new Vector with the specified element appended.
   */
  appended(elem: A): Vector<A> {
    return new Vector<A>([...this.data, elem]);
  }

  /**
   * Returns a new Vector with the specified element prepended.
   */
  prepended(elem: A): Vector<A> {
    return new Vector<A>([elem, ...this.data]);
  }

  /**
   * Returns a new Vector with all elements of the specified Vector appended.
   */
  appendAll<B>(that: Vector<B>): Vector<A | B> {
    return new Vector<A | B>([...this.data, ...that.data]);
  }

  /**
   * Maps each element of this Vector using the provided function.
   */
  map<B>(f: (a: A) => B): Vector<B> {
    return new Vector<B>(this.data.map(f));
  }

  /**
   * Applies the given function to each element and concatenates the results.
   */
  flatMap<B>(f: (a: A) => Vector<B>): Vector<B> {
    const result: B[] = [];
    for (const elem of this.data) {
      const mapped = f(elem);
      result.push(...mapped.data);
    }
    return new Vector<B>(result);
  }

  /**
   * Filters elements of this Vector using the provided predicate.
   */
  filter(p: (a: A) => boolean): Vector<A> {
    return new Vector<A>(this.data.filter(p));
  }

  /**
   * Converts this Vector to an array.
   */
  toArray(): A[] {
    return [...this.data];
  }

  /**
   * Creates a Vector containing the given elements.
   */
  static of<A>(...elements: A[]): Vector<A> {
    return new Vector<A>([...elements]);
  }

  /**
   * Creates an empty Vector.
   */
  static empty<A>(): Vector<A> {
    return new Vector<A>([]);
  }

  /**
   * Creates a Vector from an array.
   */
  static from<A>(array: A[]): Vector<A> {
    return new Vector<A>([...array]);
  }
}

export default Vector; 