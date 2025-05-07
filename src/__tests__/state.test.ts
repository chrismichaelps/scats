import { describe, expect, it } from 'vitest';
import { State, StateMonad } from '../monads/state';

describe('State Monad', () => {
  describe('constructors', () => {
    it('should create a State from of() constructor', () => {
      const state = State.of<number, string>('value');
      expect(state).toBeInstanceOf(StateMonad);

      const [result, nextState] = state.run(42);
      expect(result).toBe('value');
      expect(nextState).toBe(42);
    });

    it('should get the current state', () => {
      const state = State.get<number>();
      expect(state).toBeInstanceOf(StateMonad);

      const [result, nextState] = state.run(42);
      expect(result).toBe(42);
      expect(nextState).toBe(42);
    });

    it('should put a new state', () => {
      const state = State.put<number>(100);
      expect(state).toBeInstanceOf(StateMonad);

      const [result, nextState] = state.run(42);
      expect(result).toBeUndefined();
      expect(nextState).toBe(100);
    });

    it('should modify the state', () => {
      const state = State.modify<number>(n => n * 2);
      expect(state).toBeInstanceOf(StateMonad);

      const [result, nextState] = state.run(42);
      expect(result).toBeUndefined();
      expect(nextState).toBe(84);
    });

    it('should get a derived value from the state', () => {
      const state = State.gets<number, string>(n => `The state is: ${n}`);
      expect(state).toBeInstanceOf(StateMonad);

      const [result, nextState] = state.run(42);
      expect(result).toBe('The state is: 42');
      expect(nextState).toBe(42);
    });
  });

  describe('operations', () => {
    it('should map results correctly', () => {
      const state = State.of<number, string>('hello').map(s => s.toUpperCase());

      const [result, nextState] = state.run(42);
      expect(result).toBe('HELLO');
      expect(nextState).toBe(42);
    });

    it('should flat map correctly', () => {
      const state = State.of<number, string>('hello').flatMap(
        s => State.of<number, string>(s.toUpperCase())
      );

      const [result, nextState] = state.run(42);
      expect(result).toBe('HELLO');
      expect(nextState).toBe(42);
    });

    it('should chain multiple operations', () => {
      const state = State.of<number, string>('hello')
        .flatMap(s => State.of<number, string>(s + ' world'))
        .flatMap(s => State.of<number, string>(s.toUpperCase()));

      const [result, nextState] = state.run(42);
      expect(result).toBe('HELLO WORLD');
      expect(nextState).toBe(42);
    });

    it('should work with the state', () => {
      const state = State.of<number, string>('count: ')
        .flatMap(s => State.gets<number, string>(n => s + n))
        .flatMap(s => State.modify<number>(n => n + 1).map(() => s));

      const [result, nextState] = state.run(42);
      expect(result).toBe('count: 42');
      expect(nextState).toBe(43);
    });

    it('should transform both result and state using bimap', () => {
      const state = State.of<number, string>('hello').bimap(
        s => s.toUpperCase(),
        n => n * 2
      );

      const [result, nextState] = state.run(42);
      expect(result).toBe('HELLO');
      expect(nextState).toBe(84);
    });
  });

  describe('evaluation', () => {
    it('should evaluate to result', () => {
      const state = State.of<number, string>('hello');

      const result = state.eval(42);
      expect(result).toBe('hello');
    });

    it('should execute to final state', () => {
      const state = State.put<number>(100);

      const finalState = state.exec(42);
      expect(finalState).toBe(100);
    });
  });

  describe('practical examples', () => {
    it('should implement a simple counter', () => {
      // Define counter operations
      const increment = State.modify<number>(n => n + 1);
      const getCount = State.get<number>();

      // Use the operations in a computation
      const computation = increment
        .flatMap(() => increment)
        .flatMap(() => increment)
        .flatMap(() => getCount);

      const [count, finalState] = computation.run(0);
      expect(count).toBe(3);
      expect(finalState).toBe(3);
    });

    it('should implement a simple stack', () => {
      type Stack = number[];

      // Define stack operations
      const push = (n: number) => State.modify<Stack>(stack => [...stack, n]);
      const pop = State.modify<Stack>(stack => {
        const newStack = [...stack];
        newStack.pop();
        return newStack;
      });
      const peek = State.gets<Stack, number | undefined>(stack => stack[stack.length - 1]);

      // Use the operations in a computation
      const computation = push(1)
        .flatMap(() => push(2))
        .flatMap(() => push(3))
        .flatMap(() => peek)
        .flatMap(top => pop.map(() => top));

      const [result, finalState] = computation.run([]);
      expect(result).toBe(3);
      expect(finalState).toEqual([1, 2]);
    });

    it('should sequence multiple state operations', () => {
      const operations = [
        State.modify<number>(n => n + 1),
        State.modify<number>(n => n * 2),
        State.modify<number>(n => n - 3)
      ];

      const sequenced = State.sequence(operations);

      const [results, finalState] = sequenced.run(5);
      expect(results.every(r => r === undefined)).toBe(true);
      expect(finalState).toBe((5 + 1) * 2 - 3); // 9
    });
  });
}); 