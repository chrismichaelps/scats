/**
 * Basic examples of using scats
 * Run with: npx ts-node examples/basic.ts
 */

import {
  // Core types
  Option, Some, None,
  // Additional imports
  Either, Left, Right,
  Try, Success, Failure, TryAsync,
  ExecutionContext,
  // Collections
  List, List as ListModule,
  Map as TMap, Map as MapModule,
  Set as TSet, Set as SetModule,
  ArraySeq,
  ArrayBuffer,
  // Pattern matching
  match, when, and, or, not, array, extract, Pattern,
  otherwise, value, object, type as matchType,
  // For comprehension
  For, Env, ForComprehensionBuilder, Monad,
  // Type classes
  TypeClass, TypeClassRegistry, extension,
  // Other features
  Tuple,
  Ordering,
  Using, Closeable
} from '../dist';

// Get empty instances from their respective modules
const emptyList = ListModule.empty;
const emptyMap = MapModule.empty;
const emptySet = SetModule.empty;

// ======= OPTION EXAMPLES =======
console.log('=== Option Examples ===');

const maybeNumber = Some(42);
const noNumber = None;

// Map and chain operations
console.log(
  maybeNumber
    .map(n => n * 2)
    .getOrElse(0)
); // 84

console.log(
  noNumber
    .map(n => n * 2)
    .getOrElse(0)
); // 0

// Creating from nullable values
const fromNullable = Option.fromNullable(Math.random() > 0.5 ? 'value' : null);
console.log(`fromNullable exists: ${fromNullable.isSome}`);

// ======= EITHER EXAMPLES =======
console.log('\n=== Either Examples ===');

// Basic Either usage
const rightValue = Right<number>(42);
const leftValue = Left<string, number>('error occurred');

// Map and chain operations
console.log(
  rightValue
    .map(n => n * 2)
    .fold(
      err => `Error: ${err}`,
      val => `Success: ${val}`
    )
); // "Success: 84"

console.log(
  leftValue
    .map(n => n * 2)
    .fold(
      err => `Error: ${err}`,
      val => `Success: ${val}`
    )
); // "Error: error occurred"

// Practical example: Safe division
function safeDivide(a: number, b: number): Either<string, number> {
  if (b === 0) {
    return Left('Division by zero');
  }
  return Right(a / b);
}

console.log('\n-- Safe Division Examples --');
console.log(
  safeDivide(10, 2)
    .map(result => `Result: ${result}`)
    .getOrElse('Error occurred')
); // "Result: 5"

console.log(
  safeDivide(10, 0)
    .map(result => `Result: ${result}`)
    .getOrElse('Error occurred')
); // "Error occurred"

// Chain (flatMap) operations
console.log('\n-- Chain Operations --');
const chainResult = safeDivide(10, 2)
  .flatMap(result => safeDivide(result, 2));

console.log(
  chainResult.fold(
    err => `Error: ${err}`,
    val => `Final result: ${val}`
  )
); // "Final result: 2.5"

// Pattern matching with Either
console.log('\n-- Pattern Matching with Either --');
const matchEither = (e: Either<string, number>): string => {
  return match<Either<string, number>, string>(e)
    .with(when(e => e.isRight), e => `Got right value: ${e.get()}`)
    .with(when(e => e.isLeft), e => `Got left value: ${e.getLeft()}`)
    .run();
};

console.log(matchEither(Right(42))); // "Got right value: 42"
console.log(matchEither(Left('error occurred'))); // "Got left value: error occurred"

// ======= TRY EXAMPLES =======
console.log('\n=== Try Examples ===');

// Success case
const jsonSuccess = Try.of(() => JSON.parse('{"value": 42}'));
console.log(
  jsonSuccess
    .map(obj => obj.value)
    .getOrElse('no value')
); // 42

// Failure case
const jsonFailure = Try.of(() => JSON.parse('invalid json'));
console.log(
  jsonFailure
    .map(obj => obj.value)
    .getOrElse('no value')
); // "no value"

// ======= LIST EXAMPLES =======
console.log('\n=== List Examples ===');

const numbers = List.of(1, 2, 3, 4, 5);

// Basic operations
console.log(`Head: ${numbers.head()}`);
console.log(`Tail size: ${numbers.tail().size}`);
console.log(`Is empty: ${numbers.isEmpty}`);

// Transformations
const doubled = numbers.map(n => n * 2);
console.log(`Doubled: ${doubled.toString()}`);

const evens = numbers.filter(n => n % 2 === 0);
console.log(`Evens: ${evens.toString()}`);

const sum = numbers.foldLeft(0, (acc, n) => acc + n);
console.log(`Sum: ${sum}`);

const product = numbers.foldRight(1, (n, acc) => n * acc);
console.log(`Product: ${product}`);

// ======= MAP EXAMPLES =======
console.log('\n=== Map Examples ===');

const users = TMap.of([
  ['alice', { name: 'Alice', age: 25 }],
  ['bob', { name: 'Bob', age: 30 }],
  ['charlie', { name: 'Charlie', age: 35 }]
]);

console.log(`Map size: ${users.size}`);
console.log(`Has bob: ${users.has('bob')}`);

const olderUsers = users.filter((user) => user.age > 27);
console.log(`Older users: ${olderUsers.size}`);
console.log(olderUsers.toString());

// ======= SET EXAMPLES =======
console.log('\n=== Set Examples ===');

const uniqueNumbers = TSet.of(1, 2, 3, 2, 1, 4, 5, 4);
console.log(`Set: ${uniqueNumbers.toString()}`);
console.log(`Set size: ${uniqueNumbers.size}`);
console.log(`Contains 3: ${uniqueNumbers.contains(3)}`);
console.log(`Contains 6: ${uniqueNumbers.contains(6)}`);

const moreNumbers = TSet.of(4, 5, 6, 7);
const union = uniqueNumbers.union(moreNumbers);
console.log(`Union: ${union.toString()}`);

const intersection = uniqueNumbers.intersection(moreNumbers);
console.log(`Intersection: ${intersection.toString()}`);

const difference = uniqueNumbers.difference(moreNumbers);
console.log(`Difference: ${difference.toString()}`);

// ======= PATTERN MATCHING EXAMPLES =======
console.log('\n=== Pattern Matching Examples ===');

// Value matching
const matchNumber = (num: number): string => {
  return match<number, string>(num)
    .with(1, () => 'one')
    .with(2, () => 'two')
    .with(3, () => 'three')
    .otherwise(() => 'other')
    .run();
};

console.log(`Match 2: ${matchNumber(2)}`);
console.log(`Match 5: ${matchNumber(5)}`);

// Object pattern matching
type Person = { name: string; age: number; role?: string };

const getPerson = (): Person => ({
  name: 'John',
  age: 30,
  role: 'developer'
});

const greeting = match<Person, string>(getPerson())
  .with(
    { name: 'John', age: when<number>((a) => a > 18), role: 'developer' },
    (person) => `Hello senior developer ${person.name}`
  )
  .with(
    { name: 'John', role: 'developer' },
    (person) => `Hello developer ${person.name}`
  )
  .with(
    { name: 'John' },
    (person) => `Hello ${person.name}`
  )
  .otherwise(() => 'Hello stranger')
  .run();

console.log(greeting);

// Option matching
const optionMatch = (opt: Option<number>): string => {
  return match<Option<number>, string>(opt)
    .with(when<Option<number>>(o => o.isSome), o => `Got value: ${o.getOrElse(0)}`)
    .with(when<Option<number>>(o => o.isNone), () => 'No value')
    .run();
};

console.log(optionMatch(Some(42)));
console.log(optionMatch(None));

// ======= FOR COMPREHENSION EXAMPLES =======
console.log('\n=== For Comprehension Examples ===');

// For Option
type OptBindings = {
  a: number;
  b: number;
  c: number;
};

const optionResult = For.option<OptBindings>()
  .bind('a', () => Some(1))
  .bind('b', ({ a }) => Some(a + 1))
  .bind('c', ({ a, b }) => Some(a + b))
  .yield(({ a, b, c }) => a + b + c);

console.log(`Option result: ${optionResult.getOrElse(0)}`);

// For List
type ListBindings = {
  a: number;
  b: string;
};

const cartesianProduct = For.list<ListBindings>()
  .bind('a', () => List.of(1, 2))
  .bind('b', () => List.of('x', 'y'))
  .yield(({ a, b }) => `${a}${b}`);

console.log(`List result: ${cartesianProduct.toString()}`);

// ======= ADDITIONAL EXAMPLES =======
console.log('\n=== Additional Examples ===');

// Success and Failure direct construction
console.log('\n-- Success and Failure --');
const directSuccess = Success(42);
const directFailure = Failure(new Error('Explicit error'));

console.log(`Direct Success: ${directSuccess.isSuccess}`);
console.log(`Direct Success value: ${directSuccess.get()}`);
console.log(`Direct Failure: ${directFailure.isFailure}`);
console.log(`Direct Failure recovers: ${directFailure.recover(() => 'recovered').get()}`);

// Advanced pattern matching
console.log('\n-- Advanced Pattern Matching --');

// Array patterns
const arrayExample = [1, 2, 3];
const arrayMatch = match(arrayExample)
  .with(array([1, 2, 3]), () => 'Exact array match')
  .with(array([1, 2, when(n => n > 2)]), () => 'Array with predicate')
  .otherwise(() => 'No match')
  .run();
console.log(`Array pattern: ${arrayMatch}`);

// Extract patterns
const person = { name: 'Alice', age: 28 };
const extractMatch = match(person)
  .with(extract(p => p.name), name => `Extracted name: ${name}`)
  .otherwise(() => 'No match')
  .run();
console.log(`Extract pattern: ${extractMatch}`);

// And, Or, Not patterns
const number = 42;
const complexMatch = match(number)
  .with(and(when(n => n > 40), when(n => n < 50)), () => 'Between 40 and 50')
  .with(or(when(n => n === 0), when(n => n === 100)), () => 'Either 0 or 100')
  .with(not(when(n => n < 0)), () => 'Not negative')
  .otherwise(() => 'No match')
  .run();
console.log(`Complex pattern: ${complexMatch}`);

// Custom pattern
const isEven: Pattern<number> = {
  match: (value: number) => ({
    matched: value % 2 === 0,
    extracted: value
  }),
};

const evenMatch = match(42)
  .with(isEven, (n) => `Even number: ${n}`)
  .otherwise(() => 'Odd number')
  .run();
console.log(`Custom pattern: ${evenMatch}`);

// ForComprehension components
console.log('\n-- ForComprehension Components --');

// Env example (interface with environment values)
interface ComplexEnv extends Env {
  x: number;
  y: string;
  z: boolean;
}

// Using ForComprehensionBuilder for custom comprehensions
console.log('Custom comprehension builder:');

// Creating a simple Identity monad
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

// Using the builder to create a custom comprehension
const builder = new ForComprehensionBuilder<Identity<any>, {}>();

const identityComp = builder.custom(
  <A>(a: A) => Identity.of(a),
  <A>(ma: Identity<A>, f: (a: A) => Identity<any>) => ma.flatMap(f)
);

const identityResult = identityComp
  .bind('x', () => Identity.of(10))
  .bind('y', (env) => {
    // Use type assertion
    const x = (env as unknown as { x: number }).x;
    return Identity.of(x * 2);
  })
  .yield((env) => {
    // Use type assertion
    const { x, y } = (env as unknown as { x: number, y: number });
    return `Result: ${x} + ${y} = ${x + y}`;
  });

console.log(identityResult.get());

// Empty collections
console.log('\n-- Empty Collections --');

const emptyListExample = emptyList<number>();
console.log(`Empty List: ${emptyListExample.isEmpty}`);
console.log(`Empty List + element: ${emptyListExample.prepend(1).toString()}`);

const emptyMapExample = emptyMap<string, number>();
console.log(`Empty Map: ${emptyMapExample.isEmpty}`);
console.log(`Empty Map + entry: ${emptyMapExample.set('one', 1).toString()}`);

const emptySetExample = emptySet<number>();
console.log(`Empty Set: ${emptySetExample.isEmpty}`);
console.log(`Empty Set + element: ${emptySetExample.add(1).toString()}`);

// TryAsync examples (at the end to avoid async issues)
console.log('\n-- TryAsync Examples --');

// Use a helper function to run async code in sequence
const runAsyncExamples = async () => {
  console.log('Running async examples...');

  const asyncSuccess = TryAsync.of(() => Promise.resolve(42));
  const result1 = await asyncSuccess
    .map(n => n * 2)
    .toPromise();
  console.log(`Async success result: ${result1}`);

  const asyncFailure = TryAsync.of(() => Promise.reject(new Error('Async error')));
  try {
    await asyncFailure.toPromise();
    console.log('This should not execute');
  } catch (err) {
    console.log(`Caught async error correctly`);
  }

  const recoveredResult = await asyncFailure
    .recover(() => 'recovered')
    .toPromise();
  console.log(`Async failure recovered: ${recoveredResult}`);

  console.log('Async examples completed.');
};

// Run the async examples and then complete
runAsyncExamples().then(() => {
  console.log('\nAll examples completed.');
});

// ======= TYPE CLASS EXAMPLES =======
console.log('\n=== Type Class Examples ===');

// Define a type class for numeric operations
interface NumericTypeClass<T> extends TypeClass<T> {
  add(a: T, b: T): T;
  zero(): T;
}

// Create instances for different types
const basicNumberNumeric: NumericTypeClass<number> = {
  __type: undefined as any as number,
  add: (a, b) => a + b,
  zero: () => 0
};

const basicStringNumeric: NumericTypeClass<string> = {
  __type: undefined as any as string,
  add: (a, b) => a + b,
  zero: () => ""
};

// Register instances in a registry
const basicRegistry = new TypeClassRegistry<NumericTypeClass<any>>();
basicRegistry.register(basicNumberNumeric, Number);
basicRegistry.register(basicStringNumeric, String);

// Using the registry
function sumWithTypeClass<T>(values: T[], registry: TypeClassRegistry<NumericTypeClass<any>>): T {
  if (values.length === 0) throw new Error("Cannot sum empty array");
  const numeric = registry.getFor(values[0]);
  return values.reduce((acc, val) => numeric.add(acc, val), numeric.zero());
}

console.log(`Sum numbers: ${sumWithTypeClass([1, 2, 3, 4], basicRegistry)}`);
console.log(`Concat strings: ${sumWithTypeClass(["a", "b", "c"], basicRegistry)}`);

// ======= TUPLE EXAMPLES =======
console.log('\n=== Tuple Examples ===');

// Creating tuples
const pair = Tuple.of(1, "hello");
const triple = Tuple.of(1, "hello", true);

console.log(`Pair: ${pair.toString()}`);
console.log(`Triple: ${triple.toString()}`);

// Accessing elements
console.log(`First of pair: ${pair._1}`);
console.log(`Second of pair: ${pair._2}`);
console.log(`Third of triple: ${triple._3}`);

// Tuple operations
const swapped = pair.swap();
console.log(`Swapped pair: ${swapped.toString()}`);

const mappedFirst = pair.map1(n => n * 2);
console.log(`Mapped first: ${mappedFirst.toString()}`);

// ======= ORDERING EXAMPLES =======
console.log('\n=== Ordering Examples ===');

const numbersToSort = [3, 1, 4, 1, 5, 9];
const sortedNumbers = [...numbersToSort].sort((a, b) => Ordering.number.compare(a, b));
console.log(`Sorted numbers: ${sortedNumbers}`);

const stringsToSort = ["banana", "apple", "cherry"];
const sortedStrings = [...stringsToSort].sort((a, b) => Ordering.string.compare(a, b));
console.log(`Sorted strings: ${sortedStrings}`);

// Custom ordering
type PersonWithAge = { name: string; age: number };
const peopleToSort = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];

const byAge = Ordering.by<PersonWithAge, number>(p => p.age);
const sortedByAge = [...peopleToSort].sort((a, b) => byAge.compare(a, b));
console.log(`Sorted by age: ${sortedByAge.map(p => `${p.name}(${p.age})`).join(", ")}`);

// ======= USING (RESOURCE MANAGEMENT) EXAMPLES =======
console.log('\n=== Using (Resource Management) Examples ===');

// Create a resource that needs to be closed
class Resource implements Closeable {
  constructor(readonly id: string) {
    console.log(`Resource ${this.id} created`);
  }

  getData(): string {
    return `Data from resource ${this.id}`;
  }

  close(): void {
    console.log(`Resource ${this.id} closed`);
  }
}

// Use a single resource
const singleResult = Using.resource(new Resource("123"), (resource) => {
  return resource.getData().toUpperCase();
});
console.log(`Single resource result: ${singleResult}`);

// Use multiple resources
const multiResult = Using.resources(
  [new Resource("A"), new Resource("B")],
  ([resourceA, resourceB]) => {
    return resourceA.getData() + " + " + resourceB.getData();
  }
);
console.log(`Multiple resources result: ${multiResult}`);

// ======= COLLECTIONS EXAMPLES =======
console.log('\n=== Collections Examples ===');

// ArraySeq examples (implements IndexedSeq)
const arraySeq = new ArraySeq([1, 2, 3, 4, 5]);
console.log(`ArraySeq: ${Array.from(arraySeq).join(', ')}`);
console.log(`Mapped ArraySeq: ${Array.from(arraySeq.map(x => x * 2)).join(', ')}`);
console.log(`Filtered ArraySeq: ${Array.from(arraySeq.filter(x => x % 2 === 0)).join(', ')}`);
const folded = arraySeq.foldLeft(0, (acc, x) => acc + x);
console.log(`Folded ArraySeq: ${folded}`);

// ArrayBuffer examples (implements Buffer)
const buffer = new ArrayBuffer<number>();
buffer.append(1).append(2).append(3);
console.log(`Buffer after appends: ${Array.from(buffer).join(', ')}`);
buffer.prepend(0);
console.log(`Buffer after prepend: ${Array.from(buffer).join(', ')}`);
buffer.clear();
console.log(`Buffer after clear: ${Array.from(buffer).join(', ')}`);

// ======= EXTENDED PATTERN MATCHING EXAMPLES =======
console.log('\n=== Extended Pattern Matching Examples ===');

// Using otherwise in pattern matching
const matchWithOtherwise = match(5)
  .with(when(x => x > 10), () => "Greater than 10")
  .otherwise(() => "10 or less")
  .run();
console.log(`Match with otherwise: ${matchWithOtherwise}`);

// Using value matcher
const matchWithValue = match("hello")
  .with(value("hello"), () => "It's hello")
  .with(value("world"), () => "It's world")
  .otherwise(() => "Something else")
  .run();
console.log(`Match with value: ${matchWithValue}`);

// Using object matcher
const obj = { name: "John", age: 30 };
const matchWithObject = match(obj)
  .with(object({ name: "John" }), () => "It's John")
  .with(object({ name: "Jane" }), () => "It's Jane")
  .otherwise(() => "Someone else")
  .run();
console.log(`Match with object: ${matchWithObject}`);

// Using type matcher with proper type predicates
class Animal { constructor(public name: string) { } }
class Dog extends Animal { bark() { return "woof"; } }
class Cat extends Animal { meow() { return "meow"; } }

const dog = new Dog("Rex");
const matchWithType = match<Animal>(dog)
  .with(when(x => x instanceof Dog), (x) => (x as Dog).bark())
  .with(when(x => x instanceof Cat), (x) => (x as Cat).meow())
  .otherwise(() => "Unknown animal")
  .run();
console.log(`Match with type: ${matchWithType}`);

// ======= EXTENDED TYPE CLASS EXAMPLES =======
console.log('\n=== Extended Type Class Examples ===');

// Create and register a numeric instance
const extendedNumberNumeric: NumericTypeClass<number> = {
  __type: undefined as any as number,
  add: (a, b) => a + b,
  zero: () => 0
};

const extendedRegistry = new TypeClassRegistry<NumericTypeClass<any>>();
extendedRegistry.register(extendedNumberNumeric, Number);

// Using the registry directly
const numeric = extendedRegistry.getFor(5);
console.log(`Add with type class: ${numeric.add(5, 10)}`);

// Using extension methods
const getNumberValue = (value: any) => value as number;
const addMethod = extension<number, NumericTypeClass<number>>(
  extendedRegistry,
  getNumberValue
)("add");

// ======= EXECUTION CONTEXT EXAMPLES =======
console.log('\n=== Execution Context Examples ===');

const ec = ExecutionContext.global;

// Execute a task
ec.execute(() => {
  console.log("Task executed in global execution context");
});

// Execute a task after delay
setTimeout(() => {
  ec.execute(() => {
    console.log("Delayed task executed");
  });
}, 1000); 