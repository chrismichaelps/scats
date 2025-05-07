/**
 * Set<A> represents an immutable set of unique values.
 * It's a collection of unique elements with efficient add, remove, and contains operations.
 * 
 * @example
 * ```ts
 * import { Set } from 'scats';
 * 
 * // Creating sets
 * const a = Set.of(1, 2, 3);
 * const b = Set.empty<number>();
 * const c = a.add(4);
 * 
 * // Using sets
 * const union = a.union(Set.of(3, 4, 5)); // Set(1, 2, 3, 4, 5)
 * const intersection = a.intersection(Set.of(2, 3, 4)); // Set(2, 3)
 * const difference = a.difference(Set.of(2, 3)); // Set(1)
 * ```
 */

import { List } from './List';

/**
 * Set<A> interface that all Set implementations must satisfy
 */
export interface Set<A> {
  /**
   * Returns true if this set is empty, false otherwise
   */
  readonly isEmpty: boolean;

  /**
   * Returns the number of elements in this set
   */
  readonly size: number;

  /**
   * Returns the elements in this set
   */
  readonly values: List<A>;

  /**
   * Returns true if this set contains the specified element, false otherwise
   */
  contains(element: A): boolean;

  /**
   * Returns a new set with the specified element added
   */
  add(element: A): Set<A>;

  /**
   * Returns a new set with the specified elements added
   */
  addAll(elements: Iterable<A>): Set<A>;

  /**
   * Returns a new set with the specified element removed
   */
  remove(element: A): Set<A>;

  /**
   * Returns a new set with the specified elements removed
   */
  removeAll(elements: Iterable<A>): Set<A>;

  /**
   * Returns a new set that is the union of this set and the specified set
   */
  union(that: Set<A>): Set<A>;

  /**
   * Returns a new set that is the intersection of this set and the specified set
   */
  intersection(that: Set<A>): Set<A>;

  /**
   * Returns a new set that is the difference of this set and the specified set
   */
  difference(that: Set<A>): Set<A>;

  /**
   * Returns true if this set is a subset of the specified set, false otherwise
   */
  isSubsetOf(that: Set<A>): boolean;

  /**
   * Returns true if this set is a proper subset of the specified set, false otherwise
   */
  isProperSubsetOf(that: Set<A>): boolean;

  /**
   * Returns true if this set is a superset of the specified set, false otherwise
   */
  isSupersetOf(that: Set<A>): boolean;

  /**
   * Returns true if this set is a proper superset of the specified set, false otherwise
   */
  isProperSupersetOf(that: Set<A>): boolean;

  /**
   * Returns a new set that is the result of applying the provided function to each element
   */
  map<B>(f: (a: A) => B): Set<B>;

  /**
   * Returns a new set containing only the elements that satisfy the provided predicate
   */
  filter(predicate: (a: A) => boolean): Set<A>;

  /**
   * Returns true if any element in this set satisfies the provided predicate, false otherwise
   */
  exists(predicate: (a: A) => boolean): boolean;

  /**
   * Returns true if all elements in this set satisfy the provided predicate, false otherwise
   */
  forAll(predicate: (a: A) => boolean): boolean;

  /**
   * Returns the result of applying the provided function to each element, starting with the provided initial value
   */
  foldLeft<B>(initial: B, f: (acc: B, a: A) => B): B;

  /**
   * Executes the provided function for each element in this set
   */
  forEach(f: (a: A) => void): void;

  /**
   * Partitions this set into two sets according to the provided predicate
   */
  partition(predicate: (a: A) => boolean): [Set<A>, Set<A>];

  /**
   * Converts this set to a native JavaScript Set
   */
  toNativeSet(): globalThis.Set<A>;

  /**
   * Converts this set to an array
   */
  toArray(): A[];

  /**
   * Returns a string representation of this set
   */
  toString(): string;
}

// Simple implementation that uses a JavaScript Set under the hood
// A production implementation might use a more efficient data structure
class SetImpl<A> implements Set<A> {
  // Using a native Set for internal storage
  private readonly _set: globalThis.Set<A>;

  constructor(elements?: Iterable<A>) {
    this._set = new globalThis.Set(elements);
  }

  get isEmpty(): boolean {
    return this._set.size === 0;
  }

  get size(): number {
    return this._set.size;
  }

  get values(): List<A> {
    return List.fromIterable(this._set.values());
  }

  contains(element: A): boolean {
    return this._set.has(element);
  }

  add(element: A): Set<A> {
    if (this._set.has(element)) {
      return this;
    }
    const newSet = new globalThis.Set(this._set);
    newSet.add(element);
    return new SetImpl(newSet);
  }

  addAll(elements: Iterable<A>): Set<A> {
    const newSet = new globalThis.Set(this._set);
    let changed = false;
    for (const element of elements) {
      if (!this._set.has(element)) {
        newSet.add(element);
        changed = true;
      }
    }
    return changed ? new SetImpl(newSet) : this;
  }

  remove(element: A): Set<A> {
    if (!this._set.has(element)) {
      return this;
    }
    const newSet = new globalThis.Set(this._set);
    newSet.delete(element);
    return new SetImpl(newSet);
  }

  removeAll(elements: Iterable<A>): Set<A> {
    const newSet = new globalThis.Set(this._set);
    let changed = false;
    for (const element of elements) {
      if (this._set.has(element)) {
        newSet.delete(element);
        changed = true;
      }
    }
    return changed ? new SetImpl(newSet) : this;
  }

  union(that: Set<A>): Set<A> {
    if (that.isEmpty) {
      return this;
    }
    if (this.isEmpty) {
      return that;
    }
    return this.addAll(that.toArray());
  }

  intersection(that: Set<A>): Set<A> {
    if (this.isEmpty || that.isEmpty) {
      return empty<A>();
    }

    const newSet = new globalThis.Set<A>();
    for (const element of this._set) {
      if (that.contains(element)) {
        newSet.add(element);
      }
    }
    return new SetImpl(newSet);
  }

  difference(that: Set<A>): Set<A> {
    if (this.isEmpty) {
      return empty<A>();
    }
    if (that.isEmpty) {
      return this;
    }
    return this.removeAll(that.toArray());
  }

  isSubsetOf(that: Set<A>): boolean {
    if (this.isEmpty) {
      return true;
    }
    if (this.size > that.size) {
      return false;
    }
    return this.forAll(element => that.contains(element));
  }

  isProperSubsetOf(that: Set<A>): boolean {
    return this.size < that.size && this.isSubsetOf(that);
  }

  isSupersetOf(that: Set<A>): boolean {
    return that.isSubsetOf(this);
  }

  isProperSupersetOf(that: Set<A>): boolean {
    return that.isProperSubsetOf(this);
  }

  map<B>(f: (a: A) => B): Set<B> {
    const newSet = new globalThis.Set<B>();
    this._set.forEach(element => {
      newSet.add(f(element));
    });
    return new SetImpl(newSet);
  }

  filter(predicate: (a: A) => boolean): Set<A> {
    const newSet = new globalThis.Set<A>();
    this._set.forEach(element => {
      if (predicate(element)) {
        newSet.add(element);
      }
    });
    return new SetImpl(newSet);
  }

  exists(predicate: (a: A) => boolean): boolean {
    for (const element of this._set) {
      if (predicate(element)) {
        return true;
      }
    }
    return false;
  }

  forAll(predicate: (a: A) => boolean): boolean {
    for (const element of this._set) {
      if (!predicate(element)) {
        return false;
      }
    }
    return true;
  }

  foldLeft<B>(initial: B, f: (acc: B, a: A) => B): B {
    let result = initial;
    this._set.forEach(element => {
      result = f(result, element);
    });
    return result;
  }

  forEach(f: (a: A) => void): void {
    this._set.forEach(element => {
      f(element);
    });
  }

  partition(predicate: (a: A) => boolean): [Set<A>, Set<A>] {
    const trueSet = new globalThis.Set<A>();
    const falseSet = new globalThis.Set<A>();
    this._set.forEach(element => {
      if (predicate(element)) {
        trueSet.add(element);
      } else {
        falseSet.add(element);
      }
    });
    return [new SetImpl(trueSet), new SetImpl(falseSet)];
  }

  toNativeSet(): globalThis.Set<A> {
    return new globalThis.Set(this._set);
  }

  toArray(): A[] {
    return Array.from(this._set);
  }

  toString(): string {
    if (this.isEmpty) {
      return "Set()";
    }
    return `Set(${this.toArray().join(", ")})`;
  }
}

/**
 * Creates an empty set
 */
export function empty<A>(): Set<A> {
  return new SetImpl<A>();
}

/**
 * Set namespace containing utility functions
 */
export namespace Set {
  /**
   * Creates a set containing the provided elements
   */
  export function of<A>(...elements: A[]): Set<A> {
    return new SetImpl(elements);
  }

  /**
   * Creates a set from the provided iterable
   */
  export function fromIterable<A>(iterable: Iterable<A>): Set<A> {
    return new SetImpl(iterable);
  }

  /**
   * Creates a set from a native JavaScript Set
   */
  export function fromNativeSet<A>(set: globalThis.Set<A>): Set<A> {
    return new SetImpl(set);
  }

  /**
   * Creates an empty set
   */
  export function empty<A>(): Set<A> {
    return new SetImpl<A>();
  }
} 