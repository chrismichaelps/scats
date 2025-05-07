/**
 * Implementation of Scala-like Vector, an efficient immutable indexed sequence.
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
 * The number of bits used per level of the Vector trie.
 */
const BITS = 5;

/**
 * The branching factor of the Vector trie (2^BITS).
 */
const WIDTH = 1 << BITS;

/**
 * The mask used to extract the index at a particular level.
 */
const MASK = WIDTH - 1;

/**
 * A node in the Vector trie.
 */
class Node<A> {
  constructor(readonly array: Array<A | Node<A>>) { }
}

/**
 * Vector is an immutable, indexed sequence optimized for fast random access
 * and updates. It provides constant-time access to any element and good performance
 * for most operations.
 */
export class Vector<A> {

  /**
   * The root node of the Vector trie.
   */
  private readonly root: Node<A>;

  /**
   * The tail of the Vector, containing the last elements.
   */
  private readonly tail: A[];

  /**
   * The depth of the trie.
   */
  private readonly depth: number;

  /**
   * The number of elements in the Vector.
   */
  private readonly _size: number;

  /**
   * Creates a new Vector with the given root, tail, depth, and size.
   */
  private constructor(root: Node<A>, tail: A[], depth: number, size: number) {
    this.root = root;
    this.tail = tail;
    this.depth = depth;
    this._size = size;
  }

  /**
   * Returns the number of elements in this Vector.
   */
  size(): number {
    return this._size;
  }

  /**
   * Returns whether this Vector is empty.
   */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * Returns the element at the specified index.
   * @throws Error if the index is out of bounds
   */
  apply(index: number): A {
    if (index < 0 || index >= this._size) {
      throw new Error(`Index out of bounds: ${index}`);
    }

    // Check if the index is in the tail
    const tailOffset = this._size - this.tail.length;
    if (index >= tailOffset) {
      return this.tail[index - tailOffset];
    }

    // Navigate through the trie to find the element
    return this.getElem(this.root, index, this.depth);
  }

  /**
   * Recursive helper to get an element from the trie.
   */
  private getElem(node: Node<A>, index: number, level: number): A {
    if (level === 0) {
      return node.array[index & MASK] as A;
    } else {
      const subIndex = (index >> (level * BITS)) & MASK;
      return this.getElem(node.array[subIndex] as Node<A>, index, level - 1);
    }
  }

  /**
   * Returns the element at the specified index, or None if the index is out of bounds.
   */
  get(index: number): Option<A> {
    if (index < 0 || index >= this._size) {
      return None;
    }
    return Some(this.apply(index));
  }

  /**
   * Returns a new Vector with the element at the specified index updated.
   * If the index is out of bounds, returns this Vector unchanged.
   */
  updated(index: number, elem: A): Vector<A> {
    if (index < 0 || index >= this._size) {
      return this;
    }

    // Check if the index is in the tail
    const tailOffset = this._size - this.tail.length;
    if (index >= tailOffset) {
      const newTail = [...this.tail];
      newTail[index - tailOffset] = elem;
      return new Vector<A>(this.root, newTail, this.depth, this._size);
    }

    // Update the element in the trie
    const newRoot = this.updateElem(this.root, index, elem, this.depth);
    return new Vector<A>(newRoot, this.tail, this.depth, this._size);
  }

  /**
   * Recursive helper to update an element in the trie.
   */
  private updateElem(node: Node<A>, index: number, elem: A, level: number): Node<A> {
    const newArray = [...node.array];

    if (level === 0) {
      newArray[index & MASK] = elem;
    } else {
      const subIndex = (index >> (level * BITS)) & MASK;
      newArray[subIndex] = this.updateElem(node.array[subIndex] as Node<A>, index, elem, level - 1);
    }

    return new Node<A>(newArray);
  }

  /**
   * Returns a new Vector with the specified element appended.
   */
  appended(elem: A): Vector<A> {
    // If the tail isn't full, just append to the tail
    if (this.tail.length < WIDTH) {
      return new Vector<A>(this.root, [...this.tail, elem], this.depth, this._size + 1);
    }

    // The tail is full, we need to push it into the trie
    let newRoot = this.root;
    let newDepth = this.depth;

    // Calculate the index where the new tail will go
    const tailIndex = this._size - WIDTH;

    // Check if we need to increase the trie's depth
    if ((tailIndex >>> (BITS * this.depth)) > 0) {
      newRoot = new Node<A>([this.root]);
      newDepth = this.depth + 1;
    }

    // Push the current tail into the trie
    newRoot = this.pushTail(newRoot, tailIndex, new Node<A>(this.tail), newDepth);

    // Create a new tail with just the new element
    return new Vector<A>(newRoot, [elem], newDepth, this._size + 1);
  }

  /**
   * Recursive helper to push a tail node into the trie.
   */
  private pushTail(node: Node<A>, index: number, tailNode: Node<A>, level: number): Node<A> {
    const subIndex = (index >> (level * BITS)) & MASK;
    const newArray = [...node.array];

    if (level === 1) {
      newArray[subIndex] = tailNode;
    } else {
      const child = subIndex < node.array.length
        ? node.array[subIndex] as Node<A>
        : new Node<A>([]);

      newArray[subIndex] = this.pushTail(child, index, tailNode, level - 1);
    }

    return new Node<A>(newArray);
  }

  /**
   * Returns a new Vector with the specified element prepended.
   */
  prepended(elem: A): Vector<A> {
    // Special case for empty Vector
    if (this.isEmpty()) {
      return Vector.of(elem);
    }

    // If tail is full, we need to create a new Vector with the new element as the first element
    if (this.tail.length === WIDTH) {
      return Vector.of(elem).appendAll(this);
    }

    // Otherwise, we can move the first element of the trie to the end of the tail
    // and prepend the new element
    const tailOffset = this._size - this.tail.length;
    if (tailOffset === 0) {
      // No trie, just a tail
      return new Vector<A>(this.root, [elem, ...this.tail], this.depth, this._size + 1);
    }

    // Get the first element from the trie
    const first = this.apply(0);

    // Create a new trie without the first element
    const newRoot = this.removeFirst(this.root, this.depth);

    // Create a new tail with the first element of the old trie at the end
    return new Vector<A>(newRoot, [elem, ...this.tail], this.depth, this._size + 1);
  }

  /**
   * Recursive helper to remove the first element from the trie.
   */
  private removeFirst(node: Node<A>, level: number): Node<A> {
    if (level === 0) {
      const newArray = [...node.array];
      newArray.shift();
      return new Node<A>(newArray);
    } else {
      const newArray = [...node.array];
      newArray[0] = this.removeFirst(node.array[0] as Node<A>, level - 1);
      return new Node<A>(newArray);
    }
  }

  /**
   * Returns a new Vector with all elements of the specified Vector appended.
   */
  appendAll<B>(that: Vector<B>): Vector<A | B> {
    if (that.isEmpty()) {
      return this as unknown as Vector<A | B>;
    }
    if (this.isEmpty()) {
      return that as unknown as Vector<A | B>;
    }

    // Append each element of that Vector to this Vector
    let result: Vector<A | B> = this as unknown as Vector<A | B>;
    for (let i = 0; i < that.size(); i++) {
      result = result.appended(that.apply(i));
    }

    return result;
  }

  /**
   * Maps each element of this Vector using the provided function.
   */
  map<B>(f: (a: A) => B): Vector<B> {
    const newTail = this.tail.map(f);

    // If there's no trie, we can just map the tail
    if (this._size === this.tail.length) {
      return new Vector<B>(new Node<B>([]), newTail, 0, this._size);
    }

    // Map the trie
    const newRoot = this.mapNode(this.root, f, this.depth);
    return new Vector<B>(newRoot, newTail, this.depth, this._size);
  }

  /**
   * Recursive helper to map a node in the trie.
   */
  private mapNode<B>(node: Node<A>, f: (a: A) => B, level: number): Node<B> {
    if (level === 0) {
      return new Node<B>(node.array.map(a => f(a as A)));
    } else {
      return new Node<B>(node.array.map(child =>
        child ? this.mapNode(child as Node<A>, f, level - 1) : null
      ));
    }
  }

  /**
   * Applies the given function to each element and concatenates the results.
   */
  flatMap<B>(f: (a: A) => Vector<B>): Vector<B> {
    if (this.isEmpty()) {
      return Vector.empty<B>();
    }

    let result = Vector.empty<B>();
    for (let i = 0; i < this._size; i++) {
      result = result.appendAll(f(this.apply(i)));
    }

    return result;
  }

  /**
   * Filters elements of this Vector using the provided predicate.
   */
  filter(p: (a: A) => boolean): Vector<A> {
    if (this.isEmpty()) {
      return this;
    }

    let result = Vector.empty<A>();
    for (let i = 0; i < this._size; i++) {
      const elem = this.apply(i);
      if (p(elem)) {
        result = result.appended(elem);
      }
    }

    return result;
  }

  /**
   * Converts this Vector to an array.
   */
  toArray(): A[] {
    const result: A[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.apply(i));
    }
    return result;
  }

  /**
   * Creates a Vector containing the given elements.
   */
  static of<A>(...elements: A[]): Vector<A> {
    if (elements.length === 0) {
      return Vector.empty<A>();
    }

    // If there are fewer elements than WIDTH, we can just use a tail
    if (elements.length <= WIDTH) {
      return new Vector<A>(new Node<A>([]), elements, 0, elements.length);
    }

    // Otherwise, we need to build a trie
    let vector = Vector.empty<A>();
    for (const elem of elements) {
      vector = vector.appended(elem);
    }

    return vector;
  }

  /**
   * Creates an empty Vector.
   */
  static empty<A>(): Vector<A> {
    return new Vector<A>(new Node<A>([]), [], 0, 0);
  }

  /**
   * Creates a Vector from an array.
   */
  static from<A>(array: A[]): Vector<A> {
    return Vector.of(...array);
  }
}

// Default export
export default Vector; 