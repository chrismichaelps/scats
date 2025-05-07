/**
 * Implementation of Scala-like resource management utilities (Using/Auto-Closeable).
 * 
 * @example
 * ```ts
 * import { Using } from 'scats/using';
 * 
 * // Create a resource that needs to be closed
 * class Resource implements Closeable {
 *   constructor(readonly id: string) {
 *     console.log(`Resource ${id} created`);
 *   }
 *   
 *   getData(): string {
 *     return `Data from resource ${this.id}`;
 *   }
 *   
 *   close(): void {
 *     console.log(`Resource ${this.id} closed`);
 *   }
 * }
 * 
 * // Use the resource and ensure it gets closed
 * const result = Using.resource(new Resource("123"), (resource) => {
 *   return resource.getData().toUpperCase();
 * });
 * 
 * // Use multiple resources
 * const result2 = Using.resources(
 *   [new Resource("A"), new Resource("B")],
 *   ([resourceA, resourceB]) => {
 *     return resourceA.getData() + " + " + resourceB.getData();
 *   }
 * );
 * ```
 */

import { Option, Some, None } from '../Option';
import { Try, Success, Failure } from '../Try';

/**
 * Interface for resources that can be closed or released.
 */
export interface Closeable {
  /**
   * Closes or releases the resource.
   */
  close(): void;
}

/**
 * Using is a utility class for working with resources that need
 * to be closed or released after use, like files or database connections.
 */
export const Using = {
  /**
   * Use a resource and ensure it is closed, even if an exception occurs.
   * 
   * @param resource The resource to use
   * @param f The function to apply to the resource
   * @returns The result of applying f to the resource
   */
  resource<R extends Closeable, A>(resource: R, f: (r: R) => A): Try<A> {
    try {
      const result = f(resource);
      return Success(result);
    } catch (e) {
      return Failure(e instanceof Error ? e : new Error(String(e)));
    } finally {
      try {
        resource.close();
      } catch (e) {
        console.error("Error closing resource:", e);
      }
    }
  },

  /**
   * Use multiple resources and ensure they are all closed, even if an exception occurs.
   * 
   * @param resources The resources to use
   * @param f The function to apply to the resources
   * @returns The result of applying f to the resources
   */
  resources<R extends Closeable, A>(resources: R[], f: (rs: R[]) => A): Try<A> {
    try {
      const result = f(resources);
      return Success(result);
    } catch (e) {
      return Failure(e instanceof Error ? e : new Error(String(e)));
    } finally {
      // Close resources in reverse order (last opened first closed)
      for (let i = resources.length - 1; i >= 0; i--) {
        try {
          resources[i].close();
        } catch (e) {
          console.error(`Error closing resource at index ${i}:`, e);
        }
      }
    }
  },

  /**
   * Use a resource asynchronously and ensure it is closed, even if an exception occurs.
   * 
   * @param resource The resource to use
   * @param f The function to apply to the resource
   * @returns A promise that resolves to the result of applying f to the resource
   */
  async resourceAsync<R extends Closeable, A>(resource: R, f: (r: R) => Promise<A>): Promise<A> {
    try {
      return await f(resource);
    } finally {
      try {
        resource.close();
      } catch (e) {
        console.error("Error closing resource:", e);
      }
    }
  },

  /**
   * Use multiple resources asynchronously and ensure they are all closed, even if an exception occurs.
   * 
   * @param resources The resources to use
   * @param f The function to apply to the resources
   * @returns A promise that resolves to the result of applying f to the resources
   */
  async resourcesAsync<R extends Closeable, A>(resources: R[], f: (rs: R[]) => Promise<A>): Promise<A> {
    try {
      return await f(resources);
    } finally {
      // Close resources in reverse order (last opened first closed)
      for (let i = resources.length - 1; i >= 0; i--) {
        try {
          resources[i].close();
        } catch (e) {
          console.error(`Error closing resource at index ${i}:`, e);
        }
      }
    }
  },

  /**
   * Creates a resource manager that can be used with a 'with' pattern.
   * 
   * @param acquire Function to acquire the resource
   * @param release Function to release the resource
   * @returns A resource manager
   */
  manager<R, A>(acquire: () => R, release: (r: R) => void): {
    use: <A>(f: (r: R) => A) => A;
    useAsync: <A>(f: (r: R) => Promise<A>) => Promise<A>;
  } {
    return {
      use<A>(f: (r: R) => A): A {
        const resource = acquire();
        try {
          return f(resource);
        } finally {
          release(resource);
        }
      },

      async useAsync<A>(f: (r: R) => Promise<A>): Promise<A> {
        const resource = acquire();
        try {
          return await f(resource);
        } finally {
          release(resource);
        }
      }
    };
  }
};

// Default export
export default Using; 