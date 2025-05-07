import { describe, expect, it } from 'vitest';
import { Ordering } from '../ordering';

describe('Ordering', () => {
  describe('Built-in orderings', () => {
    it('should compare numbers correctly', () => {
      const ordering = Ordering.number;
      expect(ordering.compare(1, 2)).toBeLessThan(0);
      expect(ordering.compare(2, 1)).toBeGreaterThan(0);
      expect(ordering.compare(2, 2)).toBe(0);

      expect(ordering.lt(1, 2)).toBe(true);
      expect(ordering.lt(2, 1)).toBe(false);
      expect(ordering.lt(2, 2)).toBe(false);

      expect(ordering.lte(1, 2)).toBe(true);
      expect(ordering.lte(2, 1)).toBe(false);
      expect(ordering.lte(2, 2)).toBe(true);

      expect(ordering.gt(1, 2)).toBe(false);
      expect(ordering.gt(2, 1)).toBe(true);
      expect(ordering.gt(2, 2)).toBe(false);

      expect(ordering.gte(1, 2)).toBe(false);
      expect(ordering.gte(2, 1)).toBe(true);
      expect(ordering.gte(2, 2)).toBe(true);

      expect(ordering.equals(1, 2)).toBe(false);
      expect(ordering.equals(2, 2)).toBe(true);
    });

    it('should find min and max values correctly for numbers', () => {
      const ordering = Ordering.number;
      expect(ordering.min(1, 2)).toBe(1);
      expect(ordering.min(2, 1)).toBe(1);
      expect(ordering.min(2, 2)).toBe(2);

      expect(ordering.max(1, 2)).toBe(2);
      expect(ordering.max(2, 1)).toBe(2);
      expect(ordering.max(2, 2)).toBe(2);
    });

    it('should compare strings correctly', () => {
      const ordering = Ordering.string;
      expect(ordering.compare('a', 'b')).toBeLessThan(0);
      expect(ordering.compare('b', 'a')).toBeGreaterThan(0);
      expect(ordering.compare('b', 'b')).toBe(0);

      expect(ordering.lt('a', 'b')).toBe(true);
      expect(ordering.lt('b', 'a')).toBe(false);
      expect(ordering.lt('b', 'b')).toBe(false);
    });

    it('should compare booleans correctly', () => {
      const ordering = Ordering.boolean;
      expect(ordering.compare(false, true)).toBeLessThan(0);
      expect(ordering.compare(true, false)).toBeGreaterThan(0);
      expect(ordering.compare(true, true)).toBe(0);

      expect(ordering.lt(false, true)).toBe(true);
      expect(ordering.lt(true, false)).toBe(false);
      expect(ordering.lt(true, true)).toBe(false);
    });

    it('should compare dates correctly', () => {
      const ordering = Ordering.date;
      const date1 = new Date(2022, 0, 1);
      const date2 = new Date(2022, 0, 2);

      expect(ordering.compare(date1, date2)).toBeLessThan(0);
      expect(ordering.compare(date2, date1)).toBeGreaterThan(0);
      expect(ordering.compare(date1, new Date(2022, 0, 1))).toBe(0);

      expect(ordering.lt(date1, date2)).toBe(true);
      expect(ordering.lt(date2, date1)).toBe(false);
      expect(ordering.lt(date1, new Date(2022, 0, 1))).toBe(false);
    });
  });

  describe('Reversed ordering', () => {
    it('should reverse number ordering correctly', () => {
      const reversed = Ordering.number.reverse();
      expect(reversed.compare(1, 2)).toBeGreaterThan(0);
      expect(reversed.compare(2, 1)).toBeLessThan(0);
      expect(reversed.compare(2, 2)).toBe(0);

      expect(reversed.lt(1, 2)).toBe(false);
      expect(reversed.lt(2, 1)).toBe(true);
      expect(reversed.lt(2, 2)).toBe(false);
    });
  });

  describe('Chained ordering', () => {
    it('should apply subsequent ordering when primary comparison is equal', () => {
      // Order by lastname, then by firstname
      type Person = { firstname: string; lastname: string };
      const byLastname = Ordering.by<Person, string>(p => p.lastname);
      const byFirstname = Ordering.by<Person, string>(p => p.firstname);

      const combined = byLastname.andThen(byFirstname);

      const p1 = { firstname: 'Alice', lastname: 'Smith' };
      const p2 = { firstname: 'Bob', lastname: 'Smith' };
      const p3 = { firstname: 'Charlie', lastname: 'Jones' };

      // Same lastname, different firstname
      expect(combined.lt(p1, p2)).toBe(true); // Alice comes before Bob

      // Different lastname
      expect(combined.lt(p1, p3)).toBe(false); // Smith comes after Jones
      expect(combined.lt(p3, p1)).toBe(true); // Jones comes before Smith
    });
  });

  describe('Custom ordering', () => {
    it('should create custom ordering with by() method', () => {
      type Person = { name: string; age: number };

      // Order by age
      const byAge = Ordering.by<Person, number>(p => p.age);

      const alice = { name: 'Alice', age: 30 };
      const bob = { name: 'Bob', age: 25 };

      expect(byAge.compare(alice, bob)).toBeGreaterThan(0);
      expect(byAge.lt(alice, bob)).toBe(false);
      expect(byAge.lt(bob, alice)).toBe(true);

      // Order by name
      const byName = Ordering.by<Person, string>(p => p.name);

      expect(byName.compare(alice, bob)).toBeLessThan(0);
      expect(byName.lt(alice, bob)).toBe(true);
      expect(byName.lt(bob, alice)).toBe(false);
    });
  });

  describe('Natural ordering', () => {
    it('should provide natural ordering for common types', () => {
      const natural = Ordering.natural();

      // Numbers
      expect(natural.compare(1, 2)).toBeLessThan(0);
      expect(natural.compare(2, 1)).toBeGreaterThan(0);

      // Strings
      expect(natural.compare('a', 'b')).toBeLessThan(0);
      expect(natural.compare('b', 'a')).toBeGreaterThan(0);

      // Booleans
      expect(natural.compare(false, true)).toBeLessThan(0);
      expect(natural.compare(true, false)).toBeGreaterThan(0);

      // Dates
      const date1 = new Date(2022, 0, 1);
      const date2 = new Date(2022, 0, 2);
      expect(natural.compare(date1, date2)).toBeLessThan(0);
      expect(natural.compare(date2, date1)).toBeGreaterThan(0);
    });
  });

  describe('Practical usage', () => {
    it('should be usable to sort arrays', () => {
      const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

      // Bind the compare function to preserve the 'this' context
      const numberCompare = Ordering.number.compare.bind(Ordering.number);
      const sorted = [...numbers].sort(numberCompare);
      expect(sorted).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);

      const reversedCompare = Ordering.number.reverse().compare.bind(Ordering.number.reverse());
      const reversed = [...numbers].sort(reversedCompare);
      expect(reversed).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);

      type Person = { name: string; age: number };
      const people = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
        { name: 'Charlie', age: 35 }
      ];

      const byAge = Ordering.by<Person, number>(p => p.age);
      const byAgeCompare = byAge.compare.bind(byAge);
      const sortedByAge = [...people].sort(byAgeCompare);
      expect(sortedByAge[0].name).toBe('Bob');
      expect(sortedByAge[1].name).toBe('Alice');
      expect(sortedByAge[2].name).toBe('Charlie');

      const byName = Ordering.by<Person, string>(p => p.name);
      const byNameCompare = byName.compare.bind(byName);
      const sortedByName = [...people].sort(byNameCompare);
      expect(sortedByName[0].name).toBe('Alice');
      expect(sortedByName[1].name).toBe('Bob');
      expect(sortedByName[2].name).toBe('Charlie');
    });
  });
}); 