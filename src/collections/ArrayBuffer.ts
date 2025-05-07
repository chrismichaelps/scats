import { Buffer, Seq } from './Seq';
import { AbstractSeq } from './AbstractSeq';
import { Iterable } from './Iterable';
import { ArraySeq } from './ArraySeq';

/**
 * A mutable buffer implementation backed by an array.
 */
export class ArrayBuffer<A> extends AbstractSeq<A> implements Buffer<A> {
  private elements: A[];

  /**
   * Creates a new ArrayBuffer from the given elements.
   */
  constructor(elements: A[] = []) {
    super();
    this.elements = [...elements];
  }

  /**
   * Creates a new ArrayBuffer from the given elements.
   */
  static of<A>(...elements: A[]): ArrayBuffer<A> {
    return new ArrayBuffer(elements);
  }

  /**
   * Creates a new ArrayBuffer from an iterable.
   */
  static from<A>(iterable: Iterable<A>): ArrayBuffer<A> {
    const elements: A[] = [];
    for (const elem of iterable) {
      elements.push(elem);
    }
    return new ArrayBuffer(elements);
  }

  /**
   * Creates an empty ArrayBuffer.
   */
  static empty<A>(): ArrayBuffer<A> {
    return new ArrayBuffer<A>([]);
  }

  /**
   * Returns an iterator over the elements of this buffer.
   */
  iterator(): Iterator<A> {
    let index = 0;
    return {
      next: () => {
        if (index < this.elements.length) {
          return { done: false, value: this.elements[index++] };
        } else {
          return { done: true, value: undefined as any };
        }
      }
    };
  }

  /**
   * Returns the element at the specified index.
   */
  apply(i: number): A {
    if (i < 0 || i >= this.elements.length) {
      throw new Error(`Index out of bounds: ${i}`);
    }
    return this.elements[i];
  }

  /**
   * Updates the element at the given index.
   */
  update(index: number, elem: A): void {
    if (index < 0 || index >= this.elements.length) {
      throw new Error(`Index out of bounds: ${index}`);
    }
    this.elements[index] = elem;
  }

  /**
   * Returns the size of this buffer.
   */
  size(): number {
    return this.elements.length;
  }

  /**
   * Returns the known size of this buffer.
   */
  knownSize(): number {
    return this.elements.length;
  }

  /**
   * Transforms all elements of this buffer in place.
   */
  mapInPlace(f: (a: A) => A): this {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] = f(this.elements[i]);
    }
    return this;
  }

  /**
   * Sorts this buffer in place.
   */
  sortInPlace(implicit: (a: A, b: A) => number = (a, b) => (a as any) - (b as any)): this {
    this.elements.sort(implicit);
    return this;
  }

  /**
   * Sorts this buffer in place according to a comparison function.
   */
  sortInPlaceWith(lt: (a: A, b: A) => boolean): this {
    this.elements.sort((a, b) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0);
    return this;
  }

  /**
   * Sorts this buffer in place according to a key function.
   */
  sortInPlaceBy<B>(f: (a: A) => B, implicit: (a: B, b: B) => number = (a, b) => (a as any) - (b as any)): this {
    this.elements.sort((a, b) => implicit(f(a), f(b)));
    return this;
  }

  /**
   * Appends an element to this buffer.
   */
  append(elem: A): this {
    this.elements.push(elem);
    return this;
  }

  /**
   * Appends all elements of a collection to this buffer.
   */
  appendAll<B extends A>(xs: Iterable<B>): this {
    for (const elem of xs) {
      this.elements.push(elem);
    }
    return this;
  }

  /**
   * Prepends an element to this buffer.
   */
  prepend(elem: A): this {
    this.elements.unshift(elem);
    return this;
  }

  /**
   * Prepends all elements of a collection to this buffer.
   */
  prependAll<B extends A>(xs: Iterable<B>): this {
    const newElements: A[] = [];
    for (const elem of xs) {
      newElements.push(elem);
    }
    this.elements = [...newElements, ...this.elements];
    return this;
  }

  /**
   * Inserts an element at a given index.
   */
  insert(idx: number, elem: A): this {
    if (idx < 0 || idx > this.elements.length) {
      throw new Error(`Index out of bounds: ${idx}`);
    }
    this.elements.splice(idx, 0, elem);
    return this;
  }

  /**
   * Inserts elements at a given index.
   */
  insertAll<B extends A>(idx: number, xs: Iterable<B>): this {
    if (idx < 0 || idx > this.elements.length) {
      throw new Error(`Index out of bounds: ${idx}`);
    }

    const toInsert: B[] = [];
    for (const elem of xs) {
      toInsert.push(elem);
    }

    this.elements.splice(idx, 0, ...toInsert);
    return this;
  }

  /**
   * Pads this buffer to a given length by appending a value.
   */
  padToInPlace(len: number, elem: A): this {
    while (this.elements.length < len) {
      this.elements.push(elem);
    }
    return this;
  }

  /**
   * Removes an element from this buffer.
   */
  subtractOne(elem: A): this {
    const idx = this.elements.findIndex(e => this.equals(e, elem));
    if (idx >= 0) {
      this.elements.splice(idx, 1);
    }
    return this;
  }

  /**
   * Removes all elements in a collection from this buffer.
   */
  subtractAll<B extends A>(xs: Iterable<B>): this {
    for (const elem of xs) {
      this.subtractOne(elem);
    }
    return this;
  }

  /**
   * Removes the element at a given index.
   */
  remove(idx: number, count: number = 1): A {
    if (idx < 0 || idx >= this.elements.length) {
      throw new Error(`Index out of bounds: ${idx}`);
    }

    const removed = this.elements[idx];
    this.elements.splice(idx, count);
    return removed;
  }

  /**
   * Removes the first n elements.
   */
  trimStart(n: number): this {
    if (n > 0) {
      this.elements.splice(0, n);
    }
    return this;
  }

  /**
   * Removes the last n elements.
   */
  trimEnd(n: number): this {
    if (n > 0) {
      this.elements.splice(this.elements.length - n, n);
    }
    return this;
  }

  /**
   * Removes all elements from this buffer.
   */
  clear(): this {
    this.elements = [];
    return this;
  }

  /**
   * Replaces a slice of this buffer with another sequence.
   */
  patchInPlace<B extends A>(from: number, patch: Iterable<B>, replaced: number): this {
    if (from < 0) {
      throw new Error(`Index out of bounds: ${from}`);
    }

    const patchElements: B[] = [];
    for (const elem of patch) {
      patchElements.push(elem);
    }

    this.elements.splice(from, replaced, ...patchElements);
    return this;
  }

  /**
   * Returns a new buffer with the same elements as this buffer.
   */
  clone(): Buffer<A> {
    return new ArrayBuffer([...this.elements]);
  }

  /**
   * Returns a new sequence with an element prepended.
   */
  prepended(elem: A): Seq<A> {
    return new ArraySeq([elem, ...this.elements]);
  }

  /**
   * Returns a new sequence with elements prepended.
   */
  prependedAll<B>(prefix: Iterable<B>): Seq<A | B> {
    const newElements: (A | B)[] = [];
    for (const elem of prefix) {
      newElements.push(elem);
    }
    newElements.push(...this.elements);
    return new ArraySeq(newElements);
  }

  /**
   * Returns a new sequence with an element appended.
   */
  appended(elem: A): Seq<A> {
    return new ArraySeq([...this.elements, elem]);
  }

  /**
   * Returns a new sequence with elements appended.
   */
  appendedAll<B>(suffix: Iterable<B>): Seq<A | B> {
    const newElements = [...this.elements] as (A | B)[];
    for (const elem of suffix) {
      newElements.push(elem);
    }
    return new ArraySeq(newElements);
  }

  /**
   * Returns a new sequence with a slice of another sequence patched in.
   */
  patch<B>(from: number, patch: Seq<B>, replaced: number): Seq<A | B> {
    const before = this.elements.slice(0, from);
    const middle: B[] = [];
    for (const elem of patch) {
      middle.push(elem);
    }
    const after = this.elements.slice(from + replaced);

    return new ArraySeq([...before, ...middle, ...after]);
  }

  /**
   * Returns a new sequence with one element replaced.
   */
  updated(index: number, elem: A): Seq<A> {
    if (index < 0 || index >= this.elements.length) {
      throw new Error(`Index out of bounds: ${index}`);
    }

    const newElements = [...this.elements];
    newElements[index] = elem;
    return new ArraySeq(newElements);
  }

  /**
   * Helper method to create a sequence from an array.
   */
  protected fromArray(arr: A[]): Seq<A> {
    return new ArraySeq(arr);
  }
} 