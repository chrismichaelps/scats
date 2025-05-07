/**
 * Implementation of Scala-like Ordering type class for comparison operations.
 * 
 * @example
 * ```ts
 * import { Ordering } from 'scats/ordering';
 * 
 * // Using built-in orderings
 * const numbers = [3, 1, 4, 1, 5, 9];
 * const sorted = numbers.sort(Ordering.number.compare);
 * 
 * // Creating a custom ordering
 * const personOrdering = Ordering.by<Person, string>(p => p.name);
 * const sortedPeople = people.sort(personOrdering.compare);
 * 
 * // Reverse ordering
 * const descendingOrder = Ordering.number.reverse();
 * const sortedDesc = numbers.sort(descendingOrder.compare);
 * ```
 */

/**
 * Ordering is a type class for objects that can be compared.
 */
export interface Ordering<T> {
  /**
   * Compares two values.
   * 
   * Returns a negative number if x < y, zero if x = y, and a positive number if x > y.
   */
  compare(x: T, y: T): number;

  /**
   * Returns true if x < y.
   */
  lt(x: T, y: T): boolean;

  /**
   * Returns true if x <= y.
   */
  lte(x: T, y: T): boolean;

  /**
   * Returns true if x > y.
   */
  gt(x: T, y: T): boolean;

  /**
   * Returns true if x >= y.
   */
  gte(x: T, y: T): boolean;

  /**
   * Returns true if x = y.
   */
  equals(x: T, y: T): boolean;

  /**
   * Returns the minimum of two values.
   */
  min(x: T, y: T): T;

  /**
   * Returns the maximum of two values.
   */
  max(x: T, y: T): T;

  /**
   * Returns a new Ordering that compares in the reverse order.
   */
  reverse(): Ordering<T>;

  /**
   * Returns a new Ordering that first compares using this ordering, and if that
   * comparison is zero, then compares using the given ordering.
   */
  andThen<U extends T>(that: Ordering<U>): Ordering<U>;
}

/**
 * Abstract base class for implementing the Ordering interface.
 */
abstract class AbstractOrdering<T> implements Ordering<T> {
  abstract compare(x: T, y: T): number;

  lt(x: T, y: T): boolean {
    return this.compare(x, y) < 0;
  }

  lte(x: T, y: T): boolean {
    return this.compare(x, y) <= 0;
  }

  gt(x: T, y: T): boolean {
    return this.compare(x, y) > 0;
  }

  gte(x: T, y: T): boolean {
    return this.compare(x, y) >= 0;
  }

  equals(x: T, y: T): boolean {
    return this.compare(x, y) === 0;
  }

  min(x: T, y: T): T {
    return this.lte(x, y) ? x : y;
  }

  max(x: T, y: T): T {
    return this.gte(x, y) ? x : y;
  }

  reverse(): Ordering<T> {
    const self = this;
    return new class extends AbstractOrdering<T> {
      compare(x: T, y: T): number {
        return self.compare(y, x);
      }
    };
  }

  andThen<U extends T>(that: Ordering<U>): Ordering<U> {
    const self = this;
    return new class extends AbstractOrdering<U> {
      compare(x: U, y: U): number {
        const result = self.compare(x, y);
        return result !== 0 ? result : that.compare(x, y);
      }
    };
  }
}

/**
 * Ordering instance for numbers.
 */
class NumberOrdering extends AbstractOrdering<number> {
  compare(x: number, y: number): number {
    return x - y;
  }
}

/**
 * Ordering instance for strings.
 */
class StringOrdering extends AbstractOrdering<string> {
  compare(x: string, y: string): number {
    return x.localeCompare(y);
  }
}

/**
 * Ordering instance for booleans.
 */
class BooleanOrdering extends AbstractOrdering<boolean> {
  compare(x: boolean, y: boolean): number {
    return Number(x) - Number(y);
  }
}

/**
 * Ordering instance for dates.
 */
class DateOrdering extends AbstractOrdering<Date> {
  compare(x: Date, y: Date): number {
    return x.getTime() - y.getTime();
  }
}

/**
 * Creates an ordering by mapping the values to a type with a defined ordering.
 */
class MappedOrdering<T, U> extends AbstractOrdering<T> {
  constructor(
    private readonly ordering: Ordering<U>,
    private readonly f: (t: T) => U
  ) {
    super();
  }

  compare(x: T, y: T): number {
    return this.ordering.compare(this.f(x), this.f(y));
  }
}

/**
 * Ordering namespace containing utility functions and predefined orderings.
 */
export const Ordering = {
  /**
   * Ordering for numbers.
   */
  number: new NumberOrdering(),

  /**
   * Ordering for strings.
   */
  string: new StringOrdering(),

  /**
   * Ordering for booleans.
   */
  boolean: new BooleanOrdering(),

  /**
   * Ordering for dates.
   */
  date: new DateOrdering(),

  /**
   * Creates a new Ordering by mapping the values to a type with a defined ordering.
   */
  by<T, U>(f: (t: T) => U, ordering?: Ordering<U>): Ordering<T> {
    const ord = ordering || Ordering.natural<U>();
    return new MappedOrdering<T, U>(ord, f);
  },

  /**
   * Creates a natural ordering for the given type.
   * 
   * This assumes the type has a natural ordering (e.g., numbers, strings, dates).
   */
  natural<T>(): Ordering<T> {
    return new class extends AbstractOrdering<T> {
      compare(x: T, y: T): number {
        if (typeof x === 'number' && typeof y === 'number') {
          return x - y;
        } else if (typeof x === 'string' && typeof y === 'string') {
          return x.localeCompare(y);
        } else if (x instanceof Date && y instanceof Date) {
          return x.getTime() - y.getTime();
        } else if (typeof x === 'boolean' && typeof y === 'boolean') {
          return Number(x) - Number(y);
        } else {
          const valueX = String(x);
          const valueY = String(y);
          return valueX.localeCompare(valueY);
        }
      }
    };
  }
};

// Default export
export default Ordering; 