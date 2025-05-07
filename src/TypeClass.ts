/**
 * Type class implementation that provides a way to add functionality to existing types.
 * This module enables ad-hoc polymorphism and interface extension through a pattern
 * similar to Scala's implicits and type classes.
 * 
 * @example
 * ```ts
 * import { TypeClass, TypeClassRegistry } from 'scats';
 * 
 * // Define a type class
 * interface Numeric<T> {
 *   add(a: T, b: T): T;
 *   zero(): T;
 *   fromNumber(n: number): T;
 * }
 * 
 * // Create a registry for the Numeric type class
 * const NumericRegistry = new TypeClassRegistry<Numeric<any>>();
 * 
 * // Register an instance for the number type
 * NumericRegistry.register<number>({
 *   add: (a, b) => a + b,
 *   zero: () => 0,
 *   fromNumber: n => n
 * });
 * 
 * // Register an instance for the string type
 * NumericRegistry.register<string>({
 *   add: (a, b) => a + b,
 *   zero: () => "",
 *   fromNumber: n => n.toString()
 * });
 * 
 * // Use the type class
 * function sum<T>(values: T[], numeric: Numeric<T>): T {
 *   return values.reduce((acc, val) => numeric.add(acc, val), numeric.zero());
 * }
 * 
 * // Automatically resolving type class instances
 * function sumWith<T>(values: T[]): T {
 *   const numeric = NumericRegistry.get<T>();
 *   return sum(values, numeric);
 * }
 * ```
 */

/**
 * Base interface for type classes
 */
export interface TypeClass<T> {
  // This interface serves as a marker for type classes that work with type T
  // Using nominal typing to force the use of the type parameter
  readonly __type?: T;
}

/**
 * Registry for type class instances
 */
export class TypeClassRegistry<TC extends TypeClass<any>> {
  private readonly instances = new Map<any, TC>();

  /**
   * Registers a type class instance for a specific type
   */
  register<T>(instance: TC & TypeClass<T>, type?: { new(...args: any[]): T }): void {
    const key = type || this.typeKey(instance);
    this.instances.set(key, instance);
  }

  /**
   * Gets a type class instance for a specific type
   * @throws Error if no instance is found
   */
  get<T>(): TC & TypeClass<T> {
    // In a real implementation, this would do more sophisticated type resolution
    // based on compile-time type information or runtime checks.
    // TypeScript doesn't provide a way to get a type at runtime, so this is a limitation.
    throw new Error("Type class instance not found. Use getFor instead.");
  }

  /**
   * Gets a type class instance for a specific value
   * @throws Error if no instance is found
   */
  getFor<T>(value: T): TC & TypeClass<T> {
    const constructor = (value as any)?.constructor;
    if (constructor && this.instances.has(constructor)) {
      return this.instances.get(constructor) as TC & TypeClass<T>;
    }

    for (const [key, instance] of this.instances.entries()) {
      if (this.isInstanceOf(value, key)) {
        return instance as TC & TypeClass<T>;
      }
    }

    throw new Error(`Type class instance not found for ${value}`);
  }

  /**
   * Checks if an instance exists for a specific type
   */
  has<T>(type: { new(...args: any[]): T }): boolean {
    return this.instances.has(type);
  }

  /**
   * Checks if an instance exists for a specific value
   */
  hasFor<T>(value: T): boolean {
    const constructor = (value as any)?.constructor;
    if (constructor && this.instances.has(constructor)) {
      return true;
    }

    for (const key of this.instances.keys()) {
      if (this.isInstanceOf(value, key)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets a type key for a type class instance
   */
  private typeKey<T>(instance: TC & TypeClass<T>): any {
    // This is a limitation in TypeScript - we can't get the real type
    // Instead, we use the instance itself as a key
    return instance;
  }

  /**
   * Checks if a value is an instance of a type
   */
  private isInstanceOf(value: any, type: any): boolean {
    // Handle primitive types
    if (typeof value === 'number' && type === Number) return true;
    if (typeof value === 'string' && type === String) return true;
    if (typeof value === 'boolean' && type === Boolean) return true;

    // Handle class instances
    if (typeof type === 'function') {
      return value instanceof type;
    }

    return false;
  }
}

/**
 * Decorator for registering type class instances
 */
export function register<TC extends TypeClass<any>>(registry: TypeClassRegistry<TC>) {
  return function <T extends TC>(target: T): void {
    registry.register(target);
  };
}

/**
 * Extension method factory for type classes
 */
export function extension<T, TC extends TypeClass<T>>(
  registry: TypeClassRegistry<TC>,
  getForValue: (value: any) => T
) {
  return function <K extends keyof TC>(methodName: K): (...args: any[]) => any {
    return function (this: any, ...args: any[]): any {
      const instance = registry.getFor<T>(this);
      const value = getForValue(this);
      return (instance[methodName] as any)(value, ...args);
    };
  };
}

/**
 * Context bound implementation that allows using type classes with a specific type
 */
export function withContext<T, TC extends TypeClass<T>>(
  registry: TypeClassRegistry<TC>,
  action: (instance: TC) => void
): void {
  const instance = registry.get<T>();
  action(instance);
}

/**
 * A registry for all type classes
 */
export const GlobalTypeClassRegistry = new TypeClassRegistry<TypeClass<any>>(); 