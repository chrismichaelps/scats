/**
 * scats - Scala-like functional programming patterns for TypeScript
 *
 * This library brings Scala-inspired functional programming concepts to TypeScript,
 * providing a type-safe and ergonomic way to write functional code in TypeScript.
 */

// Core data types
export {
  Option, Some, None,
  // We need to explicitly exclude these from Option.ts
  // as they are forward declarations that conflict with Either.ts
} from './Option';

export {
  Either, Left, Right
} from './Either';

export {
  Try, Success, Failure, TryAsync
} from './Try';

export {
  ExecutionContext
} from './ExecutionContext';

// Collections
export { List } from './List';
export { Map } from './Map';
export { Set } from './Set';
export * from './collections/Iterable';
export type { Seq, LinearSeq, IndexedSeq, MutableIndexedSeq, Buffer } from './collections/Seq';
export { ArraySeq } from './collections/ArraySeq';
export { ArrayBuffer } from './collections/ArrayBuffer';

// LazyList for infinite sequences and lazy evaluation
export { LazyList } from './LazyList';


// Vector for efficient indexed sequences
export { Vector } from './vector';

// Pattern matching
export {
  match, when, otherwise, extract, value, object,
  array, or, and, not, type
} from './Match';
export type { Pattern } from './Match';

// For-comprehensions
export {
  For, ForComprehension, ForComprehensionBuilder
} from './ForComprehension';
export type { Monad, Env } from './ForComprehension';

// Type classes
export type { TypeClass } from './TypeClass';
export {
  TypeClassRegistry, GlobalTypeClassRegistry,
  register, extension, withContext
} from './TypeClass';

// Tuples
export * from './tuple';

// Ordering
export * from './ordering';

// Resource management
export * from './using';

// Monads (including new Reader monad)
export * from './monads';
