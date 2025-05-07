<div align="center">
  <img src="public/scats-logo.png" alt="Scats Logo" width="400"  />
</div>

<div align="center">  
  <img src="https://img.shields.io/npm/v/sca-ts" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/sca-ts" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/chrismichaelps/sca-ts?color=blue" alt="license" />
  <img src="https://img.shields.io/github/stars/chrismichaelps/sca-ts?style=social" alt="stars" />
</div>

A comprehensive TypeScript library bringing Scala's powerful functional programming paradigms to JavaScript/TypeScript, featuring immutable collections, monads, pattern matching, and more

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Development](#development)
  - [Setup](#setup)
- [Getting Started](#getting-started)
  - [Option](#option-handling-nullable-values)
  - [Either](#either-handling-successfailure)
  - [Try](#try-handling-exceptions)
  - [Pattern Matching](#pattern-matching)
  - [Immutable Collections](#immutable-collections)
  - [LazyList](#lazylist)
  - [Vector](#vector)
  - [For-Comprehensions](#for-comprehensions)
  - [Type Classes](#type-classes)
  - [Tuples](#tuples)
  - [Ordering](#ordering)
  - [Resource Management](#resource-management)
  - [State Monad](#state-monad)
  - [Writer Monad](#writer-monad)

## Features

- **Algebraic Data Types** (ADTs) via tagged unions
- **Pattern matching** inspired by Scala 3
- **Immutable collections** (List, Map, Set)
- **Lazy evaluation** with LazyList
- **Efficient indexed sequences** with Vector
- **Option, Either, Try** containers
- **For-comprehensions** for monadic composition
- **Typeclasses** with extension methods
- **Tuples** with Tuple2 and Tuple3 implementations
- **Ordering** for comparison operations
- **Resource management** with Using pattern
- **Monads** including State and Writer

## Installation

### npm

```bash
npm install sca-ts
```

### yarn

```bash
yarn add sca-ts
```

### pnpm

```bash
pnpm add sca-ts
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run examples
npm run example

# Run tests
npm run test
```

## Getting Started

### Option: Handling nullable values

```typescript
import { Option, Some, None } from "sca-ts";

// Creating options
const a = Some(42);
const b = None;
const c = Option.fromNullable(maybeNull);

// Using options
const result = a
  .map((n) => n * 2)
  .flatMap((n) => (n > 50 ? Some(n) : None))
  .getOrElse(0);
```

### Either: Handling success/failure

```typescript
import { Either, Left, Right } from "sca-ts";

// Creating eithers
const success = Right(42);
const failure = Left(new Error("Something went wrong"));

// Using eithers
const result = success
  .map((n) => n * 2)
  .fold(
    (err) => `Error: ${err.message}`,
    (value) => `Success: ${value}`
  );
```

### Try: Handling exceptions

```typescript
import { Try, Success, Failure, TryAsync } from "sca-ts";

// Synchronous Try
const jsonResult = Try.of(() => JSON.parse(jsonString))
  .map((data) => data.value)
  .recover((err) => "default value")
  .get();

// Asynchronous Try
const asyncResult = await TryAsync.of(async () => {
  const response = await fetch("https://api.example.com");
  return response.json();
})
  .map((data) => data.value)
  .recover((err) => "error occurred")
  .toPromise();
```

### Pattern Matching

```typescript
import {
  match,
  when,
  otherwise,
  extract,
  value,
  array,
  or,
  and,
  not,
  type as matchType,
  object,
} from "sca-ts";

// Simple value matching
const result = match(42)
  .with(1, () => "one")
  .with(2, () => "two")
  .with(
    when((n) => n > 10),
    (n) => `greater than 10: ${n}`
  )
  .otherwise(() => "default case")
  .run();

// Object pattern matching
const person = { name: "John", age: 30 };
const greeting = match(person)
  .with(
    object({ name: "John", age: when<number>((a) => a > 18) }),
    () => "Hello Mr. John"
  )
  .with(object({ name: "John" }), () => "Hello John")
  .otherwise(() => "Hello stranger")
  .run();

// Advanced pattern matching
// Extract pattern
match(person)
  .with(
    extract((p) => p.name),
    (name) => `Name is: ${name}`
  )
  .otherwise(() => "No match")
  .run();

// Array pattern
match([1, 2, 3])
  .with(array([1, 2, 3]), () => "exact match")
  .with(array([1, when((n) => n > 1), 3]), () => "pattern match")
  .otherwise(() => "no match")
  .run();

// Combining patterns with or, and, not
match(42)
  .with(or(value(41), value(42), value(43)), () => "one of 41, 42, 43")
  .with(
    and(
      when((n) => n > 40),
      when((n) => n < 50)
    ),
    () => "between 40 and 50"
  )
  .with(not(value(100)), () => "anything but 100")
  .otherwise(() => "no match")
  .run();

// Type matching
class Cat {}
class Dog {}
match(new Cat())
  .with(matchType(Cat), () => "It's a cat")
  .with(matchType(Dog), () => "It's a dog")
  .otherwise(() => "unknown animal")
  .run();
```

### Immutable Collections

```typescript
import { List, Map, Set, ArraySeq, ArrayBuffer } from "sca-ts";

// List
const numbers = List.of(1, 2, 3, 4, 5);
const doubled = numbers.map((n) => n * 2);
const sum = numbers.foldLeft(0, (acc, n) => acc + n);
const evens = numbers.filter((n) => n % 2 === 0);

// Map
const userMap = Map.of([
  ["user1", { name: "Alice", age: 25 }],
  ["user2", { name: "Bob", age: 30 }],
]);
const hasUser = userMap.has("user1");
const olderUsers = userMap.filter((user) => user.age > 25);

// Set
const uniqueNumbers = Set.of(1, 2, 3, 2, 1);
const union = uniqueNumbers.union(Set.of(3, 4, 5));
const intersection = uniqueNumbers.intersection(Set.of(2, 3, 4));
const difference = uniqueNumbers.difference(Set.of(2, 3));

// ArraySeq (IndexedSeq)
const seq = new ArraySeq([1, 2, 3, 4, 5]);
const mappedSeq = seq.map((x) => x * 2);
console.log(Array.from(mappedSeq).join(", ")); // "2, 4, 6, 8, 10"

// ArrayBuffer (mutable Buffer)
const buffer = new ArrayBuffer<number>();
buffer.append(1).append(2).append(3);
console.log(Array.from(buffer).join(", ")); // "1, 2, 3"
buffer.prepend(0);
console.log(Array.from(buffer).join(", ")); // "0, 1, 2, 3"
```

### LazyList

```typescript
import { LazyList } from "sca-ts";

// Creating a LazyList
const numbers = LazyList.of(1, 2, 3, 4, 5);

// Creating an infinite sequence of numbers
const naturals = LazyList.from(1).iterate((n) => n + 1);

// Taking only what you need
const first10 = naturals.take(10).toArray(); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Lazy transformation
const evenSquares = naturals
  .filter((n) => n % 2 === 0) // Only even numbers
  .map((n) => n * n) // Square them
  .take(5) // Take first 5
  .toArray(); // [4, 16, 36, 64, 100]

// Generate a range of numbers
const range = LazyList.range(1, 10); // 1 to 9

// Create from iterable
const fromArray = LazyList.from([1, 2, 3]);

// Creating an infinite stream with a generator function
const randomNumbers = LazyList.continually(() => Math.random())
  .take(3)
  .toArray(); // Three random numbers

// Iterate from a seed value
const powers = LazyList.iterate(1, (n) => n * 2)
  .take(5)
  .toArray(); // [1, 2, 4, 8, 16]
```

### Vector

```typescript
import { Vector } from "sca-ts";

// Creating a Vector
const vec = Vector.of(1, 2, 3, 4, 5);

// Accessing elements (constant time)
const third = vec.apply(2); // 3
const maybeValue = vec.get(10); // None (out of bounds)

// Modifying elements
const updated = vec.updated(2, 10); // Vector(1, 2, 10, 4, 5)

// Adding elements
const appended = vec.appended(6); // Vector(1, 2, 3, 4, 5, 6)
const prepended = vec.prepended(0); // Vector(0, 1, 2, 3, 4, 5)

// Combining vectors
const combined = vec.appendAll(Vector.of(6, 7, 8)); // Vector(1, 2, 3, 4, 5, 6, 7, 8)

// Transforming vectors
const doubled = vec.map((n) => n * 2); // Vector(2, 4, 6, 8, 10)
const even = vec.filter((n) => n % 2 === 0); // Vector(2, 4)

// Flattening
const vectors = Vector.of(Vector.of(1, 2), Vector.of(3, 4));
const flattened = vectors.flatMap((v) => v); // Vector(1, 2, 3, 4)

// Static constructors
const empty = Vector.empty<number>(); // Empty vector
const fromArray = Vector.from([1, 2, 3]); // Vector from array
```

### For-Comprehensions

```typescript
import { For, Some, None, List, ForComprehensionBuilder, Monad } from "sca-ts";

// Option comprehension
const optionResult = For.option<{ a: number; b: number; c: number }>()
  .bind("a", () => Some(1))
  .bind("b", ({ a }) => Some(a + 1))
  .bind("c", ({ a, b }) => Some(a + b))
  .yield(({ a, b, c }) => a + b + c); // Some(6)

// List comprehension
const matrix = For.list<{ row: number; col: string }>()
  .bind("row", () => List.of(1, 2, 3))
  .bind("col", () => List.of("A", "B"))
  .yield(({ row, col }) => `${row}${col}`); // List(1A, 1B, 2A, 2B, 3A, 3B)

// Custom monad example
class Identity<A> implements Monad<A> {
  constructor(private readonly value: A) {}

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
  .bind("x", () => Identity.of(10))
  .bind("y", (env) => Identity.of((env as any).x * 2))
  .yield((env) => (env as any).x + (env as any).y); // Identity(30)
```

### Type Classes

```typescript
import {
  TypeClass,
  TypeClassRegistry,
  register,
  extension,
  withContext,
} from "sca-ts";

// Define a type class
interface Numeric<T> extends TypeClass<T> {
  add(a: T, b: T): T;
  zero(): T;
}

// Create instances for different types
const numberNumeric: Numeric<number> = {
  __type: undefined as any as number,
  add: (a, b) => a + b,
  zero: () => 0,
};

const stringNumeric: Numeric<string> = {
  __type: undefined as any as string,
  add: (a, b) => a + b,
  zero: () => "",
};

// Register instances in a registry
const registry = new TypeClassRegistry<Numeric<any>>();
registry.register(numberNumeric, Number);
registry.register(stringNumeric, String);

// Using the registry
function sum<T>(values: T[], registry: TypeClassRegistry<Numeric<any>>): T {
  if (values.length === 0) throw new Error("Cannot sum empty array");
  const numeric = registry.getFor(values[0]);
  return values.reduce((acc, val) => numeric.add(acc, val), numeric.zero());
}

// Example usage
console.log(sum([1, 2, 3, 4], registry)); // 10
console.log(sum(["a", "b", "c"], registry)); // "abc"

// Using extension methods
const getNumberValue = (value: any) => value as number;
const addMethod = extension<number, Numeric<number>>(
  registry,
  getNumberValue
)("add");

// Using context bounds
withContext<number, Numeric<number>>(registry, (numeric) => {
  const result = numeric.add(5, 10);
  console.log(result); // 15
});

// Using the registry directly
const numeric = registry.getFor(5);
console.log(`Add with type class: ${numeric.add(5, 10)}`); // Add with type class: 15
```

### Tuples

```typescript
import { Tuple, Tuple2, Tuple3 } from "sca-ts";

// Creating tuples
const pair = Tuple.of(1, "hello");
const triple = Tuple.of(1, "hello", true);

// Accessing elements
const first = pair._1; // 1
const second = pair._2; // "hello"
const third = triple._3; // true

// Destructuring
const [num, str] = pair;
const [x, y, z] = triple;

// Tuple operations
const swapped = pair.swap(); // Tuple2("hello", 1)
const mappedFirst = pair.map1((n) => n * 2); // Tuple2(2, "hello")
const mappedSecond = pair.map2((s) => s.toUpperCase()); // Tuple2(1, "HELLO")
const mapped = triple.map(
  (n) => n * 2,
  (s) => s.toUpperCase(),
  (b) => !b
); // Tuple3(2, "HELLO", false)

// Creating tuples from arrays
const pairFromArray = Tuple.fromArray2([1, "hello"]);
const tripleFromArray = Tuple.fromArray3([1, "hello", true]);

// Creating a tuple from a Map entry
const entry: [string, number] = ["key", 123];
const entryTuple = Tuple.fromEntry(entry); // Tuple2("key", 123)
```

### Ordering

```typescript
import { Ordering } from "sca-ts";

// Using built-in orderings
const numbers = [3, 1, 4, 1, 5, 9];
const sortedNumbers = [...numbers].sort((a, b) =>
  Ordering.number.compare(a, b)
);
// sortedNumbers is [1, 1, 3, 4, 5, 9]

const strings = ["banana", "apple", "cherry"];
const sortedStrings = [...strings].sort((a, b) =>
  Ordering.string.compare(a, b)
);
// sortedStrings is ["apple", "banana", "cherry"]

// Finding min/max values
const min = Ordering.number.min(10, 5); // 5
const max = Ordering.number.max(10, 5); // 10

// Creating a custom ordering
type Person = { name: string; age: number };
const people = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];

// Order by age
const byAge = Ordering.by<Person, number>((p) => p.age);
const sortedByAge = [...people].sort((a, b) => byAge.compare(a, b));
// First person is Bob (age 25)

// Order by name
const byName = Ordering.by<Person, string>((p) => p.name);
const sortedByName = [...people].sort((a, b) => byName.compare(a, b));
// First person is Alice

// Reverse ordering
const descendingOrder = Ordering.number.reverse();
const sortedDesc = [...numbers].sort((a, b) => descendingOrder.compare(a, b));
// sortedDesc is [9, 5, 4, 3, 1, 1]

// Chaining orderings (e.g., sort by lastname, then by firstname)
const byLastname = Ordering.by<Person, string>((p) => p.lastname);
const byFirstname = Ordering.by<Person, string>((p) => p.firstname);
const byLastThenFirst = byLastname.andThen(byFirstname);
```

### Resource Management

```typescript
import { Using, Closeable, Success } from "sca-ts";

// Create a resource that needs to be closed
class Resource implements Closeable {
  constructor(readonly id: string) {
    console.log(`Resource ${id} created`);
  }

  getData(): string {
    return `Data from resource ${this.id}`;
  }

  close(): void {
    console.log(`Resource ${id} closed`);
  }
}

// Use a single resource and ensure it gets closed
const result = Using.resource(new Resource("123"), (resource) => {
  return resource.getData().toUpperCase();
});
// Result is: Success(DATA FROM RESOURCE 123)
// resource.close() is guaranteed to be called, even if an exception is thrown

// Using multiple resources
const multiResult = Using.resources(
  [new Resource("A"), new Resource("B")],
  ([resourceA, resourceB]) => {
    return resourceA.getData() + " + " + resourceB.getData();
  }
);
// Result is: Success(Data from resource A + Data from resource B)
// Both resources are closed in reverse order (B then A)
```

### State Monad

```typescript
import { State } from "sca-ts";

// Simple counter using State monad
const increment = State.modify<number>((n) => n + 1);
const getCount = State.get<number>();

// Combining state operations
const counter = increment
  .flatMap(() => increment)
  .flatMap(() => increment)
  .flatMap(() => getCount);

const [count, finalState] = counter.run(0);
// count: 3, finalState: 3

// More complex example: implementing a stack
type Stack = number[];

// Define stack operations
const push = (n: number) => State.modify<Stack>((stack) => [...stack, n]);
const pop = State.modify<Stack>((stack) => {
  const newStack = [...stack];
  newStack.pop();
  return newStack;
});
const peek = State.gets<Stack, number | undefined>(
  (stack) => stack[stack.length - 1]
);

// Use the operations in a computation
const stackOperations = push(1)
  .flatMap(() => push(2))
  .flatMap(() => push(3))
  .flatMap(() => peek)
  .flatMap((top) => pop.map(() => top));

const [topValue, resultStack] = stackOperations.run([]);
// topValue: 3, resultStack: [1, 2]

// Using eval and exec
const result = State.of<number, string>("hello").eval(42); // "hello"
const newState = State.put<number>(100).exec(42); // 100
```

### Writer Monad

```typescript
import { Writer, Monoids } from "sca-ts";

// Simple logging with Writer monad
const logNumber = (n: number) =>
  Writer.tell<string>(`Processing ${n}`).flatMap(
    () => Writer.of(n * 2, Monoids.string),
    Monoids.string
  );

const result = logNumber(5).flatMap(
  (n) =>
    Writer.tell<string>(`Result is ${n}`).flatMap(
      () => Writer.of(n, Monoids.string),
      Monoids.string
    ),
  Monoids.string
);

const [value, logs] = result.run();
// value: 10, logs: "Processing 5Result is 10"

// Using array logs for structured logging
type StringArray = string[];

const add = (n: number) => Writer.withArray<string, number>(n, [`add(${n})`]);

const calculation = add(5)
  .flatMap(
    (n) =>
      add(10).flatMap(
        (m) => Writer.withArray<string, number>(n + m, [`sum(${n}, ${m})`]),
        Monoids.array<string>()
      ),
    Monoids.array<string>()
  )
  .flatMap(
    (n) => Writer.withArray<string, number>(n * 2, [`double(${n})`]),
    Monoids.array<string>()
  );

const [calcResult, calcLogs] = calculation.run();
// calcResult: 30, calcLogs: ['add(5)', 'add(10)', 'sum(5, 10)', 'double(15)']
```

## **:handshake: Contributing**

- Fork it!
- Create your feature branch: `git checkout -b my-new-feature`
- Commit your changes: `git commit -am 'Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request

---

### **:busts_in_silhouette: Credits**

- [Chris Michael](https://github.com/chrismichaelps) (Project Leader, and Developer)

---

### **:anger: Troubleshootings**

This is just a personal project created for study / demonstration purpose and to simplify my working life, it may or may
not be a good fit for your project(s).

---

### **:heart: Show your support**

Please :star: this repository if you like it or this project helped you!\
Feel free to open issues or submit pull-requests to help me improving my work.

<p>
  <a href="https://www.buymeacoffee.com/chrismichael" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" />
  </a>
  <a href="https://paypal.me/chrismperezsantiago" target="_blank">
    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" style="height: 60px !important;" />
  </a>
</p>

---

### **:robot: Author**

_*Chris M. Perez*_

> You can follow me on
> [github](https://github.com/chrismichaelps)&nbsp;&middot;&nbsp;[twitter](https://twitter.com/Chris5855M)

---

Copyright ©2025 [scats](https://github.com/chrismichaelps/scats).
