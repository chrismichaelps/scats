import { describe, expect, it } from 'vitest';
import { Writer, WriterMonad, Monoids } from '../monads/writer';

describe('Writer Monad', () => {
  describe('constructors', () => {
    it('should create a Writer from of() constructor with string monoid', () => {
      const writer = Writer.of('value', Monoids.string);
      expect(writer).toBeInstanceOf(WriterMonad);

      const [result, log] = writer.run();
      expect(result).toBe('value');
      expect(log).toBe('');
    });

    it('should create a Writer from of() constructor with array monoid', () => {
      const writer = Writer.of('value', Monoids.array<string>());
      expect(writer).toBeInstanceOf(WriterMonad);

      const [result, log] = writer.run();
      expect(result).toBe('value');
      expect(log).toEqual([]);
    });

    it('should create a Writer with tell()', () => {
      const writer = Writer.tell('log message');
      expect(writer).toBeInstanceOf(WriterMonad);

      const [result, log] = writer.run();
      expect(result).toBeUndefined();
      expect(log).toBe('log message');
    });

    it('should create a Writer with withString() helper', () => {
      const writer = Writer.withString('value', 'log message');
      expect(writer).toBeInstanceOf(WriterMonad);

      const [result, log] = writer.run();
      expect(result).toBe('value');
      expect(log).toBe('log message');
    });

    it('should create a Writer with withArray() helper', () => {
      const writer = Writer.withArray('value', ['log', 'message']);
      expect(writer).toBeInstanceOf(WriterMonad);

      const [result, log] = writer.run();
      expect(result).toBe('value');
      expect(log).toEqual(['log', 'message']);
    });
  });

  describe('operations', () => {
    it('should map results correctly', () => {
      const writer = Writer.withString('hello').map(s => s.toUpperCase());

      const [result, log] = writer.run();
      expect(result).toBe('HELLO');
      expect(log).toBe('');
    });

    it('should map logs correctly', () => {
      const writer = Writer.withString('hello', 'log').mapLog(s => s.toUpperCase());

      const [result, log] = writer.run();
      expect(result).toBe('hello');
      expect(log).toBe('LOG');
    });

    it('should transform both result and log using bimap', () => {
      const writer = Writer.withString('hello', 'log').bimap(
        s => s.toUpperCase(),
        s => s.toUpperCase()
      );

      const [result, log] = writer.run();
      expect(result).toBe('HELLO');
      expect(log).toBe('LOG');
    });

    it('should flatMap correctly with string monoid', () => {
      const writer = Writer.withString('hello')
        .flatMap(s => Writer.withString(s.toUpperCase(), ' - transformed'), Monoids.string);

      const [result, log] = writer.run();
      expect(result).toBe('HELLO');
      expect(log).toBe(' - transformed');
    });

    it('should flatMap correctly with array monoid', () => {
      const writer = Writer.withArray('hello', ['start'])
        .flatMap(s => Writer.withArray(s.toUpperCase(), ['transformed']), Monoids.array());

      const [result, log] = writer.run();
      expect(result).toBe('HELLO');
      expect(log).toEqual(['start', 'transformed']);
    });

    it('should chain multiple operations with string monoid', () => {
      const writer = Writer.withString('hello')
        .flatMap(s => Writer.withString(s + ' world', 'step 1, '), Monoids.string)
        .flatMap(s => Writer.withString(s.toUpperCase(), 'step 2'), Monoids.string);

      const [result, log] = writer.run();
      expect(result).toBe('HELLO WORLD');
      expect(log).toBe('step 1, step 2');
    });

    it('should apply functions with string monoid', () => {
      const writerFn = Writer.withString((s: string) => s.toUpperCase(), 'applying function, ');
      const writer = Writer.withString('hello')
        .ap(writerFn, Monoids.string);

      const [result, log] = writer.run();
      expect(result).toBe('HELLO');
      expect(log).toBe('applying function, ');
    });
  });

  describe('listen and pass', () => {
    it('should listen to the log', () => {
      const writer = Writer.withString('hello', 'log');
      const listened = Writer.listen(writer);

      const [result, log] = listened.run();
      expect(result).toEqual(['hello', 'log']);
      expect(log).toBe('log');
    });

    it('should pass a function to modify the log', () => {
      const writer = Writer.withString(['hello', (s: string) => s.toUpperCase()] as [string, (s: string) => string], 'log');
      const passed = Writer.pass(writer);

      const [result, log] = passed.run();
      expect(result).toBe('hello');
      expect(log).toBe('LOG');
    });
  });

  describe('practical examples', () => {
    it('should implement a simple calculation with logging', () => {
      type StringArray = string[];

      const add = (n: number): WriterMonad<StringArray, number> =>
        Writer.withArray<string, number>(n, [`add(${n})`]);

      // Calculation with explicit types to avoid inference issues
      const calculation: WriterMonad<StringArray, number> = add(5)
        .flatMap((n: number) => {
          return add(10).flatMap((m: number) => {
            return Writer.withArray<string, number>(n + m, [`sum(${n}, ${m})`]);
          }, Monoids.array<string>());
        }, Monoids.array<string>())
        .flatMap((n: number) => {
          return Writer.withArray<string, number>(n * 2, [`double(${n})`]);
        }, Monoids.array<string>());

      const [result, log] = calculation.run();
      expect(result).toBe(30);
      expect(log).toEqual(['add(5)', 'add(10)', 'sum(5, 10)', 'double(15)']);
    });

    it('should accumulate string logs', () => {
      const logNumber = (n: number): WriterMonad<string, number> =>
        Writer.tell<string>(`Processing ${n}`)
          .flatMap(() => Writer.of<string, number>(n * 2, Monoids.string), Monoids.string);

      const result = logNumber(5)
        .flatMap((n: number) => {
          return Writer.tell<string>(`Result is ${n}`)
            .flatMap(() => Writer.of<string, number>(n, Monoids.string), Monoids.string);
        }, Monoids.string);

      const [value, logs] = result.run();
      expect(value).toBe(10);
      expect(logs).toBe('Processing 5Result is 10');
    });
  });
}); 