import { AbstractIterable, Iterable } from './Iterable';
import { Seq } from './Seq';

/**
 * Abstract base class for sequence implementations.
 */
export abstract class AbstractSeq<A> extends AbstractIterable<A> implements Seq<A> {
  /**
   * Returns the element at the specified index.
   */
  apply(i: number): A {
    if (i < 0 || i >= this.size()) {
      throw new Error(`Index out of bounds: ${i}`);
    }
    let j = 0;
    for (const elem of this) {
      if (j === i) return elem;
      j++;
    }
    throw new Error(`Index out of bounds: ${i}`); // Should never reach here
  }

  /**
   * Tests whether an index is contained in this sequence's range.
   */
  isDefinedAt(i: number): boolean {
    return i >= 0 && i < this.size();
  }

  /**
   * Returns the index range of this sequence, from 0 to length - 1.
   */
  indices(): Iterable<number> {
    const size = this.size();
    return new class extends AbstractIterable<number> {
      iterator(): Iterator<number> {
        let i = 0;
        return {
          next: () => {
            if (i < size) {
              return { done: false, value: i++ };
            } else {
              return { done: true, value: undefined as any };
            }
          }
        };
      }
    }();
  }

  /**
   * Compares the length of this sequence with a specified value.
   */
  lengthCompare(len: number): number {
    const size = this.size();
    if (size < len) return -1;
    if (size > len) return 1;
    return 0;
  }

  /**
   * Finds the index of the first occurrence of an element.
   */
  indexOf(elem: A, from: number = 0): number {
    let i = 0;
    for (const a of this) {
      if (i >= from && this.equals(a, elem)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  /**
   * Finds the index of the last occurrence of an element.
   */
  lastIndexOf(elem: A, end: number = this.size() - 1): number {
    const arr = this.toArray();
    for (let i = Math.min(end, arr.length - 1); i >= 0; i--) {
      if (this.equals(arr[i], elem)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Finds the first index where a subsequence occurs.
   */
  indexOfSlice<B>(that: Seq<B>, from: number = 0): number {
    const thatArr = that.toArray();
    if (thatArr.length === 0) return from;

    let i = from;
    const thisArr = this.toArray();

    outer: while (i <= thisArr.length - thatArr.length) {
      for (let j = 0; j < thatArr.length; j++) {
        if (!this.equals(thisArr[i + j], thatArr[j])) {
          i++;
          continue outer;
        }
      }
      return i;
    }

    return -1;
  }

  /**
   * Finds the last index where a subsequence occurs.
   */
  lastIndexOfSlice<B>(that: Seq<B>, end: number = this.size() - 1): number {
    const thatArr = that.toArray();
    if (thatArr.length === 0) return Math.min(end, this.size());

    const thisArr = this.toArray();
    const maxStartIdx = Math.min(end, thisArr.length - thatArr.length);

    for (let i = maxStartIdx; i >= 0; i--) {
      let found = true;
      for (let j = 0; j < thatArr.length; j++) {
        if (!this.equals(thisArr[i + j], thatArr[j])) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }

    return -1;
  }

  /**
   * Finds the first index where a predicate is satisfied.
   */
  indexWhere(p: (a: A) => boolean, from: number = 0): number {
    let i = 0;
    for (const a of this) {
      if (i >= from && p(a)) {
        return i;
      }
      i++;
    }
    return -1;
  }

  /**
   * Finds the last index where a predicate is satisfied.
   */
  lastIndexWhere(p: (a: A) => boolean, end: number = this.size() - 1): number {
    const arr = this.toArray();
    for (let i = Math.min(end, arr.length - 1); i >= 0; i--) {
      if (p(arr[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Returns the length of the longest segment of elements starting at a given index that all satisfy a predicate.
   */
  segmentLength(p: (a: A) => boolean, from: number = 0): number {
    let i = 0;
    let count = 0;

    for (const a of this) {
      if (i < from) {
        i++;
        continue;
      }

      if (p(a)) {
        count++;
      } else {
        break;
      }

      i++;
    }

    return count;
  }

  /**
   * Returns a new sequence with an element prepended.
   */
  abstract prepended(elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements prepended.
   */
  abstract prependedAll<B>(prefix: Iterable<B>): Seq<A | B>;

  /**
   * Returns a new sequence with an element appended.
   */
  abstract appended(elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements appended.
   */
  abstract appendedAll<B>(suffix: Iterable<B>): Seq<A | B>;

  /**
   * Returns a new sequence padded to a given length with a given value.
   */
  padTo(len: number, elem: A): Seq<A> {
    const size = this.size();
    if (size >= len) return this;

    return this.appendedAll(new class extends AbstractIterable<A> {
      iterator(): Iterator<A> {
        let i = 0;
        return {
          next: () => {
            if (i < len - size) {
              i++;
              return { done: false, value: elem };
            } else {
              return { done: true, value: undefined as any };
            }
          }
        };
      }
    }());
  }

  /**
   * Returns a new sequence with a slice of another sequence patched in.
   */
  abstract patch<B>(from: number, patch: Seq<B>, replaced: number): Seq<A | B>;

  /**
   * Returns a new sequence with one element replaced.
   */
  abstract updated(index: number, elem: A): Seq<A>;

  /**
   * Returns a new sequence with elements sorted.
   */
  sorted(implicit: (a: A, b: A) => number = (a, b) => (a as any) - (b as any)): Seq<A> {
    const arr = this.toArray();
    arr.sort(implicit);
    return this.fromArray(arr);
  }

  /**
   * Returns a new sequence sorted according to a comparison function.
   */
  sortWith(lt: (a: A, b: A) => boolean): Seq<A> {
    const arr = this.toArray();
    arr.sort((a, b) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0);
    return this.fromArray(arr);
  }

  /**
   * Returns a new sequence sorted according to a key function.
   */
  sortBy<B>(f: (a: A) => B, implicit: (a: B, b: B) => number = (a, b) => (a as any) - (b as any)): Seq<A> {
    const arr = this.toArray();
    arr.sort((a, b) => implicit(f(a), f(b)));
    return this.fromArray(arr);
  }

  /**
   * Returns a new sequence with elements in reverse order.
   */
  reverse(): Seq<A> {
    const arr = this.toArray();
    arr.reverse();
    return this.fromArray(arr);
  }

  /**
   * Returns an iterator yielding elements in reverse order.
   */
  reverseIterator(): Iterator<A> {
    const arr = this.toArray();
    let i = arr.length - 1;

    return {
      next: () => {
        if (i >= 0) {
          return { done: false, value: arr[i--] };
        } else {
          return { done: true, value: undefined as any };
        }
      }
    };
  }

  /**
   * Tests whether this sequence starts with a given sequence.
   */
  startsWith<B>(that: Seq<B>, offset: number = 0): boolean {
    if (offset < 0) return false;

    const thisArr = this.toArray();
    const thatArr = that.toArray();

    if (thisArr.length - offset < thatArr.length) return false;

    for (let i = 0; i < thatArr.length; i++) {
      if (!this.equals(thisArr[i + offset], thatArr[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Tests whether this sequence ends with a given sequence.
   */
  endsWith<B>(that: Seq<B>): boolean {
    const thisArr = this.toArray();
    const thatArr = that.toArray();

    if (thisArr.length < thatArr.length) return false;

    const offset = thisArr.length - thatArr.length;

    for (let i = 0; i < thatArr.length; i++) {
      if (!this.equals(thisArr[i + offset], thatArr[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Tests whether this sequence contains a given value as an element.
   */
  contains(elem: A): boolean {
    for (const a of this) {
      if (this.equals(a, elem)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tests whether this sorted sequence contains a given value.
   */
  search(elem: A): number {
    // Binary search could be implemented for sorted sequences
    // but for simplicity we'll use indexOf
    return this.indexOf(elem);
  }

  /**
   * Tests whether this sequence contains a given sequence as a slice.
   */
  containsSlice<B>(that: Seq<B>): boolean {
    return this.indexOfSlice(that) >= 0;
  }

  /**
   * Tests whether corresponding elements of this sequence and another satisfy a predicate.
   */
  corresponds<B>(that: Seq<B>, p: (a: A, b: B) => boolean): boolean {
    const thisIt = this.iterator();
    const thatIt = that.iterator();

    let thisNext = thisIt.next();
    let thatNext = thatIt.next();

    while (!thisNext.done && !thatNext.done) {
      if (!p(thisNext.value, thatNext.value)) return false;
      thisNext = thisIt.next();
      thatNext = thatIt.next();
    }

    // Fix the boolean | undefined issue
    return Boolean(thisNext.done) && Boolean(thatNext.done);
  }

  /**
   * Returns the multi-set intersection of this sequence and another.
   */
  intersect<B>(that: Seq<B>): Seq<A> {
    const thatElements = new Set();
    for (const b of that) {
      thatElements.add(b);
    }

    return this.filter(a => {
      for (const b of thatElements) {
        if (this.equals(a, b)) {
          thatElements.delete(b);
          return true;
        }
      }
      return false;
    }) as any as Seq<A>;
  }

  /**
   * Returns the multi-set difference of this sequence and another.
   */
  diff<B>(that: Seq<B>): Seq<A> {
    const thatElements = new Set();
    for (const b of that) {
      thatElements.add(b);
    }

    return this.filter(a => {
      for (const b of thatElements) {
        if (this.equals(a, b)) {
          thatElements.delete(b);
          return false;
        }
      }
      return true;
    }) as any as Seq<A>;
  }

  /**
   * Returns a new sequence with no duplicate elements.
   */
  distinct(): Seq<A> {
    const seen = new Set();
    return this.filter(a => {
      for (const b of seen) {
        if (this.equals(a, b)) return false;
      }
      seen.add(a);
      return true;
    }) as any as Seq<A>;
  }

  /**
   * Returns a new sequence with no duplicate elements according to a transformation function.
   */
  distinctBy<B>(f: (a: A) => B): Seq<A> {
    const seen = new Set();
    return this.filter(a => {
      const b = f(a);
      for (const c of seen) {
        if (this.equals(b, c)) return false;
      }
      seen.add(b);
      return true;
    }) as any as Seq<A>;
  }

  /**
   * Helper method to compare elements for equality.
   */
  protected equals(a: any, b: any): boolean {
    return a === b;
  }

  /**
   * Helper method to create a sequence from an array.
   */
  protected abstract fromArray(arr: A[]): Seq<A>;
} 