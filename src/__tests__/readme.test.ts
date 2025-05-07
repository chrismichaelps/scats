import { describe, expect, it } from 'vitest';
import {
  Option, Some, None,
  Left, Right,
  Try, TryAsync,
  List, Map, Set,
  match, when, extract, value, array, or, and, not, type as matchType, object,
  For, ForComprehensionBuilder, Monad,
  TypeClass, TypeClassRegistry
} from '../';

describe('README Examples', () => {
  describe('Option', () => {
    it('should work as shown in the README', () => {
      // Creating options
      const a = Some(42);
      const b = None;
      const c = Option.fromNullable('value');
      const d = Option.fromNullable(null);

      // Using options
      const result = a
        .map(n => n * 2)
        .flatMap(n => n > 50 ? Some(n) : None)
        .getOrElse(0);

      expect(a.isSome).toBe(true);
      expect(b.isNone).toBe(true);
      expect(c.isSome).toBe(true);
      expect(d.isNone).toBe(true);
      expect(result).toBe(84); // 42 * 2 = 84, which is > 50
    });
  });

  describe('Either', () => {
    it('should work as shown in the README', () => {
      // Creating eithers
      const success = Right(42);
      const failure = Left(new Error("Something went wrong"));

      // Using eithers
      const result = success
        .map(n => n * 2)
        .fold(
          err => `Error: ${(err as Error).message}`,
          value => `Success: ${value}`
        );

      const failureResult = failure
        .map(n => n * 2)
        .fold(
          err => `Error: ${(err as Error).message}`,
          value => `Success: ${value}`
        );

      expect(success.isRight).toBe(true);
      expect(failure.isLeft).toBe(true);
      expect(result).toBe('Success: 84');
      expect(failureResult).toBe('Error: Something went wrong');
    });
  });

  describe('Try', () => {
    it('should work as shown in the README for synchronous operations', () => {
      // Synchronous Try
      const validJson = '{"value": "test"}';
      const jsonResult = Try.of(() => JSON.parse(validJson))
        .map(data => data.value)
        .recover(err => "default value")
        .get();

      expect(jsonResult).toBe('test');

      const invalidJson = '{invalid}';
      const errorResult = Try.of(() => JSON.parse(invalidJson))
        .map(data => data.value)
        .recover(err => "default value")
        .get();

      expect(errorResult).toBe('default value');
    });

    it('should work as shown in the README for asynchronous operations', async () => {
      // Skip real fetch tests, just test TryAsync behavior
      const asyncSuccess = TryAsync.of(() => Promise.resolve({ value: 'async data' }));
      const asyncResult = await asyncSuccess
        .map(data => data.value)
        .toPromise();

      expect(asyncResult).toBe('async data');

      // Error case
      const asyncFailure = TryAsync.of(() => Promise.reject(new Error('Network error')));
      const asyncErrorResult = await asyncFailure
        .recover(() => ({ value: "error occurred" }))
        .map(data => data.value)
        .toPromise();

      expect(asyncErrorResult).toBe('error occurred');
    });
  });

  describe('Pattern Matching', () => {
    it('should handle simple value matching', () => {
      // Simple value matching
      const result = match(42)
        .with(1, () => "one")
        .with(2, () => "two")
        .with(when<number>(n => n > 10), n => `greater than 10: ${n}`)
        .otherwise(() => "default case")
        .run();

      expect(result).toBe('greater than 10: 42');
    });

    it('should handle object pattern matching', () => {
      // Object pattern matching
      const person = { name: "John", age: 30 };
      const greeting = match(person)
        .with(object({ name: "John", age: when<number>(a => a > 18) }), () => "Hello Mr. John")
        .with(object({ name: "John" }), () => "Hello John")
        .otherwise(() => "Hello stranger")
        .run();

      expect(greeting).toBe('Hello Mr. John');
    });

    it('should handle advanced pattern matching', () => {
      const person = { name: "Alice", age: 28 };

      // Extract pattern
      const nameResult = match(person)
        .with(extract(p => p.name), name => `Name is: ${name}`)
        .otherwise(() => "No name")
        .run();

      expect(nameResult).toBe('Name is: Alice');

      // Array pattern
      const arrayResult = match([1, 2, 3])
        .with(array([1, 2, 3]), () => "exact match")
        .with(array([1, when<number>(n => n > 1), 3]), () => "pattern match")
        .otherwise(() => "no match")
        .run();

      expect(arrayResult).toBe('exact match');

      // Combining patterns with or, and, not
      const complexResult = match(42)
        .with(or<number>(value(41), value(42), value(43)), () => "one of 41, 42, 43")
        .otherwise(() => "not in range")
        .run();

      expect(complexResult).toBe('one of 41, 42, 43');

      const andResult = match(42)
        .with(and<number>(when<number>(n => n > 40), when<number>(n => n < 50)), () => "between 40 and 50")
        .otherwise(() => "outside range")
        .run();

      expect(andResult).toBe('between 40 and 50');

      const notResult = match(42)
        .with(not<number>(value(100)), () => "not 100")
        .otherwise(() => "is 100")
        .run();

      expect(notResult).toBe('not 100');
    });

    it('should handle type matching', () => {
      // Type matching
      class Cat { meow() { return 'meow'; } }
      class Dog { bark() { return 'woof'; } }

      const animal = new Cat();

      const typeResult = match(animal)
        .with(matchType(Cat), () => "It's a cat")
        .with(matchType(Dog), () => "It's a dog")
        .otherwise(() => "Unknown animal")
        .run();

      expect(typeResult).toBe("It's a cat");
    });
  });

  describe('Collections', () => {
    it('should handle List operations correctly', () => {
      // List
      const numbers = List.of(1, 2, 3, 4, 5);
      const doubled = numbers.map(n => n * 2);
      const sum = numbers.foldLeft(0, (acc, n) => acc + n);
      const evens = numbers.filter(n => n % 2 === 0);

      expect(numbers.size).toBe(5);
      expect(doubled.get(0)).toBe(2);
      expect(doubled.get(4)).toBe(10);
      expect(sum).toBe(15);
      expect(evens.size).toBe(2);
      expect(evens.get(0)).toBe(2);
      expect(evens.get(1)).toBe(4);
    });

    it('should handle Map operations correctly', () => {
      // Map
      const userMap = Map.of([
        ["user1", { name: "Alice", age: 25 }],
        ["user2", { name: "Bob", age: 30 }]
      ]);
      const hasUser = userMap.has("user1");
      const olderUsers = userMap.filter(user => user.age > 25);

      expect(userMap.size).toBe(2);
      expect(hasUser).toBe(true);
      expect(olderUsers.size).toBe(1);
      expect(olderUsers.get("user2").isSome).toBe(true);
      expect(olderUsers.get("user2").get().name).toBe("Bob");
    });

    it('should handle Set operations correctly', () => {
      // Set
      const uniqueNumbers = Set.of(1, 2, 3, 2, 1);
      const union = uniqueNumbers.union(Set.of(3, 4, 5));
      const intersection = uniqueNumbers.intersection(Set.of(2, 3, 4));
      const difference = uniqueNumbers.difference(Set.of(2, 3));

      expect(uniqueNumbers.size).toBe(3);
      expect(union.size).toBe(5);
      expect(intersection.size).toBe(2);
      expect(difference.size).toBe(1);
      expect(difference.contains(1)).toBe(true);
    });
  });

  describe('For-Comprehensions', () => {
    it('should handle option comprehensions', () => {
      // Option comprehension
      const optionResult = For.option<{ a: number; b: number; c: number }>()
        .bind("a", () => Some(1))
        .bind("b", ({ a }) => Some(a + 1))
        .bind("c", ({ a, b }) => Some(a + b))
        .yield(({ a, b, c }) => a + b + c);

      expect(optionResult.isSome).toBe(true);
      expect(optionResult.get()).toBe(6); // 1 + 2 + 3

      // With a None value
      const noneResult = For.option<{ a: number; b: number; c: number }>()
        .bind("a", () => Some(1))
        .bind("b", () => None)
        .bind("c", ({ a, b }) => Some(a + (b as any)))
        .yield(({ a, b, c }) => a + (b as any) + (c as any));

      expect(noneResult.isNone).toBe(true);
    });

    it('should handle list comprehensions', () => {
      // List comprehension
      const matrix = For.list<{ row: number; col: string }>()
        .bind("row", () => List.of(1, 2, 3))
        .bind("col", () => List.of("A", "B"))
        .yield(({ row, col }) => `${row}${col}`);

      expect(matrix.size).toBe(6);
      expect(matrix.get(0)).toBe("1A");
      expect(matrix.get(1)).toBe("1B");
      expect(matrix.get(2)).toBe("2A");
      expect(matrix.get(3)).toBe("2B");
      expect(matrix.get(4)).toBe("3A");
      expect(matrix.get(5)).toBe("3B");
    });

    it('should handle custom monads', () => {
      // Custom monad example
      class Identity<A> implements Monad<A> {
        constructor(private readonly value: A) { }

        map<B>(f: (a: A) => B): Identity<B> {
          return new Identity(f(this.value));
        }

        flatMap<B>(f: (a: A) => Identity<B>): Identity<B> {
          return f(this.value);
        }

        get(): A {
          return this.value;
        }

        static of<A>(a: A): Identity<A> {
          return new Identity(a);
        }
      }

      // Creating a custom comprehension
      const builder = new ForComprehensionBuilder<Identity<any>, {}>();
      const idComp = builder.custom(
        <A>(a: A) => Identity.of(a),
        <A>(ma: Identity<A>, f: (a: A) => Identity<any>) => ma.flatMap(f)
      );

      const result = idComp
        .bind('x', () => Identity.of(10))
        .bind('y', env => Identity.of((env as any).x * 2))
        .yield(env => (env as any).x + (env as any).y);

      expect(result.get()).toBe(30); // 10 + (10 * 2) = 30
    });
  });

  describe('Type Classes', () => {
    it('should handle simple type class instances', () => {
      // Define a type class
      interface Numeric<T> extends TypeClass<T> {
        add(a: T, b: T): T;
        zero(): T;
      }

      // Create instances for different types
      const numberNumeric: Numeric<number> = {
        __type: undefined as any as number,
        add: (a, b) => a + b,
        zero: () => 0
      };

      const stringNumeric: Numeric<string> = {
        __type: undefined as any as string,
        add: (a, b) => a + b,
        zero: () => ""
      };

      // Verify implementations work
      expect(numberNumeric.add(5, 10)).toBe(15);
      expect(numberNumeric.zero()).toBe(0);
      expect(stringNumeric.add("Hello", " World")).toBe("Hello World");
      expect(stringNumeric.zero()).toBe("");
    });

    it('should register type classes in a registry', () => {
      // Define a type class
      interface Numeric<T> extends TypeClass<T> {
        add(a: T, b: T): T;
        zero(): T;
      }

      // Create instances for different types
      const numberNumeric: Numeric<number> = {
        __type: undefined as any as number,
        add: (a, b) => a + b,
        zero: () => 0
      };

      const stringNumeric: Numeric<string> = {
        __type: undefined as any as string,
        add: (a, b) => a + b,
        zero: () => ""
      };

      // Register instances in a registry
      const registry = new TypeClassRegistry<Numeric<any>>();
      registry.register(numberNumeric, Number);
      registry.register(stringNumeric, String);

      // Test registry operations
      expect(registry.hasFor(42)).toBe(true);
      expect(registry.hasFor("hello")).toBe(true);

      // Using the registry
      function sum<T>(values: T[], registry: TypeClassRegistry<Numeric<any>>): T {
        if (values.length === 0) {
          throw new Error("Cannot sum empty array");
        }
        const numeric = registry.getFor(values[0]);
        return values.reduce((acc, val) => numeric.add(acc, val), numeric.zero());
      }

      expect(sum([1, 2, 3, 4], registry)).toBe(10);
      expect(sum(["a", "b", "c"], registry)).toBe("abc");
    });
  });
}); 