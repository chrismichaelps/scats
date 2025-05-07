/**
 * List<A> represents an immutable linked list structure.
 * It's a singly-linked list that supports efficient prepend operations.
 * 
 * @example
 * ```ts
 * import { List } from 'scats';
 * 
 * // Creating lists
 * const a = List.of(1, 2, 3);
 * const b = List.empty<number>();
 * const c = a.prepend(0);
 * 
 * // Using lists
 * const doubled = a.map(n => n * 2);
 * const summed = a.foldLeft(0, (acc, n) => acc + n);
 * const filtered = a.filter(n => n % 2 === 0);
 * ```
 */

import { Option, Some, None } from './Option';

/**
 * List<A> interface that all List implementations must satisfy
 */
export interface List<A> extends Iterable<A> {
  /**
   * Returns true if this list is empty, false otherwise
   */
  readonly isEmpty: boolean;

  /**
   * Returns the number of elements in this list
   */
  readonly size: number;

  /**
   * Returns the first element of this list, or throws an error if the list is empty
   * @throws Error if the list is empty
   */
  head(): A;

  /**
   * Returns the rest of this list (all elements except the head), or throws an error if the list is empty
   * @throws Error if the list is empty
   */
  tail(): List<A>;

  /**
   * Returns the first element of this list as an Option, or None if the list is empty
   */
  headOption(): Option<A>;

  /**
   * Returns the rest of this list as an Option, or None if the list is empty
   */
  tailOption(): Option<List<A>>;

  /**
   * Returns a new list with the provided element prepended to this list
   */
  prepend(element: A): List<A>;

  /**
   * Returns a new list with the provided elements appended to this list
   */
  append(element: A): List<A>;

  /**
   * Returns a new list that is the result of concatenating this list with the provided list
   */
  concat(that: List<A>): List<A>;

  /**
   * Returns a new list that is the result of applying the provided function to each element
   */
  map<B>(f: (a: A) => B): List<B>;

  /**
   * Returns a new list that is the result of applying the provided function to each element
   * and flattening the results
   */
  flatMap<B>(f: (a: A) => List<B>): List<B>;

  /**
   * Returns a new list containing only the elements that satisfy the provided predicate
   */
  filter(predicate: (a: A) => boolean): List<A>;

  /**
   * Returns a tuple of two lists, where the first list contains all elements that satisfy
   * the provided predicate, and the second list contains all elements that don't satisfy the predicate
   */
  partition(predicate: (a: A) => boolean): [List<A>, List<A>];

  /**
   * Returns true if any element in this list satisfies the provided predicate, false otherwise
   */
  exists(predicate: (a: A) => boolean): boolean;

  /**
   * Returns true if all elements in this list satisfy the provided predicate, false otherwise
   */
  forAll(predicate: (a: A) => boolean): boolean;

  /**
   * Returns the result of applying the provided function to each element, starting with the provided initial value
   */
  foldLeft<B>(initial: B, f: (acc: B, a: A) => B): B;

  /**
   * Returns the result of applying the provided function to each element, starting with the provided initial value,
   * working from right to left
   */
  foldRight<B>(initial: B, f: (a: A, acc: B) => B): B;

  /**
   * Executes the provided function for each element in this list
   */
  forEach(f: (a: A) => void): void;

  /**
   * Returns a new list containing the elements at the specified indices
   */
  slice(start: number, end?: number): List<A>;

  /**
   * Returns a new list with the first n elements
   */
  take(n: number): List<A>;

  /**
   * Returns a new list with all elements except the first n
   */
  drop(n: number): List<A>;

  /**
   * Returns a new list with elements while the predicate is satisfied
   */
  takeWhile(predicate: (a: A) => boolean): List<A>;

  /**
   * Returns a new list without elements while the predicate is satisfied
   */
  dropWhile(predicate: (a: A) => boolean): List<A>;

  /**
   * Returns the element at the specified index, or throws an error if the index is out of bounds
   * @throws Error if the index is out of bounds
   */
  get(index: number): A;

  /**
   * Returns the element at the specified index as an Option, or None if the index is out of bounds
   */
  getOption(index: number): Option<A>;

  /**
   * Returns a new list with the element at the specified index replaced with the provided element,
   * or the same list if the index is out of bounds
   */
  updateAt(index: number, element: A): List<A>;

  /**
   * Returns the index of the first occurrence of the specified element, or -1 if the element is not found
   */
  indexOf(element: A): number;

  /**
   * Returns true if this list contains the specified element, false otherwise
   */
  contains(element: A): boolean;

  /**
   * Returns a new list with distinct elements (removes duplicates)
   */
  distinct(): List<A>;

  /**
   * Returns a new list with the elements in reverse order
   */
  reverse(): List<A>;

  /**
   * Returns a new list sorted according to the natural ordering of the elements
   */
  sorted(compareFn?: (a: A, b: A) => number): List<A>;

  /**
   * Converts this list to an array
   */
  toArray(): A[];

  /**
   * Returns a string representation of this list
   */
  toString(): string;
}

/**
 * Empty list implementation
 */
class EmptyList<A> implements List<A> {
  get isEmpty(): boolean {
    return true;
  }

  get size(): number {
    return 0;
  }

  head(): never {
    throw new Error("Cannot get head of empty list");
  }

  tail(): never {
    throw new Error("Cannot get tail of empty list");
  }

  headOption(): Option<A> {
    return None;
  }

  tailOption(): Option<List<A>> {
    return None;
  }

  prepend(element: A): List<A> {
    return new ConsImpl(element, this);
  }

  append(element: A): List<A> {
    return new ConsImpl(element, this);
  }

  concat(that: List<A>): List<A> {
    return that;
  }

  map<B>(_f: (a: A) => B): List<B> {
    return empty<B>();
  }

  flatMap<B>(_f: (a: A) => List<B>): List<B> {
    return empty<B>();
  }

  filter(_predicate: (a: A) => boolean): List<A> {
    return this;
  }

  partition(_predicate: (a: A) => boolean): [List<A>, List<A>] {
    return [this, this];
  }

  exists(_predicate: (a: A) => boolean): boolean {
    return false;
  }

  forAll(_predicate: (a: A) => boolean): boolean {
    return true;
  }

  foldLeft<B>(initial: B, _f: (acc: B, a: A) => B): B {
    return initial;
  }

  foldRight<B>(initial: B, _f: (a: A, acc: B) => B): B {
    return initial;
  }

  forEach(_f: (a: A) => void): void {
    // Do nothing for empty list
  }

  slice(_start: number, _end?: number): List<A> {
    return this;
  }

  take(_n: number): List<A> {
    return this;
  }

  drop(_n: number): List<A> {
    return this;
  }

  takeWhile(_predicate: (a: A) => boolean): List<A> {
    return this;
  }

  dropWhile(_predicate: (a: A) => boolean): List<A> {
    return this;
  }

  get(_index: number): never {
    throw new Error("Index out of bounds");
  }

  getOption(_index: number): Option<A> {
    return None;
  }

  updateAt(_index: number, _element: A): List<A> {
    return this;
  }

  indexOf(_element: A): number {
    return -1;
  }

  contains(_element: A): boolean {
    return false;
  }

  distinct(): List<A> {
    return this;
  }

  reverse(): List<A> {
    return this;
  }

  sorted(_compareFn?: (a: A, b: A) => number): List<A> {
    return this;
  }

  toArray(): A[] {
    return [];
  }

  toString(): string {
    return "List()";
  }

  *[Symbol.iterator](): Iterator<A> {
    // Empty iterator
  }
}

/**
 * Non-empty list implementation
 */
class ConsImpl<A> implements List<A> {
  constructor(private readonly _head: A, private readonly _tail: List<A>) { }

  get isEmpty(): boolean {
    return false;
  }

  get size(): number {
    let size = 1;
    let current: List<A> = this._tail;
    while (!current.isEmpty) {
      size += 1;
      current = current.tail();
    }
    return size;
  }

  head(): A {
    return this._head;
  }

  tail(): List<A> {
    return this._tail;
  }

  headOption(): Option<A> {
    return Some(this._head);
  }

  tailOption(): Option<List<A>> {
    return Some(this._tail);
  }

  prepend(element: A): List<A> {
    return new ConsImpl(element, this);
  }

  append(element: A): List<A> {
    // Inefficient for large lists, but we're keeping the API
    return this.concat(List.of(element));
  }

  concat(that: List<A>): List<A> {
    // Using a more efficient implementation than naively recursing
    if (that.isEmpty) return this;

    // Build up a reversed version of this list
    let reversed = empty<A>();
    let current: List<A> = this;
    while (!current.isEmpty) {
      reversed = reversed.prepend(current.head());
      current = current.tail();
    }

    // Build the result by prepending the reversed elements onto 'that'
    let result = that;
    current = reversed;
    while (!current.isEmpty) {
      result = result.prepend(current.head());
      current = current.tail();
    }

    return result;
  }

  map<B>(f: (a: A) => B): List<B> {
    // Avoid stack overflow by iterative implementation
    const result: B[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      result.push(f(current.head()));
      current = current.tail();
    }

    // Build the list in reverse
    let listResult = empty<B>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  flatMap<B>(f: (a: A) => List<B>): List<B> {
    // Iterative to avoid stack overflow
    let result = empty<B>();
    const elements: List<B>[] = [];
    let current: List<A> = this;

    // Collect all mapped lists
    while (!current.isEmpty) {
      elements.push(f(current.head()));
      current = current.tail();
    }

    // Concatenate in reverse order
    for (let i = elements.length - 1; i >= 0; i--) {
      result = elements[i].concat(result);
    }

    return result;
  }

  filter(predicate: (a: A) => boolean): List<A> {
    // Iterative to avoid stack overflow
    const result: A[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      const head = current.head();
      if (predicate(head)) {
        result.push(head);
      }
      current = current.tail();
    }

    // Build the list in reverse
    let listResult = empty<A>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  partition(predicate: (a: A) => boolean): [List<A>, List<A>] {
    // Iterative to avoid stack overflow
    const trueResults: A[] = [];
    const falseResults: A[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      const head = current.head();
      if (predicate(head)) {
        trueResults.push(head);
      } else {
        falseResults.push(head);
      }
      current = current.tail();
    }

    // Build the lists in reverse
    let trueList = empty<A>();
    for (let i = trueResults.length - 1; i >= 0; i--) {
      trueList = trueList.prepend(trueResults[i]);
    }

    let falseList = empty<A>();
    for (let i = falseResults.length - 1; i >= 0; i--) {
      falseList = falseList.prepend(falseResults[i]);
    }

    return [trueList, falseList];
  }

  exists(predicate: (a: A) => boolean): boolean {
    let current: List<A> = this;
    while (!current.isEmpty) {
      if (predicate(current.head())) {
        return true;
      }
      current = current.tail();
    }
    return false;
  }

  forAll(predicate: (a: A) => boolean): boolean {
    let current: List<A> = this;
    while (!current.isEmpty) {
      if (!predicate(current.head())) {
        return false;
      }
      current = current.tail();
    }
    return true;
  }

  foldLeft<B>(initial: B, f: (acc: B, a: A) => B): B {
    let result = initial;
    let current: List<A> = this;
    while (!current.isEmpty) {
      result = f(result, current.head());
      current = current.tail();
    }
    return result;
  }

  foldRight<B>(initial: B, f: (a: A, acc: B) => B): B {
    // To avoid stack overflow, we reverse the list and then do foldLeft
    const reversed = this.reverse();
    return reversed.foldLeft(initial, (acc, a) => f(a, acc));
  }

  forEach(f: (a: A) => void): void {
    let current: List<A> = this;
    while (!current.isEmpty) {
      f(current.head());
      current = current.tail();
    }
  }

  slice(start: number, end?: number): List<A> {
    const endIndex = end === undefined ? this.size : end;
    return this.take(endIndex).drop(start);
  }

  take(n: number): List<A> {
    if (n <= 0) return empty<A>();

    const result: A[] = [];
    let current: List<A> = this;
    let count = 0;

    while (!current.isEmpty && count < n) {
      result.push(current.head());
      current = current.tail();
      count += 1;
    }

    // Build the list in reverse
    let listResult = empty<A>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  drop(n: number): List<A> {
    if (n <= 0) return this;

    let current: List<A> = this;
    let count = 0;

    while (!current.isEmpty && count < n) {
      current = current.tail();
      count += 1;
    }

    return current;
  }

  takeWhile(predicate: (a: A) => boolean): List<A> {
    const result: A[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      const head = current.head();
      if (!predicate(head)) break;
      result.push(head);
      current = current.tail();
    }

    // Build the list in reverse
    let listResult = empty<A>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  dropWhile(predicate: (a: A) => boolean): List<A> {
    let current: List<A> = this;

    while (!current.isEmpty) {
      if (!predicate(current.head())) {
        return current;
      }
      current = current.tail();
    }

    return empty<A>();
  }

  get(index: number): A {
    if (index < 0) {
      throw new Error("Index out of bounds");
    }

    let current: List<A> = this;
    let currentIndex = 0;

    while (!current.isEmpty) {
      if (currentIndex === index) {
        return current.head();
      }
      current = current.tail();
      currentIndex += 1;
    }

    throw new Error("Index out of bounds");
  }

  getOption(index: number): Option<A> {
    if (index < 0) {
      return None;
    }

    let current: List<A> = this;
    let currentIndex = 0;

    while (!current.isEmpty) {
      if (currentIndex === index) {
        return Some(current.head());
      }
      current = current.tail();
      currentIndex += 1;
    }

    return None;
  }

  updateAt(index: number, element: A): List<A> {
    if (index < 0) {
      return this;
    }

    const result: A[] = [];
    let current: List<A> = this;
    let currentIndex = 0;
    let found = false;

    while (!current.isEmpty) {
      if (currentIndex === index) {
        result.push(element);
        found = true;
      } else {
        result.push(current.head());
      }
      current = current.tail();
      currentIndex += 1;
    }

    if (!found) {
      return this;
    }

    // Build the list in reverse
    let listResult = empty<A>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  indexOf(element: A): number {
    let current: List<A> = this;
    let currentIndex = 0;

    while (!current.isEmpty) {
      if (current.head() === element) {
        return currentIndex;
      }
      current = current.tail();
      currentIndex += 1;
    }

    return -1;
  }

  contains(element: A): boolean {
    return this.indexOf(element) !== -1;
  }

  distinct(): List<A> {
    const seen = new Set<A>();
    const result: A[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      const head = current.head();
      if (!seen.has(head)) {
        seen.add(head);
        result.push(head);
      }
      current = current.tail();
    }

    // Build the list in reverse
    let listResult = empty<A>();
    for (let i = result.length - 1; i >= 0; i--) {
      listResult = listResult.prepend(result[i]);
    }

    return listResult;
  }

  reverse(): List<A> {
    let result = empty<A>();
    let current: List<A> = this;

    while (!current.isEmpty) {
      result = result.prepend(current.head());
      current = current.tail();
    }

    return result;
  }

  sorted(compareFn?: (a: A, b: A) => number): List<A> {
    const array = this.toArray();
    array.sort(compareFn);

    // Build the list in reverse
    let result = empty<A>();
    for (let i = array.length - 1; i >= 0; i--) {
      result = result.prepend(array[i]);
    }

    return result;
  }

  toArray(): A[] {
    const result: A[] = [];
    let current: List<A> = this;

    while (!current.isEmpty) {
      result.push(current.head());
      current = current.tail();
    }

    return result;
  }

  toString(): string {
    return `List(${this.toArray().join(", ")})`;
  }

  *[Symbol.iterator](): Iterator<A> {
    let current: List<A> = this;
    while (!current.isEmpty) {
      yield current.head();
      current = current.tail();
    }
  }
}

/**
 * Creates an empty list
 */
export function empty<A>(): List<A> {
  return new EmptyList<A>();
}

/**
 * List namespace containing utility functions
 */
export namespace List {
  /**
   * Creates a list containing the provided elements
   */
  export function of<A>(...elements: A[]): List<A> {
    let result = empty<A>();
    for (let i = elements.length - 1; i >= 0; i--) {
      result = result.prepend(elements[i]);
    }
    return result;
  }

  /**
   * Creates a list from an array
   */
  export function fromArray<A>(array: A[]): List<A> {
    return of(...array);
  }

  /**
   * Creates a list from an iterable
   */
  export function fromIterable<A>(iterable: Iterable<A>): List<A> {
    return fromArray([...iterable]);
  }

  /**
   * Creates an empty list
   */
  export function empty<A>(): List<A> {
    return new EmptyList<A>();
  }

  /**
   * Creates a list with elements produced by the specified function
   */
  export function fill<A>(n: number, f: (index: number) => A): List<A> {
    const array = Array(n).fill(null).map((_, i) => f(i));
    return fromArray(array);
  }

  /**
   * Creates a list with the specified element repeated n times
   */
  export function repeat<A>(element: A, n: number): List<A> {
    return fill(n, () => element);
  }

  /**
   * Creates a list with numbers from start (inclusive) to end (exclusive)
   */
  export function range(start: number, end: number, step = 1): List<number> {
    if (step === 0) {
      throw new Error("Step cannot be 0");
    }
    const array: number[] = [];
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        array.push(i);
      }
    } else {
      for (let i = start; i > end; i += step) {
        array.push(i);
      }
    }
    return fromArray(array);
  }

  /**
   * Zips two lists together, element by element
   */
  export function zip<A, B>(as: List<A>, bs: List<B>): List<[A, B]> {
    const result: [A, B][] = [];
    let currA: List<A> = as;
    let currB: List<B> = bs;

    while (!currA.isEmpty && !currB.isEmpty) {
      result.push([currA.head(), currB.head()]);
      currA = currA.tail();
      currB = currB.tail();
    }

    return fromArray(result);
  }

  /**
   * Maps two lists with the provided function
   */
  export function map2<A, B, C>(
    as: List<A>,
    bs: List<B>,
    f: (a: A, b: B) => C
  ): List<C> {
    return zip(as, bs).map(([a, b]) => f(a, b));
  }
} 