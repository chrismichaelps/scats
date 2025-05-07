import { describe, expect, it } from 'vitest';
import { AbstractIterable } from '../collections/Iterable';
import { Some, None } from '../Option';

// Simple implementation for testing
class TestIterable<A> extends AbstractIterable<A> {
  constructor(private items: A[]) {
    super();
  }

  iterator(): Iterator<A> {
    let index = 0;
    return {
      next: () => {
        if (index >= this.items.length) {
          return { done: true, value: undefined as any };
        }
        return { done: false, value: this.items[index++] };
      }
    };
  }

  knownSize(): number {
    return this.items.length;
  }
}

describe('Iterable', () => {
  describe('Basic Operations', () => {
    it('should iterate over elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const result: number[] = [];

      for (const item of iterable) {
        result.push(item);
      }

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should execute forEach correctly', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const result: number[] = [];

      iterable.forEach(item => result.push(item));

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should map elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const mapped = iterable.map(x => x * 2);

      expect(mapped.toArray()).toEqual([2, 4, 6, 8, 10]);
    });

    it('should flatMap elements', () => {
      const iterable = new TestIterable([1, 2, 3]);
      const flatMapped = iterable.flatMap(x => new TestIterable([x, x * 10]));

      expect(flatMapped.toArray()).toEqual([1, 10, 2, 20, 3, 30]);
    });

    it('should collect elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const collected = iterable.collect(x => x % 2 === 0 ? Some(x * 2) : None);

      expect(collected.toArray()).toEqual([4, 8]);
    });

    it('should concatenate iterables', () => {
      const iterable1 = new TestIterable([1, 2, 3]);
      const iterable2 = new TestIterable([4, 5, 6]);
      const concatenated = iterable1.concat(iterable2);

      expect(concatenated.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Filtering Operations', () => {
    it('should filter elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const filtered = iterable.filter(x => x % 2 === 0);

      expect(filtered.toArray()).toEqual([2, 4]);
    });

    it('should filterNot elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const filtered = iterable.filterNot(x => x % 2 === 0);

      expect(filtered.toArray()).toEqual([1, 3, 5]);
    });

    it('should take elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const taken = iterable.take(3);

      expect(taken.toArray()).toEqual([1, 2, 3]);
    });

    it('should drop elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const dropped = iterable.drop(2);

      expect(dropped.toArray()).toEqual([3, 4, 5]);
    });

    it('should takeWhile elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const taken = iterable.takeWhile(x => x < 4);

      expect(taken.toArray()).toEqual([1, 2, 3]);
    });

    it('should dropWhile elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const dropped = iterable.dropWhile(x => x < 3);

      expect(dropped.toArray()).toEqual([3, 4, 5]);
    });

    it('should takeRight elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const taken = iterable.takeRight(3);

      expect(taken.toArray()).toEqual([3, 4, 5]);
    });

    it('should dropRight elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const dropped = iterable.dropRight(2);

      expect(dropped.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('Element Retrieval', () => {
    it('should get head', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.head()).toBe(1);
    });

    it('should get headOption', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const empty = new TestIterable<number>([]);

      expect(iterable.headOption().isSome).toBe(true);
      expect(iterable.headOption().get()).toBe(1);
      expect(empty.headOption().isNone).toBe(true);
    });

    it('should get last', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.last()).toBe(5);
    });

    it('should get lastOption', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const empty = new TestIterable<number>([]);

      expect(iterable.lastOption().isSome).toBe(true);
      expect(iterable.lastOption().get()).toBe(5);
      expect(empty.lastOption().isNone).toBe(true);
    });

    it('should find element', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.find(x => x > 3).isSome).toBe(true);
      expect(iterable.find(x => x > 3).get()).toBe(4);
      expect(iterable.find(x => x > 10).isNone).toBe(true);
    });

    it('should get tail', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.tail().toArray()).toEqual([2, 3, 4, 5]);
    });

    it('should get init', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.init().toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should slice elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.slice(1, 4).toArray()).toEqual([2, 3, 4]);
    });
  });

  describe('Subdivision Operations', () => {
    it('should splitAt', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const [first, second] = iterable.splitAt(2);

      expect(first.toArray()).toEqual([1, 2]);
      expect(second.toArray()).toEqual([3, 4, 5]);
    });

    it('should span', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const [first, second] = iterable.span(x => x < 4);

      expect(first.toArray()).toEqual([1, 2, 3]);
      expect(second.toArray()).toEqual([4, 5]);
    });

    it('should partition', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const [even, odd] = iterable.partition(x => x % 2 === 0);

      expect(even.toArray()).toEqual([2, 4]);
      expect(odd.toArray()).toEqual([1, 3, 5]);
    });

    it('should groupBy', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5, 6]);
      const grouped = iterable.groupBy(x => x % 2 === 0 ? 'even' : 'odd');

      expect(grouped.get('even')?.toArray()).toEqual([2, 4, 6]);
      expect(grouped.get('odd')?.toArray()).toEqual([1, 3, 5]);
    });
  });

  describe('Element Tests', () => {
    it('should check forall', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.forall(x => x > 0)).toBe(true);
      expect(iterable.forall(x => x > 3)).toBe(false);
    });

    it('should check exists', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.exists(x => x > 3)).toBe(true);
      expect(iterable.exists(x => x > 10)).toBe(false);
    });

    it('should count elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.count(x => x % 2 === 0)).toBe(2);
    });
  });

  describe('Folds', () => {
    it('should foldLeft', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.foldLeft(0, (acc, x) => acc + x)).toBe(15);
    });

    it('should foldRight', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.foldRight(0, (x, acc) => x + acc)).toBe(15);
    });

    it('should reduceLeft', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.reduceLeft((acc, x) => acc + x)).toBe(15);
    });

    it('should reduceRight', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.reduceRight((x, acc) => x + acc)).toBe(15);
    });
  });

  describe('Specific Folds', () => {
    it('should sum', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.sum()).toBe(15);
    });

    it('should product', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.product()).toBe(120);
    });

    it('should min', () => {
      const iterable = new TestIterable([5, 2, 8, 1, 9]);

      expect(iterable.min()).toBe(1);
    });

    it('should max', () => {
      const iterable = new TestIterable([5, 2, 8, 1, 9]);

      expect(iterable.max()).toBe(9);
    });

    it('should minOption', () => {
      const iterable = new TestIterable([5, 2, 8, 1, 9]);
      const empty = new TestIterable<number>([]);

      expect(iterable.minOption().isSome).toBe(true);
      expect(iterable.minOption().get()).toBe(1);
      expect(empty.minOption().isNone).toBe(true);
    });

    it('should maxOption', () => {
      const iterable = new TestIterable([5, 2, 8, 1, 9]);
      const empty = new TestIterable<number>([]);

      expect(iterable.maxOption().isSome).toBe(true);
      expect(iterable.maxOption().get()).toBe(9);
      expect(empty.maxOption().isNone).toBe(true);
    });
  });

  describe('String Operations', () => {
    it('should mkString', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.mkString()).toBe('12345');
      expect(iterable.mkString('[', ',', ']')).toBe('[1,2,3,4,5]');
    });
  });

  describe('Zippers', () => {
    it('should zip', () => {
      const iterable1 = new TestIterable([1, 2, 3]);
      const iterable2 = new TestIterable(['a', 'b', 'c']);
      const zipped = iterable1.zip(iterable2);

      expect(zipped.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    });

    it('should zipAll', () => {
      const iterable1 = new TestIterable([1, 2, 3]);
      const iterable2 = new TestIterable(['a', 'b']);
      const zipped = iterable1.zipAll(iterable2, 0, 'z');

      expect(zipped.toArray()).toEqual([[1, 'a'], [2, 'b'], [3, 'z']]);
    });

    it('should zipWithIndex', () => {
      const iterable = new TestIterable(['a', 'b', 'c']);
      const zipped = iterable.zipWithIndex();

      expect(zipped.toArray()).toEqual([['a', 0], ['b', 1], ['c', 2]]);
    });
  });

  describe('Size Info', () => {
    it('should check isEmpty', () => {
      const iterable = new TestIterable([1, 2, 3]);
      const empty = new TestIterable<number>([]);

      expect(iterable.isEmpty()).toBe(false);
      expect(empty.isEmpty()).toBe(true);
    });

    it('should check nonEmpty', () => {
      const iterable = new TestIterable([1, 2, 3]);
      const empty = new TestIterable<number>([]);

      expect(iterable.nonEmpty()).toBe(true);
      expect(empty.nonEmpty()).toBe(false);
    });

    it('should get size', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.size()).toBe(5);
    });

    it('should get knownSize', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.knownSize()).toBe(5);
    });

    it('should compare sizes', () => {
      const iterable1 = new TestIterable([1, 2, 3]);
      const iterable2 = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable1.sizeCompare(iterable2)).toBe(-2);
      expect(iterable2.sizeCompare(iterable1)).toBe(2);
      expect(iterable1.sizeCompare(3)).toBe(0);
    });
  });

  describe('Grouped and Sliding', () => {
    it('should group elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5, 6]);
      const grouped = iterable.grouped(3);
      const result: number[][] = [];

      // Convert iterator to array
      let next = grouped.next();
      while (!next.done) {
        result.push(next.value.toArray());
        next = grouped.next();
      }

      expect(result.length).toBe(2);
      expect(result[0]).toEqual([1, 2, 3]);
      expect(result[1]).toEqual([4, 5, 6]);
    });

    it('should slide elements', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);
      const sliding = iterable.sliding(3);
      const result: number[][] = [];

      // Convert iterator to array
      let next = sliding.next();
      while (!next.done) {
        result.push(next.value.toArray());
        next = sliding.next();
      }

      expect(result.length).toBe(3);
      expect(result[0]).toEqual([1, 2, 3]);
      expect(result[1]).toEqual([2, 3, 4]);
      expect(result[2]).toEqual([3, 4, 5]);
    });
  });

  describe('Conversions', () => {
    it('should convert to array', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      expect(iterable.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should convert to list', () => {
      const iterable = new TestIterable([1, 2, 3, 4, 5]);

      // Skip the instance check and just verify the data
      const list = iterable.toList();
      expect([...list]).toEqual([1, 2, 3, 4, 5]);
    });

    it('should convert to set', () => {
      const iterable = new TestIterable([1, 2, 2, 3, 3, 3]);

      // Skip the instance check and just verify the data
      const set = iterable.toSet();
      // Use toArray instead of values() for our custom Set implementation
      expect(set.toArray().sort()).toEqual([1, 2, 3]);
    });

    it('should convert to map', () => {
      const iterable = new TestIterable<[string, number]>([
        ['a', 1],
        ['b', 2],
        ['c', 3]
      ]);

      // Skip the instance check and just verify the data
      const map = iterable.toMap<string, number>();
      // Use get() which returns Option instead of getOrElse
      expect(map.get('a').getOrElse(0)).toBe(1);
      expect(map.get('b').getOrElse(0)).toBe(2);
      expect(map.get('c').getOrElse(0)).toBe(3);
    });
  });
}); 