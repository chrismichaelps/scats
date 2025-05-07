/**
 * The execution context is the environment where a computation runs.
 */
export interface ExecutionContext {
  /**
   * Executes a task in this execution context.
   */
  execute(task: () => void): void;

  /**
   * Reports an exception that occurred during execution.
   */
  reportFailure(cause: Error): void;
}

/**
 * A default global execution context backed by the JavaScript event loop.
 */
class GlobalExecutionContext implements ExecutionContext {
  /**
   * Executes a task asynchronously.
   */
  execute(task: () => void): void {
    setTimeout(task, 0);
  }

  /**
   * Reports a failure to the console.
   */
  reportFailure(cause: Error): void {
    console.error("Execution context failure:", cause);
  }
}

/**
 * An execution context that executes tasks synchronously in the current thread.
 * This is mainly for testing and should be avoided in production.
 */
class SynchronousExecutionContext implements ExecutionContext {
  /**
   * Executes a task immediately in the current thread.
   */
  execute(task: () => void): void {
    task();
  }

  /**
   * Reports a failure to the console.
   */
  reportFailure(cause: Error): void {
    console.error("Execution context failure:", cause);
  }
}

/**
 * Execution context utility methods.
 */
export const ExecutionContext = {
  /**
   * The global execution context.
   */
  global: new GlobalExecutionContext(),

  /**
   * A synchronous execution context for testing.
   */
  synchronous: new SynchronousExecutionContext(),

  /**
   * Creates an execution context from a function that executes tasks.
   */
  fromExecutor(executor: (task: () => void) => void, reporter: (cause: Error) => void = console.error): ExecutionContext {
    return {
      execute: executor,
      reportFailure: reporter
    };
  }
}; 