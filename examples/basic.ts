/**
 * Basic examples of using scats
 * Run with: npx ts-node examples/basic.ts
 */

import {
  // Core types
  Option, Some, None,
} from '../src/Option';
import {
  Either, Left, Right,
} from '../src/Either';
import {
  Try, Success, Failure, TryAsync
} from '../src/Try';
import {
  List, empty as emptyList,
} from '../src/List';
import {
  Map as TMap, empty as emptyMap,
} from '../src/Map';
import {
  Set as TSet, empty as emptySet,
} from '../src/Set';
import {
  match, when, and, or, not, array, extract, Pattern,
} from '../src/Match';
import {
  For, Env, ForComprehensionBuilder, Monad
} from '../src/ForComprehension';

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

const rightValue = Right<number, string>(42);
const leftValue = Left<string, number>('error');

// Map and fold
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
); // "Error: error"

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