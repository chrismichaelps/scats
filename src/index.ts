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
export { Seq, LinearSeq, IndexedSeq, MutableIndexedSeq, Buffer } from './collections/Seq';
export { ArraySeq } from './collections/ArraySeq';
export { ArrayBuffer } from './collections/ArrayBuffer';

// Pattern matching
export {
  match, when, otherwise, extract, value, object,
  array, or, and, not, type, Pattern
} from './Match';

// For-comprehensions
export {
  For, ForComprehension, ForComprehensionBuilder, Monad, Env
} from './ForComprehension';

// Type classes
export {
  TypeClass, TypeClassRegistry, GlobalTypeClassRegistry,
  register, extension, withContext
} from './TypeClass'; 
// Tuples
export * from './tuple';

// Ordering
export * from './ordering';

// Resource management
export * from './using';

// Monads
export * from './monads';
