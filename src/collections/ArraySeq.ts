import { AbstractSeq } from './AbstractSeq';
import { IndexedSeq, Seq } from './Seq';
import { Iterable } from './Iterable';

/**
 * An implementation of IndexedSeq backed by an array.
 */
export class ArraySeq<A> extends AbstractSeq<A> implements IndexedSeq<A> {
  /**
   * Creates a new ArraySeq from the given elements.
   */
  constructor(private elements: A[]) {
    super();
  }

  /**
   * Creates a new ArraySeq from the given elements.
   */
  static of<A>(...elements: A[]): ArraySeq<A> {
    return new ArraySeq(elements);
  }

  /**
   * Creates a new ArraySeq from an iterable.
   */
  static from<A>(iterable: Iterable<A>): ArraySeq<A> {
    const elements: A[] = [];
    for (const elem of iterable) {
      elements.push(elem);
    }
    return new ArraySeq(elements);
  }

  /**
   * Creates an empty ArraySeq.
   */
  static empty<A>(): ArraySeq<A> {
    return new ArraySeq<A>([]);
  }

  /**
   * Returns an iterator over the elements of this sequence.
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
   * This is more efficient than the default implementation.
   */
  apply(i: number): A {
    if (i < 0 || i >= this.elements.length) {
      throw new Error(`Index out of bounds: ${i}`);
    }
    return this.elements[i];
  }

  /**
   * Returns the size of this sequence.
   * This is more efficient than the default implementation.
   */
  size(): number {
    return this.elements.length;
  }

  /**
   * Returns the known size of this sequence.
   * This is more efficient than the default implementation.
   */
  knownSize(): number {
    return this.elements.length;
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