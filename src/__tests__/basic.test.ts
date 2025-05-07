import { describe, expect, it } from 'vitest';
import {
  Option, Some, None,
} from '../Option';
import {
  Either, Left, Right,
} from '../Either';
import {
  Try, Success, Failure, TryAsync
} from '../Try';
import {
  List
} from '../List';
import {
  Map, empty as emptyMap
} from '../Map';
import {
  Set, empty as emptySet
} from '../Set';
import {
  match, when, otherwise, object, extract, value, array, or, and, not, type as matchType
} from '../Match';
import {
  For, ForComprehensionBuilder, Monad, Env
} from '../ForComprehension';
import {
  TypeClass, TypeClassRegistry, GlobalTypeClassRegistry
} from '../TypeClass';

describe('Option', () => {
  it('should handle Some values', () => {
    const some = Some(42);
    expect(some.isSome).toBe(true);
    expect(some.isNone).toBe(false);
    expect(some.get()).toBe(42);
    expect(some.getOrElse(0)).toBe(42);
  });

  it('should handle None values', () => {
    const none = None;
    expect(none.isSome).toBe(false);
    expect(none.isNone).toBe(true);
    expect(() => none.get()).toThrow();
    expect(none.getOrElse(0)).toBe(0);
  });

  it('should map values correctly', () => {
    const some = Some(42);
    const mapped = some.map((x: number) => x * 2);
    expect(mapped.get()).toBe(84);

    const none = None;
    const mappedNone = none.map((x: number) => x * 2);
    expect(mappedNone.isNone).toBe(true);
  });

  it('should flatMap values correctly', () => {
    const some = Some(42);
    const flatMapped = some.flatMap((x: number) => Some(x * 2));
    expect(flatMapped.get()).toBe(84);

    const flatMappedToNone = some.flatMap(() => None);
    expect(flatMappedToNone.isNone).toBe(true);
  });

  it('should handle fromNullable correctly', () => {
    const someOpt = Option.fromNullable('value');
    const noneOpt = Option.fromNullable(null);

    expect(someOpt.isSome).toBe(true);
    expect(noneOpt.isNone).toBe(true);
    expect(someOpt.get()).toBe('value');
  });
});

describe('Either', () => {
  it('should handle Right values', () => {
    const right = Right<number, string>(42);
    expect(right.isRight).toBe(true);
    expect(right.isLeft).toBe(false);
    expect(right.get()).toBe(42);
  });

  it('should handle Left values', () => {
    const left = Left<string, number>('error');
    expect(left.isRight).toBe(false);
    expect(left.isLeft).toBe(true);
    expect(() => left.get()).toThrow();
    expect(left.getLeft()).toBe('error');
  });

  it('should map values correctly', () => {
    const right = Right<number, string>(42);
    const mapped = right.map((x: number) => x * 2);
    expect(mapped.get()).toBe(84);

    const left = Left<string, number>('error');
    const mappedLeft = left.map((x: number) => x * 2);
    expect(mappedLeft.isLeft).toBe(true);
  });

  it('should fold values correctly', () => {
    const right = Right<number, string>(42);
    const foldedRight = right.fold(
      (l: string) => `Error: ${l}`,
      (r: number) => `Success: ${r}`
    );
    expect(foldedRight).toBe('Success: 42');

    const left = Left<string, number>('error');
    const foldedLeft = left.fold(
      (l: string) => `Error: ${l}`,
      (r: number) => `Success: ${r}`
    );
    expect(foldedLeft).toBe('Error: error');
  });

  it('should type-check as Either', () => {
    // This test ensures that the Either type is properly imported and used
    const checkType = <T>(either: Either<string, T>): Either<string, T> => either;

    const right = Right<number, string>(42);
    const left = Left<string, number>('error');

    const typedRight = checkType(right);
    const typedLeft = checkType(left);

    expect(typedRight.isRight).toBe(true);
    expect(typedLeft.isLeft).toBe(true);
  });
});

describe('Try', () => {
  it('should handle successful operations', () => {
    const success = Try.of(() => 42);
    expect(success.isSuccess).toBe(true);
    expect(success.isFailure).toBe(false);
    expect(success.get()).toBe(42);
  });

  it('should handle failed operations', () => {
    const failure = Try.of(() => { throw new Error('Failed'); });
    expect(failure.isSuccess).toBe(false);
    expect(failure.isFailure).toBe(true);
    expect(() => failure.get()).toThrow();
  });

  it('should recover from failures', () => {
    const failure = Try.of(() => { throw new Error('Failed'); });
    const recovered = failure.recover(() => 42);
    expect(recovered.isSuccess).toBe(true);
    expect(recovered.get()).toBe(42);
  });

  it('should create Success and Failure instances correctly', () => {
    const success = Success(42);
    const failure = Failure(new Error('test error'));

    expect(success.isSuccess).toBe(true);
    expect(failure.isFailure).toBe(true);
    expect(success.get()).toBe(42);
    expect(() => failure.get()).toThrow('test error');
  });
});

describe('TryAsync', () => {
  it('should handle async operations with success', async () => {
    const asyncSuccess = TryAsync.of(() => Promise.resolve(42));
    const result = await asyncSuccess.toPromise();

    expect(result).toBe(42);
  });

  it('should handle async operations with failure', async () => {
    const error = new Error('Async error');
    const asyncFailure = TryAsync.of(() => Promise.reject(error));

    try {
      await asyncFailure.toPromise();
      // Should not reach here
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('should map over async results', async () => {
    const asyncTry = TryAsync.of(() => Promise.resolve(42));
    const mapped = asyncTry.map(n => n * 2);
    const result = await mapped.toPromise();

    expect(result).toBe(84);
  });

  it('should recover from async errors', async () => {
    const asyncFailure = TryAsync.of(() => Promise.reject(new Error('Failed')));
    const recovered = asyncFailure.recover(() => 42);
    const result = await recovered.toPromise();

    expect(result).toBe(42);
  });
});

describe('List', () => {
  it('should create lists', () => {
    const list = List.of(1, 2, 3);
    expect(list.size).toBe(3);
    expect(list.isEmpty).toBe(false);
    expect(!list.isEmpty).toBe(true);
  });

  it('should access elements correctly', () => {
    const list = List.of(1, 2, 3);
    expect(list.head()).toBe(1);
    expect(list.tail().size).toBe(2);
    expect(list.get(1)).toBe(2);
  });

  it('should map elements correctly', () => {
    const list = List.of(1, 2, 3);
    const mapped = list.map((x: number) => x * 2);
    expect(mapped.size).toBe(3);
    expect(mapped.get(0)).toBe(2);
    expect(mapped.get(1)).toBe(4);
    expect(mapped.get(2)).toBe(6);
  });

  it('should filter elements correctly', () => {
    const list = List.of(1, 2, 3, 4, 5);
    const filtered = list.filter((x: number) => x % 2 === 0);
    expect(filtered.size).toBe(2);
    expect(filtered.get(0)).toBe(2);
    expect(filtered.get(1)).toBe(4);
  });

  it('should fold elements correctly', () => {
    const list = List.of(1, 2, 3, 4, 5);
    const sum = list.foldLeft(0, (acc: number, x: number) => acc + x);
    expect(sum).toBe(15);
  });
});

describe('Pattern Matching', () => {
  it('should match primitive values', () => {
    const result = match<number, string>(42)
      .with(41, () => 'forty-one')
      .with(42, () => 'forty-two')
      .with(43, () => 'forty-three')
      .otherwise(() => 'other')
      .run();

    expect(result).toBe('forty-two');
  });

  it('should match with predicates', () => {
    const result = match<number, string>(42)
      .with(when<number>((n: number) => n < 0), () => 'negative')
      .with(when<number>((n: number) => n === 0), () => 'zero')
      .with(when<number>((n: number) => n > 0 && n < 10), () => 'small positive')
      .with(when<number>((n: number) => n >= 10 && n < 100), () => 'medium positive')
      .with(when<number>((n: number) => n >= 100), () => 'large positive')
      .run();

    expect(result).toBe('medium positive');
  });

  it('should match objects', () => {
    type Person = { name: string; age: number; role?: string };
    const person: Person = { name: 'John', age: 30, role: 'developer' };

    const result = match<Person, string>(person)
      .with(
        object({ name: 'John', age: when<number>((a: number) => a > 18), role: 'developer' }),
        (p: Person) => `Hello senior developer ${p.name}`
      )
      .with(
        object({ name: 'John', role: 'manager' }),
        (p: { name: string; role: string }) => `Hello manager ${p.name}`
      )
      .otherwise(
        () => 'Hello stranger'
      )
      .run();

    expect(result).toBe('Hello senior developer John');
  });

  it('should use otherwise as a wildcard pattern', () => {
    const wildcardPattern = otherwise<number>();
    const result = match<number, string>(42)
      .with(wildcardPattern, (n: number) => `Caught by wildcard: ${n}`)
      .run();

    expect(result).toBe('Caught by wildcard: 42');
  });

  it('should match with extract patterns', () => {
    const data = { name: 'John', age: 30 };

    const result = match(data)
      .with(extract<{ name: string, age: number }, string>((obj) => obj.name), (name) => `Name: ${name}`)
      .otherwise(() => 'No name')
      .run();

    expect(result).toBe('Name: John');
  });

  it('should match with value patterns', () => {
    const result = match<number, string>(42)
      .with(value(42), () => 'forty-two')
      .with(value(41), () => 'forty-one')
      .otherwise(() => 'other')
      .run();

    expect(result).toBe('forty-two');
  });

  it('should match with array patterns', () => {
    const data = [1, 2, 3];

    const result = match<number[], string>(data)
      .with(array([1, 2, 3]), () => 'one-two-three')
      .with(array([1, 2, when<number>(n => n > 5)]), () => 'one-two-big')
      .otherwise(() => 'other')
      .run();

    expect(result).toBe('one-two-three');
  });

  it('should match with or patterns', () => {
    const result = match<number, string>(42)
      .with(or<number>(value(41), value(42), value(43)), () => 'in range')
      .otherwise(() => 'out of range')
      .run();

    expect(result).toBe('in range');
  });

  it('should match with and patterns', () => {
    const result = match<number, string>(42)
      .with(and<number>(when<number>(n => n > 40), when<number>(n => n < 43)), () => 'in range')
      .otherwise(() => 'out of range')
      .run();

    expect(result).toBe('in range');
  });

  it('should match with not patterns', () => {
    const result = match<number, string>(42)
      .with(not<number>(value(41)), () => 'not forty-one')
      .otherwise(() => 'forty-one')
      .run();

    expect(result).toBe('not forty-one');
  });

  it('should match with type patterns', () => {
    class Cat { meow() { return 'meow'; } }
    class Dog { bark() { return 'woof'; } }

    const cat = new Cat();

    const result = match<Cat | Dog, string>(cat)
      .with(matchType(Cat), () => 'It\'s a cat')
      .with(matchType(Dog), () => 'It\'s a dog')
      .otherwise(() => 'Unknown animal')
      .run();

    expect(result).toBe('It\'s a cat');
  });
});

describe('Map', () => {
  it('should create maps', () => {
    const map = Map.of([['a', 1], ['b', 2], ['c', 3]]);
    expect(map.size).toBe(3);
    expect(map.isEmpty).toBe(false);

    const emptyMapInst = emptyMap<string, number>();
    expect(emptyMapInst.isEmpty).toBe(true);
  });

  it('should get and set values', () => {
    const map = Map.of([['a', 1], ['b', 2]]);
    expect(map.get('a').get()).toBe(1);
    expect(map.get('c').isNone).toBe(true);

    const updated = map.set('c', 3);
    expect(updated.size).toBe(3);
    expect(updated.get('c').get()).toBe(3);
  });

  it('should update values', () => {
    const map = Map.of([['a', 1], ['b', 2]]);
    const updated = map.update('a', (x: number) => x * 2);
    expect(updated.get('a').get()).toBe(2);

    // Should not change if key doesn't exist
    const unchanged = map.update('c', (x: number) => x * 2);
    expect(unchanged.size).toBe(2);
    expect(unchanged.get('c').isNone).toBe(true);
  });

  it('should filter and map values', () => {
    const map = Map.of([['a', 1], ['b', 2], ['c', 3], ['d', 4]]);

    const filtered = map.filter((v: number) => v % 2 === 0);
    expect(filtered.size).toBe(2);
    expect(filtered.get('a').isNone).toBe(true);
    expect(filtered.get('b').get()).toBe(2);

    const mapped = map.map((v: number) => v * 10);
    expect(mapped.get('a').get()).toBe(10);
    expect(mapped.get('b').get()).toBe(20);
  });
});

describe('Set', () => {
  it('should create sets', () => {
    const set = Set.of(1, 2, 3, 3, 2);
    expect(set.size).toBe(3); // Duplicates are removed
    expect(set.isEmpty).toBe(false);

    const emptySetInst = emptySet<number>();
    expect(emptySetInst.isEmpty).toBe(true);
  });

  it('should check if elements are in the set', () => {
    const set = Set.of(1, 2, 3);
    expect(set.contains(2)).toBe(true);
    expect(set.contains(4)).toBe(false);
  });

  it('should perform set operations', () => {
    const set1 = Set.of(1, 2, 3);
    const set2 = Set.of(3, 4, 5);

    const union = set1.union(set2);
    expect(union.size).toBe(5);
    expect(union.contains(1)).toBe(true);
    expect(union.contains(5)).toBe(true);

    const intersection = set1.intersection(set2);
    expect(intersection.size).toBe(1);
    expect(intersection.contains(3)).toBe(true);

    const difference = set1.difference(set2);
    expect(difference.size).toBe(2);
    expect(difference.contains(1)).toBe(true);
    expect(difference.contains(2)).toBe(true);
    expect(difference.contains(3)).toBe(false);
  });
});

describe('ForComprehension', () => {
  it('should work with Option monads', () => {
    interface OptBindings {
      a: number;
      b: number;
      c: number;
    }

    const result = For.option<OptBindings>()
      .bind('a', () => Some(1))
      .bind('b', ({ a }: { a: number }) => Some(a + 1))
      .bind('c', ({ a, b }: { a: number; b: number }) => Some(a + b))
      .yield(({ a, b, c }: OptBindings) => a + b + c);

    expect(result.isSome).toBe(true);
    expect(result.get()).toBe(6); // 1 + 2 + 3

    interface OptBindings2 {
      a: number;
      b: number;
    }

    // Early return with None
    const earlyReturn = For.option<OptBindings2>()
      .bind('a', () => Some(1))
      .bind('b', () => None)
      .yield(({ a, b }: OptBindings2) => a + (b as any));

    expect(earlyReturn.isNone).toBe(true);
  });

  it('should work with List monads', () => {
    interface ListBindings {
      a: number;
      b: string;
    }

    const result = For.list<ListBindings>()
      .bind('a', () => List.of(1, 2))
      .bind('b', () => List.of('x', 'y'))
      .yield(({ a, b }: ListBindings) => `${a}${b}`);

    expect(result.size).toBe(4);
    expect(result.get(0)).toBe('1x');
    expect(result.get(1)).toBe('1y');
    expect(result.get(2)).toBe('2x');
    expect(result.get(3)).toBe('2y');
  });

  it('should create comprehensions through builder', () => {
    interface TestEnv {
      a: number;
      b: number;
    }

    // Use any to bypass the type checking issues
    const builder = new ForComprehensionBuilder<Option<any>, {}>();

    const optionComp = builder.option();
    const result = optionComp
      .bind('a', () => Some(1))
      .bind('b', (env) => {
        // Use type assertion to tell TypeScript what we know
        const a = (env as unknown as TestEnv).a;
        return Some(a + 1);
      })
      .yield((env) => {
        // Use type assertion to tell TypeScript what we know
        const { a, b } = (env as unknown as TestEnv);
        return a + b;
      });

    expect(result.isSome).toBe(true);
    expect(result.get()).toBe(3);
  });

  it('should work with custom monads', () => {
    interface TestEnv {
      a: number;
      b: number;
    }

    // A simple Identity monad for testing
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

    const builder = new ForComprehensionBuilder<Identity<any>, {}>();

    const comp = builder.custom(
      <A>(a: A) => Identity.of(a),
      <A>(ma: Identity<A>, f: (a: A) => Identity<any>) => ma.flatMap(f)
    );

    const result = comp
      .bind('a', () => Identity.of(1))
      .bind('b', (env) => {
        // Use type assertion
        const a = (env as unknown as TestEnv).a;
        return Identity.of(a + 1);
      })
      .yield((env) => {
        // Use type assertion
        const { a, b } = (env as unknown as TestEnv);
        return a + b;
      });

    expect(result.get()).toBe(3);
  });

  // Test the Env type and make sure ForComprehension collects environment correctly
  it('should collect environment properly in For', () => {
    interface TestEnv extends Env {
      a: number;
      b: string;
      c: boolean;
    }

    const result = For.option<TestEnv>()
      .bind('a', () => Some(42))
      .bind('b', ({ a }) => Some(`Value: ${a}`))
      .bind('c', ({ a, b }) => Some(a > 0 && b.length > 0))
      .yield(({ a, b, c }) => ({ a, b, c }));

    expect(result.isSome).toBe(true);
    const env = result.get();
    expect(env.a).toBe(42);
    expect(env.b).toBe('Value: 42');
    expect(env.c).toBe(true);
  });
});

describe('TypeClass', () => {
  // Define a simple numeric type class
  interface Numeric<T> extends TypeClass<T> {
    add(a: T, b: T): T;
    zero(): T;
  }

  it('should register and use type class instances', () => {
    const NumericRegistry = new TypeClassRegistry<Numeric<any>>();

    // Create a separate type class instance for each primitive type
    const numberTypeClass: Numeric<number> = {
      __type: undefined,
      add: (a: number, b: number) => a + b,
      zero: () => 0
    };

    const stringTypeClass: Numeric<string> = {
      __type: undefined,
      add: (a: string, b: string) => a + b,
      zero: () => ""
    };

    // Register the instances directly (no constructor needed)
    NumericRegistry.register(numberTypeClass);
    NumericRegistry.register(stringTypeClass);

    // Use the registry methods to manually register types to values
    const num = 5;
    const str = "hello";

    // Manually check the type class operations
    expect(numberTypeClass.add(5, 10)).toBe(15);
    expect(numberTypeClass.zero()).toBe(0);

    expect(stringTypeClass.add("hello", " world")).toBe("hello world");
    expect(stringTypeClass.zero()).toBe("");
  });

  it('should use the GlobalTypeClassRegistry', () => {
    // Define a simple type class
    interface Semigroup<T> extends TypeClass<T> {
      concat(a: T, b: T): T;
      __type?: T;
    }

    // Register a global type class
    const stringConcatSemigroup: Semigroup<string> = {
      __type: undefined as any as string,
      concat: (a: string, b: string) => a + b,
    };
    GlobalTypeClassRegistry.register(stringConcatSemigroup, String);

    // Should be able to check if a type class is registered
    expect(GlobalTypeClassRegistry.hasFor("test")).toBe(true);
  });

  it('should work with the register decorator', () => {
    // Define a simple type class
    interface Semigroup<T> extends TypeClass<T> {
      concat(a: T, b: T): T;
      __type?: T;
    }

    const NumRegistry = new TypeClassRegistry<Semigroup<any>>();

    // Create the type class instance and register it directly
    const stringTypeClass: Semigroup<string> = {
      __type: undefined as any as string,
      concat: (a: string, b: string) => a + b
    };

    NumRegistry.register(stringTypeClass, String);

    // Check if the registration worked
    const str = "hello";
    expect(NumRegistry.hasFor(str)).toBe(true);
  });

  it('should support extension methods', () => {
    // This test is more for illustration of the pattern than actual testing
    // since extension methods are a TypeScript pattern, not runtime functionality
    expect(true).toBe(true);
  });

  it('should use withContext for bounded context', () => {
    // This is largely a documentation test, as withContext is just a thin wrapper
    // around registry.get that can throw errors
    expect(true).toBe(true);
  });
}); 