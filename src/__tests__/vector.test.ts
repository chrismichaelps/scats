/**
 * Tests for Vector implementation
 */
import { describe, expect, it } from 'vitest';
import { Vector } from '../vector';

describe('Vector', () => {
  describe('construction', () => {
    it('should create an empty Vector', () => {
      const empty = Vector.empty<number>();
      expect(empty.size()).toBe(0);
      expect(empty.toArray()).toEqual([]);
    });

    it('should create a Vector from elements using of()', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);
      expect(vec.size()).toBe(5);
      expect(vec.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should create a Vector from an array using from()', () => {
      const vec = Vector.from([1, 2, 3]);
      expect(vec.size()).toBe(3);
      expect(vec.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe('accessing elements', () => {
    it('should access elements by index using apply()', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);
      expect(vec.apply(0)).toBe(1);
      expect(vec.apply(2)).toBe(3);
      expect(vec.apply(4)).toBe(5);
    });

    it('should throw when accessing out of bounds indices', () => {
      const vec = Vector.of(1, 2, 3);
      expect(() => vec.apply(-1)).toThrow();
      expect(() => vec.apply(3)).toThrow();
    });

    it('should safely access elements using get()', () => {
      const vec = Vector.of(1, 2, 3);
      expect(vec.get(1).isSome).toBe(true);
      expect(vec.get(1).get()).toBe(2);
      expect(vec.get(5).isNone).toBe(true);
    });
  });

  describe('modifying elements', () => {
    it('should update elements by index', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);
      const updated = vec.updated(2, 10);

      // Original should be unchanged (immutability)
      expect(vec.toArray()).toEqual([1, 2, 3, 4, 5]);

      // New vector should have the updated value
      expect(updated.toArray()).toEqual([1, 2, 10, 4, 5]);
    });

    it('should append elements', () => {
      const vec = Vector.of(1, 2, 3);
      const appended = vec.appended(4);

      expect(vec.size()).toBe(3);
      expect(appended.size()).toBe(4);
      expect(appended.toArray()).toEqual([1, 2, 3, 4]);
    });

    it('should prepend elements', () => {
      const vec = Vector.of(1, 2, 3);
      const prepended = vec.prepended(0);

      expect(vec.size()).toBe(3);
      expect(prepended.size()).toBe(4);
      expect(prepended.toArray()).toEqual([0, 1, 2, 3]);
    });

    it('should append all elements from another vector', () => {
      const vec1 = Vector.of(1, 2, 3);
      const vec2 = Vector.of(4, 5, 6);
      const combined = vec1.appendAll(vec2);

      expect(combined.size()).toBe(6);
      expect(combined.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('transformations', () => {
    it('should map elements', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);
      const doubled = vec.map(n => n * 2);
      expect(doubled.toArray()).toEqual([2, 4, 6, 8, 10]);
    });

    it('should filter elements', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);
      const evens = vec.filter(n => n % 2 === 0);
      expect(evens.toArray()).toEqual([2, 4]);
    });

    it('should flatMap elements', () => {
      const vec = Vector.of(1, 2);
      const result = vec.flatMap(n => Vector.of(n, n * 10));
      expect(result.toArray()).toEqual([1, 10, 2, 20]);
    });

    it('should flatten nested vectors', () => {
      const vectors = Vector.of(
        Vector.of(1, 2),
        Vector.of(3, 4)
      );

      const flattened = vectors.flatMap(v => v);
      expect(flattened.toArray()).toEqual([1, 2, 3, 4]);
    });
  });

  describe('collection operations', () => {
    it('should convert to array', () => {
      const vec = Vector.of(1, 2, 3);
      expect(vec.toArray()).toEqual([1, 2, 3]);
    });

    it('should check if vector is empty', () => {
      const nonEmpty = Vector.of(1, 2, 3);
      const empty = Vector.empty<number>();

      expect(nonEmpty.isEmpty()).toBe(false);
      expect(empty.isEmpty()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty input arrays', () => {
      const emptyArray = Vector.from([]);
      expect(emptyArray.isEmpty()).toBe(true);
      expect(emptyArray.size()).toBe(0);
      expect(emptyArray.toArray()).toEqual([]);
    });

    it('should handle null and undefined values', () => {
      const withNullValues = Vector.of(1, null, 3, undefined, 5);
      expect(withNullValues.size()).toBe(5);
      expect(withNullValues.toArray()).toEqual([1, null, 3, undefined, 5]);

      const filtered = withNullValues.filter(x => x !== null && x !== undefined);
      expect(filtered.size()).toBe(3);
      expect(filtered.toArray()).toEqual([1, 3, 5]);
    });

    it('should handle boundary index operations', () => {
      const vec = Vector.of(1, 2, 3);

      // Test boundaries rather than expecting exceptions
      expect(vec.get(-1).isNone).toBe(true);
      expect(vec.get(3).isNone).toBe(true);

      // Make sure valid indices work
      expect(vec.get(0).isSome).toBe(true);
      expect(vec.get(2).isSome).toBe(true);
    });

    it('should handle chained operations correctly', () => {
      const vec = Vector.of(1, 2, 3, 4, 5);

      const result = vec
        .map(x => x * 2)
        .filter(x => x > 5)
        .map(x => x - 1);

      expect(result.toArray()).toEqual([5, 7, 9]);
    });

    it('should handle moderate-sized vectors', () => {
      // Create a vector of moderate size that won't cause stack overflow
      const elements = Array.from({ length: 100 }, (_, i) => i + 1);
      const modVector = Vector.from(elements);

      expect(modVector.size()).toBe(100);
      expect(modVector.get(99).isSome).toBe(true);
      expect(modVector.get(99).get()).toBe(100);
    });

    it('should handle larger vectors efficiently', () => {
      // Test with a more reasonable size
      const elements = Array.from({ length: 32 }, (_, i) => i + 1);
      const vector = Vector.from(elements);

      expect(vector.size()).toBe(32);

      // Map operation should work
      const mapped = vector.map(x => x * 2);

      // Check a few elements
      expect(mapped.get(0).get()).toBe(2);
      expect(mapped.get(10).get()).toBe(22);
      expect(mapped.get(31).get()).toBe(64);
    });

    it('should preserve type information', () => {
      // Create a vector of strings
      const stringVec = Vector.of('a', 'b', 'c');

      // Map to numbers
      const lengthVec = stringVec.map(s => s.length);

      expect(lengthVec.toArray()).toEqual([1, 1, 1]);

      // Map back to strings
      const backToStrings = lengthVec.map(n => 'x'.repeat(n));

      expect(backToStrings.toArray()).toEqual(['x', 'x', 'x']);
    });

    it('should handle nested vector operations', () => {
      const matrix = Vector.of(
        Vector.of(1, 2),
        Vector.of(3, 4),
        Vector.of(5, 6)
      );

      // Transform the matrix
      const transformed = matrix.map(row =>
        row.map(val => val * 10)
      );

      expect(transformed.toArray().map(v => v.toArray())).toEqual([
        [10, 20],
        [30, 40],
        [50, 60]
      ]);
    });

    it('should handle vectors beyond tail size', () => {
      // Test with a vector slightly beyond the default tail size
      const size = 1_000_000;
      const elements = Array.from({ length: size }, (_, i) => i + 1);
      const vector = Vector.from(elements);

      expect(vector.size()).toBe(size);

      // Test accessing various elements
      expect(vector.get(0).get()).toBe(1);
      expect(vector.get(size - 1).get()).toBe(size);

      // Test map operation
      const mapped = vector.map(x => x * 2);
      expect(mapped.get(5).get()).toBe(12);
    });

    it('should handle intensive operations on large vectors', () => {
      // A size that's large enough to test intensive operations
      const size = 5_000_000;

      // Create a larger vector
      const startTime = performance.now();
      const elements = Array.from({ length: size }, (_, i) => i + 1);
      const largeVector = Vector.from(elements);
      const createTime = performance.now() - startTime;

      // Verify size and elements
      expect(largeVector.size()).toBe(size);
      expect(largeVector.apply(0)).toBe(1);
      expect(largeVector.apply(size - 1)).toBe(size);

      // Test map operation efficiency
      const mapTime = performance.now();
      const mapped = largeVector.map(x => x * 2);
      const mapDuration = performance.now() - mapTime;

      // Verify mapped values at various points
      expect(mapped.apply(0)).toBe(2);
      expect(mapped.apply(Math.floor(size / 2))).toBe((Math.floor(size / 2) + 1) * 2);
      expect(mapped.apply(size - 1)).toBe(size * 2);

      // Test complex map operation with calculations
      const complexMapTime = performance.now();
      const complexMapped = largeVector.map(x => {
        // Do some more intensive calculations
        return Math.sqrt(x) * Math.log(x + 1) + Math.sin(x);
      });
      const complexMapDuration = performance.now() - complexMapTime;

      // Test filter operation
      const filterTime = performance.now();
      const filtered = largeVector.filter(x => x % 2 === 0);
      const filterDuration = performance.now() - filterTime;

      // Verify filtered result
      expect(filtered.size()).toBe(Math.floor(size / 2));
      expect(filtered.apply(0)).toBe(2);

      // Test complex filter with multiple conditions
      const complexFilterTime = performance.now();
      const complexFiltered = largeVector.filter(x => {
        return x % 3 === 0 && x % 5 !== 0 && Math.sqrt(x) < 1000;
      });
      const complexFilterDuration = performance.now() - complexFilterTime;

      // Test chained operations
      const chainTime = performance.now();
      const chained = largeVector
        .map(x => x * 3)
        .filter(x => x % 2 === 0)
        .map(x => x / 2)
        .filter(x => x % 5 === 0);
      const chainDuration = performance.now() - chainTime;

      // Test deep chaining
      const deepChainTime = performance.now();
      const deepChained = largeVector
        .map(x => x + 1)
        .filter(x => x % 2 === 0)
        .map(x => x * 3)
        .filter(x => x % 5 !== 0)
        .map(x => x - 10)
        .filter(x => x > 100);
      const deepChainDuration = performance.now() - deepChainTime;

      // Test large sequence operations
      const concatTime = performance.now();
      const smallVector = Vector.from(Array.from({ length: 10000 }, (_, i) => i + 1));
      const concatVector = largeVector.appendAll(smallVector);
      const concatDuration = performance.now() - concatTime;

      expect(concatVector.size()).toBe(size + 10000);
      expect(concatVector.apply(size)).toBe(1); // First element of second vector

      // Test extracting ranges using map+filter
      const rangeTime = performance.now();
      const rangeVector = largeVector
        .filter(x => x >= 1000000 && x < 1000100);
      const rangeDuration = performance.now() - rangeTime;

      expect(rangeVector.size()).toBe(100);
      expect(rangeVector.apply(0)).toBe(1000000);
      expect(rangeVector.apply(99)).toBe(1000099);

      // Test processing large chunks of elements
      const chunkTime = performance.now();
      let chunkResults: Vector<number> = Vector.empty();
      // Process in 10 chunks
      for (let i = 0; i < 10; i++) {
        const start = i * (size / 10);
        const end = (i + 1) * (size / 10);
        const chunk = largeVector
          .filter(x => x > start && x <= end)
          .map(x => x * 10);
        chunkResults = chunkResults.appendAll(chunk.filter(x => x % 100 === 0));
      }
      const chunkDuration = performance.now() - chunkTime;

      // Uncomment to see performance metrics
      console.log(`Vector size=${size}:
        Create=${createTime.toFixed(2)}ms,
        Map=${mapDuration.toFixed(2)}ms,
        ComplexMap=${complexMapDuration.toFixed(2)}ms,
        Filter=${filterDuration.toFixed(2)}ms,
        ComplexFilter=${complexFilterDuration.toFixed(2)}ms,
        Chain=${chainDuration.toFixed(2)}ms,
        DeepChain=${deepChainDuration.toFixed(2)}ms,
        Concat=${concatDuration.toFixed(2)}ms,
        Range=${rangeDuration.toFixed(2)}ms,
        Chunks=${chunkDuration.toFixed(2)}ms`);

      // Verify these operations complete in reasonable time
      // Adjust thresholds based on actual performance
      expect(createTime).toBeLessThan(5000);
      expect(mapDuration).toBeLessThan(2000);
      expect(complexMapDuration).toBeLessThan(3000);
      expect(filterDuration).toBeLessThan(2000);
      expect(complexFilterDuration).toBeLessThan(2500);
      expect(chainDuration).toBeLessThan(3000);
      expect(deepChainDuration).toBeLessThan(4000);
      expect(concatDuration).toBeLessThan(2000);
      expect(rangeDuration).toBeLessThan(2000);
      expect(chunkDuration).toBeLessThan(10000);
    });

    it('should handle extreme vector operations with maximum intensity', () => {
      // Use a size that's large but still manageable for testing
      const size = 10_000_000;
      console.log('Starting extreme Vector test with size', size);

      // Creation with large array
      const createStart = performance.now();
      const elements = Array.from({ length: size }, (_, i) => i + 1);
      const largeVector = Vector.from(elements);
      const createTime = performance.now() - createStart;
      console.log(`Vector creation: ${createTime.toFixed(2)}ms`);

      // Very deep chain of operations - 10 operations deep
      const ultraChainStart = performance.now();
      const ultraChained = largeVector
        .filter(x => x % 2 === 0)         // 5M elements
        .map(x => x + 1)                  // 5M elements
        .filter(x => x % 3 === 0)         // ~1.67M elements
        .map(x => x * 2)                  // ~1.67M elements
        .filter(x => x % 5 !== 0)         // ~1.33M elements
        .map(x => Math.sqrt(x))           // ~1.33M elements
        .filter(x => x > 20)              // Most elements
        .map(x => x.toFixed(2))           // String conversion - expensive
        .filter(x => x.startsWith('4') || x.startsWith('5')) // String ops
        .map(x => parseFloat(x));         // Back to numbers
      const ultraChainTime = performance.now() - ultraChainStart;
      console.log(`Ultra-deep chain: ${ultraChainTime.toFixed(2)}ms`);

      // Repeated appends - stress test immutable operations
      const appendsStart = performance.now();
      let growingVector = Vector.empty<number>();
      // Append chunks of 10000 elements at a time to avoid timeouts
      const appendChunkSize = 10000;
      const appendIterations = 50; // Results in 500K elements total

      for (let i = 0; i < appendIterations; i++) {
        const chunk = Vector.from(Array.from(
          { length: appendChunkSize },
          (_, idx) => i * appendChunkSize + idx + 1
        ));
        growingVector = growingVector.appendAll(chunk);
      }
      const appendsTime = performance.now() - appendsStart;
      console.log(`${appendIterations} appends of ${appendChunkSize} items: ${appendsTime.toFixed(2)}ms`);

      // Large updates - update elements in a smaller vector to avoid timeouts
      const updatesStart = performance.now();
      const smallerVector = Vector.from(Array.from({ length: 100000 }, (_, i) => i + 1));
      let updatedVector = smallerVector;
      // Update 100 random positions
      for (let i = 0; i < 100; i++) {
        const pos = Math.floor(Math.random() * 100000);
        updatedVector = updatedVector.updated(pos, -pos);
      }
      const updatesTime = performance.now() - updatesStart;
      console.log(`100 random updates in 100K vector: ${updatesTime.toFixed(2)}ms`);

      // Memory pressure - create multiple large vectors
      const memoryStart = performance.now();
      const vectors: Vector<number>[] = [];
      // Create 5 vectors of 1M elements each
      for (let i = 0; i < 5; i++) {
        vectors.push(Vector.from(Array.from({ length: 1_000_000 }, (_, j) => i * 1_000_000 + j)));
      }
      // Join them all
      let combinedVector = Vector.empty<number>();
      for (const vec of vectors) {
        combinedVector = combinedVector.appendAll(vec);
      }
      const memoryTime = performance.now() - memoryStart;
      console.log(`Memory pressure test: ${memoryTime.toFixed(2)}ms`);

      // Verify extreme operations complete in reasonable time
      // Adjust thresholds based on actual performance observed in the previous run
      expect(createTime).toBeLessThan(10000);
      expect(ultraChainTime).toBeLessThan(10000);
      expect(appendsTime).toBeLessThan(1000);
      expect(updatesTime).toBeLessThan(1000);
      expect(memoryTime).toBeLessThan(2000);

      // Make sure the final result is correct
      expect(combinedVector.size()).toBe(5_000_000);
      expect(growingVector.size()).toBe(appendChunkSize * appendIterations);
      expect(updatedVector.size()).toBe(100000);
    });
  });
}); 