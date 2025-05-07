/**
 * Implementation of the State monad for functional state management.
 * 
 * @example
 * ```ts
 * import { State } from 'scats/monads/state';
 * 
 * // Define a state type
 * type GameState = {
 *   score: number;
 *   level: number;
 * };
 * 
 * // Create operations on the state
 * const incrementScore = (points: number) => State.modify<GameState>(state => ({
 *   ...state,
 *   score: state.score + points
 * }));
 * 
 * const levelUp = State.modify<GameState>(state => ({
 *   ...state,
 *   level: state.level + 1
 * }));
 * 
 * const getScore = State.gets<GameState, number>(state => state.score);
 * 
 * // Combine operations
 * const playGame = State.sequence([
 *   incrementScore(100),
 *   incrementScore(50),
 *   levelUp,
 *   getScore
 * ]);
 * 
 * // Run the state computation
 * const initialState: GameState = { score: 0, level: 1 };
 * const [finalScore, finalState] = playGame.run(initialState);
 * 
 * console.log(finalScore);   // 150
 * console.log(finalState);   // { score: 150, level: 2 }
 * ```
 */

/**
 * The State monad represents a computation that can read and write a state value.
 * 
 * Example:
 * ```
 * // Define a game state
 * interface GameState {
 *   score: number;
 *   level: number;
 * }
 * 
 * // Create state operations
 * const incrementScore = (points: number) => 
 *   State.modify<GameState>(state => ({...state, score: state.score + points}));
 * 
 * const levelUp = State.modify<GameState>(state => ({...state, level: state.level + 1}));
 * 
 * // Combine operations
 * const winLevel = (points: number) => 
 *   incrementScore(points).flatMap(() => levelUp);
 * 
 * // Run the computation
 * const initialState: GameState = { score: 0, level: 1 };
 * const [_, newState] = winLevel(100).run(initialState);
 * // newState is { score: 100, level: 2 }
 * ```
 */

// Class definition
export class StateMonad<S, A> {
  /**
   * Creates a new State.
   */
  constructor(readonly runState: (s: S) => [A, S]) { }

  /**
   * Runs this state computation with the given initial state.
   */
  run(initialState: S): [A, S] {
    return this.runState(initialState);
  }

  /**
   * Executes this state computation and returns the final value.
   */
  eval(initialState: S): A {
    return this.runState(initialState)[0];
  }

  /**
   * Executes this state computation and returns the final state.
   */
  exec(initialState: S): S {
    return this.runState(initialState)[1];
  }

  /**
   * Maps the result of this state computation using the given function.
   */
  map<B>(f: (a: A) => B): StateMonad<S, B> {
    return new StateMonad<S, B>(s => {
      const [a, s1] = this.runState(s);
      return [f(a), s1];
    });
  }

  /**
   * Returns a state computation that applies the function produced by this
   * state computation to the result of another state computation.
   */
  ap<B>(sf: StateMonad<S, (a: A) => B>): StateMonad<S, B> {
    return new StateMonad<S, B>(s => {
      const [f, s1] = sf.runState(s);
      const [a, s2] = this.runState(s1);
      return [f(a), s2];
    });
  }

  /**
   * Chains this state computation with another one.
   */
  flatMap<B>(f: (a: A) => StateMonad<S, B>): StateMonad<S, B> {
    return new StateMonad<S, B>(s => {
      const [a, s1] = this.runState(s);
      return f(a).runState(s1);
    });
  }

  /**
   * Alias for flatMap.
   */
  chain<B>(f: (a: A) => StateMonad<S, B>): StateMonad<S, B> {
    return this.flatMap(f);
  }

  /**
   * Transforms both the result and the state using the given functions.
   */
  bimap<B, T>(f: (a: A) => B, g: (s: S) => T): StateMonad<T, B> {
    return new StateMonad<T, B>(s => {
      const [a, s1] = this.runState(s as any);
      return [f(a), g(s1 as any)];
    });
  }
}

/**
 * State monad utilities and constructors
 */
export const State = {
  /**
   * Creates a new State computation that returns the given value without modifying the state.
   */
  of<S, A>(a: A): StateMonad<S, A> {
    return new StateMonad<S, A>(s => [a, s]);
  },

  /**
   * Creates a new State computation that returns the current state.
   */
  get<S>(): StateMonad<S, S> {
    return new StateMonad<S, S>(s => [s, s]);
  },

  /**
   * Creates a new State computation that replaces the state with a new value.
   */
  put<S>(newState: S): StateMonad<S, void> {
    return new StateMonad<S, void>(_ => [undefined, newState]);
  },

  /**
   * Creates a new State computation that modifies the state using the given function.
   */
  modify<S>(f: (s: S) => S): StateMonad<S, void> {
    return new StateMonad<S, void>(s => [undefined, f(s)]);
  },

  /**
   * Creates a new State computation that returns a part of the state using the given function.
   */
  gets<S, A>(f: (s: S) => A): StateMonad<S, A> {
    return new StateMonad<S, A>(s => [f(s), s]);
  },

  /**
   * Combines multiple state computations into a single one that returns an array of results.
   */
  sequence<S, A>(states: StateMonad<S, A>[]): StateMonad<S, A[]> {
    return new StateMonad<S, A[]>(s => {
      let currentState = s;
      const results: A[] = [];

      for (const state of states) {
        const [result, newState] = state.runState(currentState);
        results.push(result);
        currentState = newState;
      }

      return [results, currentState];
    });
  }
};

// Type alias for convenience
export type State<S, A> = StateMonad<S, A>;

export default State; 