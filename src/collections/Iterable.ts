import { Option, Some, None } from '../Option';
import { List as ScatsList } from '../List';
import { Set as ScatsSet } from '../Set';
import { Map as ScatsMap } from '../Map';

/**
 * Represents a collection of elements that can be iterated over.
 * This trait is the base for all collection types in the library.
 */
export interface Iterable<A> {
  /**
   * Returns an iterator that yields every element in the collection.
   */
  iterator(): Iterator<A>;

  /**
   * Implements the iterable protocol for for...of loops
   */
  [Symbol.iterator](): Iterator<A>;

  /**
   * Executes a function for each element in the collection.
   */
  forEach(f: (a: A) => void): void;

  /**
   * Returns a new collection containing the results of applying the given function
   * to each element of this collection.
   */
  map<B>(f: (a: A) => B): Iterable<B>;

  /**
   * Returns a new collection containing the results of applying the given collection-valued function
   * to each element of this collection and concatenating the results.
   */
  flatMap<B>(f: (a: A) => Iterable<B>): Iterable<B>;

  /**
   * Returns a new collection containing the results of applying the given partial function
   * to each element of this collection for which it is defined and collecting the results.
   */
  collect<B>(f: (a: A) => Option<B>): Iterable<B>;

  /**
   * Returns a new collection consisting of the elements of both this collection and the other collection.
   */
  concat(other: Iterable<A>): Iterable<A>;

  /**
   * Returns a new collection consisting of those elements of this collection that satisfy the predicate.
   */
  filter(p: (a: A) => boolean): Iterable<A>;

  /**
   * Returns a new collection consisting of those elements of this collection that do not satisfy the predicate.
   */
  filterNot(p: (a: A) => boolean): Iterable<A>;

  /**
   * Returns a non-strict filter of this collection.
   * Subsequent calls to map, flatMap, foreach, and withFilter will only apply to those elements
   * of this collection for which the condition p is true.
   */
  withFilter(p: (a: A) => boolean): Iterable<A>;

  /**
   * Returns the first element of this collection.
   * @throws Error if the collection is empty
   */
  head(): A;

  /**
   * Returns the first element of this collection in an option value, or None if the collection is empty.
   */
  headOption(): Option<A>;

  /**
   * Returns the last element of this collection.
   * @throws Error if the collection is empty
   */
  last(): A;

  /**
   * Returns the last element of this collection in an option value, or None if the collection is empty.
   */
  lastOption(): Option<A>;

  /**
   * Returns an option containing the first element in this collection that satisfies the predicate,
   * or None if no element qualifies.
   */
  find(p: (a: A) => boolean): Option<A>;

  /**
   * Returns the rest of the collection except the first element.
   * @throws Error if the collection is empty
   */
  tail(): Iterable<A>;

  /**
   * Returns the rest of the collection except the last element.
   * @throws Error if the collection is empty
   */
  init(): Iterable<A>;

  /**
   * Returns a collection consisting of elements in some index range of this collection.
   */
  slice(from: number, to: number): Iterable<A>;

  /**
   * Returns a collection consisting of the first n elements of this collection.
   */
  take(n: number): Iterable<A>;

  /**
   * Returns the rest of the collection except the first n elements.
   */
  drop(n: number): Iterable<A>;

  /**
   * Returns the longest prefix of elements in the collection that all satisfy the predicate.
   */
  takeWhile(p: (a: A) => boolean): Iterable<A>;

  /**
   * Returns the collection without the longest prefix of elements that all satisfy the predicate.
   */
  dropWhile(p: (a: A) => boolean): Iterable<A>;

  /**
   * Returns a collection consisting of the last n elements of this collection.
   */
  takeRight(n: number): Iterable<A>;

  /**
   * Returns the rest of the collection except the last n elements.
   */
  dropRight(n: number): Iterable<A>;

  /**
   * Split this collection at a position, giving the pair of collections (take n, drop n).
   */
  splitAt(n: number): [Iterable<A>, Iterable<A>];

  /**
   * Split this collection according to a predicate, giving the pair of collections
   * (takeWhile p, dropWhile p).
   */
  span(p: (a: A) => boolean): [Iterable<A>, Iterable<A>];

  /**
   * Split this collection into a pair of collections; one with elements that satisfy the predicate,
   * the other with elements that do not.
   */
  partition(p: (a: A) => boolean): [Iterable<A>, Iterable<A>];

  /**
   * Partition this collection into a map of collections according to a discriminator function.
   */
  groupBy<K>(f: (a: A) => K): globalThis.Map<K, Iterable<A>>;

  /**
   * Tests whether the predicate holds for all elements of this collection.
   */
  forall(p: (a: A) => boolean): boolean;

  /**
   * Tests whether the predicate holds for some element of this collection.
   */
  exists(p: (a: A) => boolean): boolean;

  /**
   * Returns the number of elements in this collection that satisfy the predicate.
   */
  count(p: (a: A) => boolean): number;

  /**
   * Apply binary operation op between successive elements of this collection,
   * going left to right and starting with z.
   */
  foldLeft<B>(z: B, op: (b: B, a: A) => B): B;

  /**
   * Apply binary operation op between successive elements of this collection,
   * going right to left and starting with z.
   */
  foldRight<B>(z: B, op: (a: A, b: B) => B): B;

  /**
   * Apply binary operation op between successive elements of non-empty collection,
   * going left to right.
   * @throws Error if the collection is empty
   */
  reduceLeft(op: (a: A, b: A) => A): A;

  /**
   * Apply binary operation op between successive elements of non-empty collection,
   * going right to left.
   * @throws Error if the collection is empty
   */
  reduceRight(op: (a: A, b: A) => A): A;

  /**
   * Returns the sum of the numeric element values of this collection.
   * @throws Error if the collection is empty or contains non-numeric values
   */
  sum(): number;

  /**
   * Returns the product of the numeric element values of this collection.
   * @throws Error if the collection is empty or contains non-numeric values
   */
  product(): number;

  /**
   * Returns the minimum of the ordered element values of this collection.
   * @throws Error if the collection is empty
   */
  min(): A;

  /**
   * Returns the maximum of the ordered element values of this collection.
   * @throws Error if the collection is empty
   */
  max(): A;

  /**
   * Like min but returns None if the collection is empty.
   */
  minOption(): Option<A>;

  /**
   * Like max but returns None if the collection is empty.
   */
  maxOption(): Option<A>;

  /**
   * Converts the collection to a string that shows all elements between separators
   * enclosed in strings start and end.
   */
  mkString(start?: string, sep?: string, end?: string): string;

  /**
   * Returns a collection of pairs of corresponding elements from this collection and the other collection.
   */
  zip<B>(other: Iterable<B>): Iterable<[A, B]>;

  /**
   * Returns a collection of pairs of corresponding elements from this collection and the other collection,
   * where the shorter sequence is extended to match the longer one by appending elements x or y.
   */
  zipAll<B>(other: Iterable<B>, thisElem: A, thatElem: B): Iterable<[A, B]>;

  /**
   * Returns a collection of pairs of elements from this collection with their indices.
   */
  zipWithIndex(): Iterable<[A, number]>;

  /**
   * Tests whether the collection is empty.
   */
  isEmpty(): boolean;

  /**
   * Tests whether the collection contains elements.
   */
  nonEmpty(): boolean;

  /**
   * Returns the number of elements in the collection.
   */
  size(): number;

  /**
   * Returns the number of elements, if this one takes constant time to compute, otherwise -1.
   */
  knownSize(): number;

  /**
   * Returns a negative value if this collection is shorter than the other collection,
   * a positive value if it is longer, and 0 if they have the same size.
   * 
   * Can also be called with a number to compare the collection size with that number.
   */
  sizeCompare(other: Iterable<any> | number): number;

  /**
   * Returns an iterator that yields fixed-sized "chunks" of this collection.
   */
  grouped(size: number): Iterator<Iterable<A>> & Iterable<Iterable<A>>;

  /**
   * Returns an iterator that yields a sliding fixed-sized window of elements in this collection.
   */
  sliding(size: number): Iterator<Iterable<A>> & Iterable<Iterable<A>>;

  /**
   * Converts the collection to an array.
   */
  toArray(): A[];

  /**
   * Converts the collection to a list.
   */
  toList(): ScatsList<A>;

  /**
   * Converts the collection to a set.
   */
  toSet(): ScatsSet<A>;

  /**
   * Converts the collection to a map.
   * @throws Error if the collection does not have pairs as elements
   */
  toMap<K, V>(): ScatsMap<K, V>;
}

/**
 * Abstract base class implementing the Iterable trait.
 * This provides default implementations for many methods based on the iterator method.
 */
export abstract class AbstractIterable<A> implements Iterable<A> {
  abstract iterator(): Iterator<A>;

  [Symbol.iterator](): Iterator<A> {
    return this.iterator();
  }

  forEach(f: (a: A) => void): void {
    for (const a of this) {
      f(a);
    }
  }

  map<B>(f: (a: A) => B): Iterable<B> {
    return new MappedIterable(this, f);
  }

  flatMap<B>(f: (a: A) => Iterable<B>): Iterable<B> {
    return new FlatMappedIterable(this, f);
  }

  collect<B>(f: (a: A) => Option<B>): Iterable<B> {
    return new CollectedIterable(this, f);
  }

  concat(other: Iterable<A>): Iterable<A> {
    return new ConcatenatedIterable(this, other);
  }

  filter(p: (a: A) => boolean): Iterable<A> {
    return new FilteredIterable(this, p);
  }

  filterNot(p: (a: A) => boolean): Iterable<A> {
    return this.filter(a => !p(a));
  }

  withFilter(p: (a: A) => boolean): Iterable<A> {
    return this.filter(p);
  }

  head(): A {
    const iterator = this.iterator();
    const result = iterator.next();
    if (result.done) {
      throw new Error("Collection is empty");
    }
    return result.value;
  }

  headOption(): Option<A> {
    const iterator = this.iterator();
    const result = iterator.next();
    return result.done ? None : Some(result.value);
  }

  last(): A {
    let last: A | undefined;
    let hasElements = false;

    for (const a of this) {
      last = a;
      hasElements = true;
    }

    if (!hasElements) {
      throw new Error("Collection is empty");
    }

    return last as A;
  }

  lastOption(): Option<A> {
    let last: A | undefined;
    let hasElements = false;

    for (const a of this) {
      last = a;
      hasElements = true;
    }

    return hasElements ? Some(last as A) : None;
  }

  find(p: (a: A) => boolean): Option<A> {
    for (const a of this) {
      if (p(a)) {
        return Some(a);
      }
    }
    return None;
  }

  tail(): Iterable<A> {
    const iterator = this.iterator();
    const result = iterator.next();
    if (result.done) {
      throw new Error("Collection is empty");
    }
    return new TailIterable(this);
  }

  init(): Iterable<A> {
    if (this.isEmpty()) {
      throw new Error("Collection is empty");
    }
    return new InitIterable(this);
  }

  slice(from: number, to: number): Iterable<A> {
    return new SlicedIterable(this, from, to);
  }

  take(n: number): Iterable<A> {
    return new TakenIterable(this, n);
  }

  drop(n: number): Iterable<A> {
    return new DroppedIterable(this, n);
  }

  takeWhile(p: (a: A) => boolean): Iterable<A> {
    return new TakeWhileIterable(this, p);
  }

  dropWhile(p: (a: A) => boolean): Iterable<A> {
    return new DropWhileIterable(this, p);
  }

  takeRight(n: number): Iterable<A> {
    return new TakeRightIterable(this, n);
  }

  dropRight(n: number): Iterable<A> {
    return new DropRightIterable(this, n);
  }

  splitAt(n: number): [Iterable<A>, Iterable<A>] {
    return [this.take(n), this.drop(n)];
  }

  span(p: (a: A) => boolean): [Iterable<A>, Iterable<A>] {
    return [this.takeWhile(p), this.dropWhile(p)];
  }

  partition(p: (a: A) => boolean): [Iterable<A>, Iterable<A>] {
    return [this.filter(p), this.filterNot(p)];
  }

  groupBy<K>(f: (a: A) => K): globalThis.Map<K, Iterable<A>> {
    const map = new globalThis.Map<K, A[]>();

    for (const a of this) {
      const key = f(a);
      const group = map.get(key) || [];
      group.push(a);
      map.set(key, group);
    }

    const result = new globalThis.Map<K, Iterable<A>>();
    for (const [key, values] of map.entries()) {
      result.set(key, new ArrayIterable(values));
    }

    return result;
  }

  forall(p: (a: A) => boolean): boolean {
    for (const a of this) {
      if (!p(a)) {
        return false;
      }
    }
    return true;
  }

  exists(p: (a: A) => boolean): boolean {
    for (const a of this) {
      if (p(a)) {
        return true;
      }
    }
    return false;
  }

  count(p: (a: A) => boolean): number {
    let count = 0;
    for (const a of this) {
      if (p(a)) {
        count++;
      }
    }
    return count;
  }

  foldLeft<B>(z: B, op: (b: B, a: A) => B): B {
    let result = z;
    for (const a of this) {
      result = op(result, a);
    }
    return result;
  }

  foldRight<B>(z: B, op: (a: A, b: B) => B): B {
    const array = this.toArray();
    let result = z;
    for (let i = array.length - 1; i >= 0; i--) {
      result = op(array[i], result);
    }
    return result;
  }

  reduceLeft(op: (a: A, b: A) => A): A {
    const iterator = this.iterator();
    const first = iterator.next();
    if (first.done) {
      throw new Error("Collection is empty");
    }

    let result = first.value;
    let hasStarted = false;

    for (const a of this) {
      if (!hasStarted) {
        hasStarted = true;
        continue; // Skip the first element since we already used it
      }
      result = op(result, a);
    }
    return result;
  }

  reduceRight(op: (a: A, b: A) => A): A {
    const array = this.toArray();
    if (array.length === 0) {
      throw new Error("Collection is empty");
    }

    let result = array[array.length - 1];
    for (let i = array.length - 2; i >= 0; i--) {
      result = op(array[i], result);
    }
    return result;
  }

  sum(): number {
    return this.foldLeft(0, (sum, a) => {
      if (typeof a !== 'number') {
        throw new Error("Collection contains non-numeric values");
      }
      return sum + a;
    });
  }

  product(): number {
    return this.foldLeft(1, (prod, a) => {
      if (typeof a !== 'number') {
        throw new Error("Collection contains non-numeric values");
      }
      return prod * a;
    });
  }

  min(): A {
    if (this.isEmpty()) {
      throw new Error("Collection is empty");
    }

    let min: A | undefined;
    let first = true;

    for (const a of this) {
      if (first || (a as any) < (min as any)) {
        min = a;
        first = false;
      }
    }

    return min as A;
  }

  max(): A {
    if (this.isEmpty()) {
      throw new Error("Collection is empty");
    }

    let max: A | undefined;
    let first = true;

    for (const a of this) {
      if (first || (a as any) > (max as any)) {
        max = a;
        first = false;
      }
    }

    return max as A;
  }

  minOption(): Option<A> {
    if (this.isEmpty()) {
      return None;
    }
    return Some(this.min());
  }

  maxOption(): Option<A> {
    if (this.isEmpty()) {
      return None;
    }
    return Some(this.max());
  }

  mkString(start: string = "", sep: string = "", end: string = ""): string {
    const elements = this.toArray();
    return start + elements.join(sep) + end;
  }

  zip<B>(other: Iterable<B>): Iterable<[A, B]> {
    return new ZippedIterable(this, other);
  }

  zipAll<B>(other: Iterable<B>, thisElem: A, thatElem: B): Iterable<[A, B]> {
    return new ZipAllIterable(this, other, thisElem, thatElem);
  }

  zipWithIndex(): Iterable<[A, number]> {
    return new ZipWithIndexIterable(this);
  }

  isEmpty(): boolean {
    const result = this.iterator().next();
    return !!result.done;
  }

  nonEmpty(): boolean {
    return !this.isEmpty();
  }

  size(): number {
    let count = 0;
    for (const _ of this) {
      count++;
    }
    return count;
  }

  knownSize(): number {
    return -1; // Default implementation doesn't know the size
  }

  sizeCompare(other: Iterable<any> | number): number {
    const thisSize = this.size();

    if (typeof other === 'number') {
      return thisSize - other;
    } else {
      const otherSize = other.size();
      return thisSize - otherSize;
    }
  }

  grouped(size: number): Iterator<Iterable<A>> & Iterable<Iterable<A>> {
    return new GroupedIterator(this, size);
  }

  sliding(size: number): Iterator<Iterable<A>> & Iterable<Iterable<A>> {
    return new SlidingIterator(this, size);
  }

  toArray(): A[] {
    const result: A[] = [];
    for (const a of this) {
      result.push(a);
    }
    return result;
  }

  toList(): ScatsList<A> {
    return ScatsList.of(...this.toArray());
  }

  toSet(): ScatsSet<A> {
    return ScatsSet.of(...this.toArray());
  }

  toMap<K, V>(): ScatsMap<K, V> {
    const entries: Array<[K, V]> = [];
    for (const a of this) {
      if (!Array.isArray(a) || a.length !== 2) {
        throw new Error("Collection does not have pairs as elements");
      }
      entries.push([a[0] as K, a[1] as V]);
    }
    return ScatsMap.of(entries);
  }
}

// Implementation classes for various operations

class MappedIterable<A, B> extends AbstractIterable<B> {
  constructor(private source: Iterable<A>, private f: (a: A) => B) {
    super();
  }

  iterator(): Iterator<B> {
    const sourceIterator = this.source.iterator();
    return {
      next: () => {
        const result = sourceIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: this.f(result.value) };
      }
    };
  }
}

class FlatMappedIterable<A, B> extends AbstractIterable<B> {
  constructor(private source: Iterable<A>, private f: (a: A) => Iterable<B>) {
    super();
  }

  iterator(): Iterator<B> {
    const sourceIterator = this.source.iterator();
    let currentIterator: Iterator<B> | null = null;

    return {
      next: () => {
        // Loop until we find a value or reach the end
        while (true) {
          if (currentIterator === null) {
            const sourceResult = sourceIterator.next();
            if (sourceResult.done) {
              return { done: true, value: undefined as any };
            }
            currentIterator = this.f(sourceResult.value).iterator();
          }

          const result = currentIterator.next();
          if (result.done) {
            currentIterator = null;
            continue;
          }

          return { done: false, value: result.value };
        }

        // This line is never reached but satisfies TypeScript
        return { done: true, value: undefined as any };
      }
    };
  }
}

class CollectedIterable<A, B> extends AbstractIterable<B> {
  constructor(private source: Iterable<A>, private f: (a: A) => Option<B>) {
    super();
  }

  iterator(): Iterator<B> {
    const sourceIterator = this.source.iterator();

    return {
      next: () => {
        // Loop until we find a value or reach the end
        while (true) {
          const sourceResult = sourceIterator.next();
          if (sourceResult.done) {
            return { done: true, value: undefined as any };
          }

          const option = this.f(sourceResult.value);
          if (option.isSome) {
            return { done: false, value: option.get() };
          }
        }

        // This line is never reached but satisfies TypeScript
        return { done: true, value: undefined as any };
      }
    };
  }
}

class ConcatenatedIterable<A> extends AbstractIterable<A> {
  constructor(private first: Iterable<A>, private second: Iterable<A>) {
    super();
  }

  iterator(): Iterator<A> {
    const firstIterator = this.first.iterator();
    const secondIterator = this.second.iterator();
    let firstDone = false;

    return {
      next: () => {
        if (!firstDone) {
          const result = firstIterator.next();
          if (!result.done) {
            return { done: false, value: result.value };
          }
          firstDone = true;
        }

        const result = secondIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: result.value };
      }
    };
  }
}

class FilteredIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private p: (a: A) => boolean) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();

    return {
      next: () => {
        // Loop until we find a value or reach the end
        while (true) {
          const result = sourceIterator.next();
          if (result.done) {
            return { done: true, value: undefined as any };
          }

          if (this.p(result.value)) {
            return { done: false, value: result.value };
          }
        }

        // This line is never reached but satisfies TypeScript
        return { done: true, value: undefined as any };
      }
    };
  }
}

class TailIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();
    const first = sourceIterator.next();
    if (first.done) {
      throw new Error("Collection is empty");
    }

    return {
      next: () => {
        const result = sourceIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: result.value };
      }
    };
  }
}

class InitIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>) {
    super();
  }

  iterator(): Iterator<A> {
    const array = this.source.toArray();
    if (array.length === 0) {
      throw new Error("Collection is empty");
    }

    let index = 0;
    return {
      next: () => {
        if (index >= array.length - 1) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: array[index++] };
      }
    };
  }
}

class SlicedIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private from: number, private to: number) {
    super();
  }

  iterator(): Iterator<A> {
    const array = this.source.toArray();
    const start = Math.max(0, this.from);
    const end = Math.min(array.length, this.to);
    let index = start;

    return {
      next: () => {
        if (index >= end) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: array[index++] };
      }
    };
  }
}

class TakenIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private n: number) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();
    let count = 0;

    return {
      next: () => {
        if (count >= this.n) {
          return { done: true, value: undefined as any };
        }

        const result = sourceIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }

        count++;
        return { done: false, value: result.value };
      }
    };
  }
}

class DroppedIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private n: number) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();
    let count = 0;

    return {
      next: () => {
        while (count < this.n) {
          const result = sourceIterator.next();
          if (result.done) {
            return { done: true, value: undefined as any };
          }
          count++;
        }

        const result = sourceIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: result.value };
      }
    };
  }
}

class TakeWhileIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private p: (a: A) => boolean) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();
    let done = false;

    return {
      next: () => {
        if (done) {
          return { done: true, value: undefined as any };
        }

        const result = sourceIterator.next();
        if (result.done) {
          done = true;
          return { done: true, value: undefined as any };
        }

        if (!this.p(result.value)) {
          done = true;
          return { done: true, value: undefined as any };
        }

        return { done: false, value: result.value };
      }
    };
  }
}

class DropWhileIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private p: (a: A) => boolean) {
    super();
  }

  iterator(): Iterator<A> {
    const sourceIterator = this.source.iterator();
    let found = false;

    return {
      next: () => {
        if (found) {
          const result = sourceIterator.next();
          if (result.done) {
            return { done: true, value: undefined as any };
          }
          return { done: false, value: result.value };
        }

        // Loop until we find a value or reach the end
        while (true) {
          const result = sourceIterator.next();
          if (result.done) {
            return { done: true, value: undefined as any };
          }

          if (!this.p(result.value)) {
            found = true;
            return { done: false, value: result.value };
          }
        }

        // This line is never reached but satisfies TypeScript
        return { done: true, value: undefined as any };
      }
    };
  }
}

class TakeRightIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private n: number) {
    super();
  }

  iterator(): Iterator<A> {
    const array = this.source.toArray();
    const start = Math.max(0, array.length - this.n);
    let index = start;

    return {
      next: () => {
        if (index >= array.length) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: array[index++] };
      }
    };
  }
}

class DropRightIterable<A> extends AbstractIterable<A> {
  constructor(private source: Iterable<A>, private n: number) {
    super();
  }

  iterator(): Iterator<A> {
    const array = this.source.toArray();
    const end = Math.max(0, array.length - this.n);
    let index = 0;

    return {
      next: () => {
        if (index >= end) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: array[index++] };
      }
    };
  }
}

class ZippedIterable<A, B> extends AbstractIterable<[A, B]> {
  constructor(private first: Iterable<A>, private second: Iterable<B>) {
    super();
  }

  iterator(): Iterator<[A, B]> {
    const firstIterator = this.first.iterator();
    const secondIterator = this.second.iterator();

    return {
      next: () => {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done || secondResult.done) {
          return { done: true, value: undefined as any };
        }

        return { done: false, value: [firstResult.value, secondResult.value] };
      }
    };
  }
}

class ZipAllIterable<A, B> extends AbstractIterable<[A, B]> {
  constructor(
    private first: Iterable<A>,
    private second: Iterable<B>,
    private thisElem: A,
    private thatElem: B
  ) {
    super();
  }

  iterator(): Iterator<[A, B]> {
    const firstIterator = this.first.iterator();
    const secondIterator = this.second.iterator();
    let firstDone = false;
    let secondDone = false;

    return {
      next: () => {
        const firstResult = firstIterator.next();
        const secondResult = secondIterator.next();

        if (firstResult.done) {
          firstDone = true;
        }

        if (secondResult.done) {
          secondDone = true;
        }

        if (firstDone && secondDone) {
          return { done: true, value: undefined as any };
        }

        const a = firstDone ? this.thisElem : firstResult.value;
        const b = secondDone ? this.thatElem : secondResult.value;

        return { done: false, value: [a, b] };
      }
    };
  }
}

class ZipWithIndexIterable<A> extends AbstractIterable<[A, number]> {
  constructor(private source: Iterable<A>) {
    super();
  }

  iterator(): Iterator<[A, number]> {
    const sourceIterator = this.source.iterator();
    let index = 0;

    return {
      next: () => {
        const result = sourceIterator.next();
        if (result.done) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: [result.value, index++] };
      }
    };
  }
}

class GroupedIterator<A> extends AbstractIterable<Iterable<A>> implements Iterator<Iterable<A>> {
  private sourceIterator: Iterator<A>;
  private buffer: A[] = [];
  private isDone = false;
  private chunkSize: number;

  constructor(source: Iterable<A>, chunkSize: number) {
    super();
    this.sourceIterator = source.iterator();
    this.chunkSize = chunkSize;
  }

  iterator(): Iterator<Iterable<A>> {
    return this;
  }

  next(): IteratorResult<Iterable<A>> {
    if (this.isDone) {
      return { done: true, value: undefined as any };
    }

    this.buffer = [];
    for (let i = 0; i < this.chunkSize; i++) {
      const result = this.sourceIterator.next();
      if (result.done) {
        this.isDone = true;
        break;
      }
      this.buffer.push(result.value);
    }

    if (this.buffer.length === 0) {
      return { done: true, value: undefined as any };
    }

    return { done: false, value: new ArrayIterable(this.buffer) };
  }
}

class SlidingIterator<A> extends AbstractIterable<Iterable<A>> implements Iterator<Iterable<A>> {
  private sourceArray: A[];
  private index = 0;
  private windowSize: number;

  constructor(source: Iterable<A>, windowSize: number) {
    super();
    this.sourceArray = source.toArray();
    this.windowSize = windowSize;
  }

  iterator(): Iterator<Iterable<A>> {
    return this;
  }

  next(): IteratorResult<Iterable<A>> {
    if (this.index + this.windowSize > this.sourceArray.length) {
      return { done: true, value: undefined as any };
    }

    const result = new ArrayIterable(this.sourceArray.slice(this.index, this.index + this.windowSize));
    this.index++;
    return { done: false, value: result };
  }
}

class ArrayIterable<A> extends AbstractIterable<A> {
  constructor(private array: A[]) {
    super();
  }

  iterator(): Iterator<A> {
    let index = 0;
    return {
      next: () => {
        if (index >= this.array.length) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: this.array[index++] };
      }
    };
  }

  knownSize(): number {
    return this.array.length;
  }
}
