import { Iterable } from './Iterable';

/**
 * The Seq trait represents sequences. A sequence is a kind of iterable that has a length
 * and whose elements have fixed index positions, starting from 0.
 */
export interface Seq<A> extends Iterable<A> {
  /**
   * Returns the element at the specified index.
   */
  apply(i: number): A;

  /**
   * Tests whether an index is contained in this sequence's range.
   */
  isDefinedAt(i: number): boolean;

  /**
   * Returns the index range of this sequence, from 0 to length - 1.
   */
  indices(): Iterable<number>;

  /**
   * Compares the length of this sequence with a specified value.
   * Returns -1 if shorter, 0 if equal, 1 if longer.
   */
  lengthCompare(len: number): number;

  /**
   * Finds the index of the first occurrence of an element.
   */
  indexOf(elem: A, from?: number): number;

  /**
   * Finds the index of the last occurrence of an element.
   */
  lastIndexOf(elem: A, end?: number): number;

  /**
   * Finds the first index where a subsequence occurs.
   */
  indexOfSlice<B>(that: Seq<B>, from?: number): number;

  /**
   * Finds the last index where a subsequence occurs.
   */
  lastIndexOfSlice<B>(that: Seq<B>, end?: number): number;

  /**
   * Finds the first index where a predicate is satisfied.
   */
  indexWhere(p: (a: A) => boolean, from?: number): number;

  /**
   * Finds the last index where a predicate is satisfied.
   */
  lastIndexWhere(p: (a: A) => boolean, end?: number): number;

  /**
   * Returns the length of the longest segment of elements starting at a given index that all satisfy a predicate.
   */
  segmentLength(p: (a: A) => boolean, from?: number): number;

  /**
   * Returns a new sequence with an element prepended.
   */
  prepended(elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements prepended.
   */
  prependedAll<B>(prefix: Iterable<B>): Seq<A | B>;

  /**
   * Returns a new sequence with an element appended.
   */
  appended(elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements appended.
   */
  appendedAll<B>(suffix: Iterable<B>): Seq<A | B>;

  /**
   * Returns a new sequence padded to a given length with a given value.
   */
  padTo(len: number, elem: A): Seq<A>;

  /**
   * Returns a new sequence with a slice of another sequence patched in.
   */
  patch<B>(from: number, patch: Seq<B>, replaced: number): Seq<A | B>;

  /**
   * Returns a new sequence with one element replaced.
   */
  updated(index: number, elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements sorted.
   */
  sorted(implicit?: (a: A, b: A) => number): Seq<A>;

  /**
   * Returns a new sequence sorted according to a comparison function.
   */
  sortWith(lt: (a: A, b: A) => boolean): Seq<A>;

  /**
   * Returns a new sequence sorted according to a key function.
   */
  sortBy<B>(f: (a: A) => B, implicit?: (a: B, b: B) => number): Seq<A>;

  /**
   * Returns a new sequence with elements in reverse order.
   */
  reverse(): Seq<A>;

  /**
   * Returns an iterator yielding elements in reverse order.
   */
  reverseIterator(): Iterator<A>;

  /**
   * Tests whether this sequence starts with a given sequence.
   */
  startsWith<B>(that: Seq<B>, offset?: number): boolean;

  /**
   * Tests whether this sequence ends with a given sequence.
   */
  endsWith<B>(that: Seq<B>): boolean;

  /**
   * Tests whether this sequence contains a given value as an element.
   */
  contains(elem: A): boolean;

  /**
   * Tests whether this sorted sequence contains a given value.
   */
  search(elem: A): number;

  /**
   * Tests whether this sequence contains a given sequence as a slice.
   */
  containsSlice<B>(that: Seq<B>): boolean;

  /**
   * Tests whether corresponding elements of this sequence and another satisfy a predicate.
   */
  corresponds<B>(that: Seq<B>, p: (a: A, b: B) => boolean): boolean;

  /**
   * Returns the multi-set intersection of this sequence and another.
   */
  intersect<B>(that: Seq<B>): Seq<A>;

  /**
   * Returns the multi-set difference of this sequence and another.
   */
  diff<B>(that: Seq<B>): Seq<A>;

  /**
   * Returns a new sequence with no duplicate elements.
   */
  distinct(): Seq<A>;

  /**
   * Returns a new sequence with no duplicate elements according to a transformation function.
   */
  distinctBy<B>(f: (a: A) => B): Seq<A>;
}

/**
 * The LinearSeq trait represents sequences that have efficient head and tail operations.
 */
export interface LinearSeq<A> extends Seq<A> {
  // LinearSeq doesn't add new operations but offers different performance characteristics
}

/**
 * The IndexedSeq trait represents sequences that have efficient apply and length operations.
 */
export interface IndexedSeq<A> extends Seq<A> {
  // IndexedSeq doesn't add new operations but offers different performance characteristics
}

/**
 * The mutable IndexedSeq trait adds in-place operations.
 */
export interface MutableIndexedSeq<A> extends IndexedSeq<A> {
  /**
   * Updates the element at the given index.
   */
  update(index: number, elem: A): void;

  /**
   * Transforms all elements of this sequence in place.
   */
  mapInPlace(f: (a: A) => A): this;

  /**
   * Sorts this sequence in place.
   */
  sortInPlace(implicit?: (a: A, b: A) => number): this;

  /**
   * Sorts this sequence in place according to a comparison function.
   */
  sortInPlaceWith(lt: (a: A, b: A) => boolean): this;

  /**
   * Sorts this sequence in place according to a key function.
   */
  sortInPlaceBy<B>(f: (a: A) => B, implicit?: (a: B, b: B) => number): this;
}

/**
 * The Buffer trait represents sequences that allow addition, insertion, and removal of elements.
 */
export interface Buffer<A> extends MutableIndexedSeq<A> {
  /**
   * Appends an element to this buffer.
   */
  append(elem: A): this;

  /**
   * Appends all elements of a collection to this buffer.
   */
  appendAll<B extends A>(xs: Iterable<B>): this;

  /**
   * Prepends an element to this buffer.
   */
  prepend(elem: A): this;

  /**
   * Prepends all elements of a collection to this buffer.
   */
  prependAll<B extends A>(xs: Iterable<B>): this;

  /**
   * Inserts an element at a given index.
   */
  insert(idx: number, elem: A): this;

  /**
   * Inserts elements at a given index.
   */
  insertAll<B extends A>(idx: number, xs: Iterable<B>): this;

  /**
   * Pads this buffer to a given length by appending a value.
   */
  padToInPlace(len: number, elem: A): this;

  /**
   * Removes an element from this buffer.
   */
  subtractOne(elem: A): this;

  /**
   * Removes all elements in a collection from this buffer.
   */
  subtractAll<B extends A>(xs: Iterable<B>): this;

  /**
   * Removes the element at a given index.
   */
  remove(idx: number, count?: number): A;

  /**
   * Removes the first n elements.
   */
  trimStart(n: number): this;

  /**
   * Removes the last n elements.
   */
  trimEnd(n: number): this;

  /**
   * Removes all elements from this buffer.
   */
  clear(): this;

  /**
   * Replaces a slice of this buffer with another sequence.
   */
  patchInPlace<B extends A>(from: number, patch: Iterable<B>, replaced: number): this;

  /**
   * Returns a new buffer with the same elements as this buffer.
   */
  clone(): Buffer<A>;
} 