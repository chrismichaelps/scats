/**
 * Map<K, V> represents an immutable key-value map.
 * It's implemented as a balanced binary search tree for efficient operations.
 * 
 * @example
 * ```ts
 * import { Map } from 'scats';
 * 
 * // Creating maps
 * const a = Map.of([["a", 1], ["b", 2], ["c", 3]]);
 * const b = Map.empty<string, number>();
 * const c = a.set("d", 4);
 * 
 * // Using maps
 * const value = a.get("a"); // Some(1)
 * const notFound = a.get("z"); // None
 * const updated = a.update("a", n => n * 2); // Map(["a", 2], ["b", 2], ["c", 3])
 * ```
 */

import { Option, Some, None } from './Option';
import { List } from './List';

/**
 * Map<K, V> interface that all Map implementations must satisfy
 */
export interface Map<K, V> {
  /**
   * Returns true if this map is empty, false otherwise
   */
  readonly isEmpty: boolean;

  /**
   * Returns the number of key-value pairs in this map
   */
  readonly size: number;

  /**
   * Returns the keys in this map
   */
  readonly keys: List<K>;

  /**
   * Returns the values in this map
   */
  readonly values: List<V>;

  /**
   * Returns the key-value pairs in this map
   */
  readonly entries: List<[K, V]>;

  /**
   * Returns the value associated with the specified key as an Option, or None if the key is not found
   */
  get(key: K): Option<V>;

  /**
   * Returns the value associated with the specified key, or the provided default value if the key is not found
   */
  getOrElse<U>(key: K, defaultValue: U): V | U;

  /**
   * Returns a new map with the specified key-value pair added or updated
   */
  set(key: K, value: V): Map<K, V>;

  /**
   * Returns a new map with the specified key-value pairs added or updated
   */
  setAll(entries: Iterable<[K, V]>): Map<K, V>;

  /**
   * Returns a new map with the specified key-value pair removed
   */
  remove(key: K): Map<K, V>;

  /**
   * Returns a new map with the specified keys removed
   */
  removeAll(keys: Iterable<K>): Map<K, V>;

  /**
   * Returns a new map with the value associated with the specified key updated by applying the provided function,
   * or the same map if the key is not found
   */
  update(key: K, f: (value: V) => V): Map<K, V>;

  /**
   * Returns a new map with the value associated with the specified key updated by applying the provided function,
   * or a new map with the specified key-value pair added if the key is not found
   */
  updateOrSet(key: K, f: (value: Option<V>) => V): Map<K, V>;

  /**
   * Returns a new map that is the result of merging this map with the specified map
   */
  merge(that: Map<K, V>): Map<K, V>;

  /**
   * Returns a new map that is the result of applying the provided function to each key-value pair
   */
  map<W>(f: (value: V, key: K) => W): Map<K, W>;

  /**
   * Returns a new map containing only the key-value pairs that satisfy the provided predicate
   */
  filter(predicate: (value: V, key: K) => boolean): Map<K, V>;

  /**
   * Returns true if any key-value pair in this map satisfies the provided predicate, false otherwise
   */
  exists(predicate: (value: V, key: K) => boolean): boolean;

  /**
   * Returns true if all key-value pairs in this map satisfy the provided predicate, false otherwise
   */
  forAll(predicate: (value: V, key: K) => boolean): boolean;

  /**
   * Returns the result of applying the provided function to each key-value pair, starting with the provided initial value
   */
  foldLeft<U>(initial: U, f: (acc: U, value: V, key: K) => U): U;

  /**
   * Executes the provided function for each key-value pair in this map
   */
  forEach(f: (value: V, key: K) => void): void;

  /**
   * Returns true if this map contains the specified key, false otherwise
   */
  has(key: K): boolean;

  /**
   * Returns a native JavaScript Map containing the same key-value pairs as this map
   */
  toNativeMap(): globalThis.Map<K, V>;

  /**
   * Returns a string representation of this map
   */
  toString(): string;
}

// Simple implementation that uses a JavaScript Map under the hood
// A production implementation would use a balanced tree like Red-Black Tree or AVL Tree
class MapImpl<K, V> implements Map<K, V> {
  // Using a native Map for internal storage
  private readonly _map: globalThis.Map<K, V>;

  constructor(entries?: Iterable<[K, V]>) {
    this._map = new globalThis.Map(entries);
  }

  get isEmpty(): boolean {
    return this._map.size === 0;
  }

  get size(): number {
    return this._map.size;
  }

  get keys(): List<K> {
    return List.fromIterable(this._map.keys());
  }

  get values(): List<V> {
    return List.fromIterable(this._map.values());
  }

  get entries(): List<[K, V]> {
    return List.fromIterable(this._map.entries());
  }

  get(key: K): Option<V> {
    return this._map.has(key) ? Some(this._map.get(key)!) : None;
  }

  getOrElse<U>(key: K, defaultValue: U): V | U {
    return this._map.has(key) ? this._map.get(key)! : defaultValue;
  }

  set(key: K, value: V): Map<K, V> {
    const newMap = new globalThis.Map(this._map);
    newMap.set(key, value);
    return new MapImpl(newMap);
  }

  setAll(entries: Iterable<[K, V]>): Map<K, V> {
    const newMap = new globalThis.Map(this._map);
    for (const [key, value] of entries) {
      newMap.set(key, value);
    }
    return new MapImpl(newMap);
  }

  remove(key: K): Map<K, V> {
    if (!this._map.has(key)) {
      return this;
    }
    const newMap = new globalThis.Map(this._map);
    newMap.delete(key);
    return new MapImpl(newMap);
  }

  removeAll(keys: Iterable<K>): Map<K, V> {
    const newMap = new globalThis.Map(this._map);
    for (const key of keys) {
      newMap.delete(key);
    }
    return new MapImpl(newMap);
  }

  update(key: K, f: (value: V) => V): Map<K, V> {
    if (!this._map.has(key)) {
      return this;
    }
    const newMap = new globalThis.Map(this._map);
    newMap.set(key, f(this._map.get(key)!));
    return new MapImpl(newMap);
  }

  updateOrSet(key: K, f: (value: Option<V>) => V): Map<K, V> {
    const newMap = new globalThis.Map(this._map);
    const currentValue = this._map.has(key) ? Some(this._map.get(key)!) : None;
    newMap.set(key, f(currentValue));
    return new MapImpl(newMap);
  }

  merge(that: Map<K, V>): Map<K, V> {
    return this.setAll(that.entries.toArray());
  }

  map<W>(f: (value: V, key: K) => W): Map<K, W> {
    const newEntries: [K, W][] = [];
    this._map.forEach((value, key) => {
      newEntries.push([key, f(value, key)]);
    });
    return new MapImpl(newEntries);
  }

  filter(predicate: (value: V, key: K) => boolean): Map<K, V> {
    const newEntries: [K, V][] = [];
    this._map.forEach((value, key) => {
      if (predicate(value, key)) {
        newEntries.push([key, value]);
      }
    });
    return new MapImpl(newEntries);
  }

  exists(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this._map.entries()) {
      if (predicate(value, key)) {
        return true;
      }
    }
    return false;
  }

  forAll(predicate: (value: V, key: K) => boolean): boolean {
    for (const [key, value] of this._map.entries()) {
      if (!predicate(value, key)) {
        return false;
      }
    }
    return true;
  }

  foldLeft<U>(initial: U, f: (acc: U, value: V, key: K) => U): U {
    let result = initial;
    this._map.forEach((value, key) => {
      result = f(result, value, key);
    });
    return result;
  }

  forEach(f: (value: V, key: K) => void): void {
    this._map.forEach((value, key) => {
      f(value, key);
    });
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  toNativeMap(): globalThis.Map<K, V> {
    return new globalThis.Map(this._map);
  }

  toString(): string {
    if (this.isEmpty) {
      return "Map()";
    }
    const entries = Array.from(this._map.entries())
      .map(([key, value]) => `[${String(key)}, ${String(value)}]`)
      .join(", ");
    return `Map(${entries})`;
  }
}

/**
 * Creates an empty map
 */
export function empty<K, V>(): Map<K, V> {
  return new MapImpl<K, V>();
}

/**
 * Map namespace containing utility functions
 */
export namespace Map {
  /**
   * Creates a map from the provided entries
   */
  export function of<K, V>(entries: Iterable<[K, V]>): Map<K, V> {
    return new MapImpl(entries);
  }

  /**
   * Creates a map from a list of key-value pairs
   */
  export function fromList<K, V>(entries: List<[K, V]>): Map<K, V> {
    return of(entries.toArray());
  }

  /**
   * Creates a map from a native JavaScript Map
   */
  export function fromNativeMap<K, V>(map: globalThis.Map<K, V>): Map<K, V> {
    return of(map.entries());
  }

  /**
   * Creates an empty map
   */
  export function empty<K, V>(): Map<K, V> {
    return new MapImpl<K, V>();
  }

  /**
   * Creates a map from a list of keys and a function that computes values
   */
  export function fromKeys<K, V>(keys: List<K>, f: (key: K) => V): Map<K, V> {
    return fromList(keys.map(key => [key, f(key)]));
  }

  /**
   * Creates a map from a list of values and a function that computes keys
   */
  export function fromValues<K, V>(values: List<V>, f: (value: V) => K): Map<K, V> {
    return fromList(values.map(value => [f(value), value]));
  }
} 