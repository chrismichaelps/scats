import { describe, expect, it } from 'vitest';
import { Tuple, Tuple2, Tuple3 } from '../tuple';

describe('Tuple2', () => {
  it('should create a tuple with two elements', () => {
    const tuple = new Tuple2('hello', 42);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
  });

  it('should swap elements correctly', () => {
    const tuple = new Tuple2('hello', 42);
    const swapped = tuple.swap();
    expect(swapped._1).toBe(42);
    expect(swapped._2).toBe('hello');
  });

  it('should map first element correctly', () => {
    const tuple = new Tuple2('hello', 42);
    const mapped = tuple.map1(s => s.toUpperCase());
    expect(mapped._1).toBe('HELLO');
    expect(mapped._2).toBe(42);
  });

  it('should map second element correctly', () => {
    const tuple = new Tuple2('hello', 42);
    const mapped = tuple.map2(n => n * 2);
    expect(mapped._1).toBe('hello');
    expect(mapped._2).toBe(84);
  });

  it('should map both elements correctly', () => {
    const tuple = new Tuple2('hello', 42);
    const mapped = tuple.bimap(s => s.toUpperCase(), n => n * 2);
    expect(mapped._1).toBe('HELLO');
    expect(mapped._2).toBe(84);
  });

  it('should convert to array correctly', () => {
    const tuple = new Tuple2('hello', 42);
    const array = tuple.toArray();
    expect(array).toEqual(['hello', 42]);
  });

  it('should implement iterable protocol', () => {
    const tuple = new Tuple2('hello', 42);
    const values = [...tuple];
    expect(values).toEqual(['hello', 42]);

    // Test destructuring
    const [a, b] = tuple;
    expect(a).toBe('hello');
    expect(b).toBe(42);
  });
});

describe('Tuple3', () => {
  it('should create a tuple with three elements', () => {
    const tuple = new Tuple3('hello', 42, true);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
    expect(tuple._3).toBe(true);
  });

  it('should map first element correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const mapped = tuple.map1(s => s.toUpperCase());
    expect(mapped._1).toBe('HELLO');
    expect(mapped._2).toBe(42);
    expect(mapped._3).toBe(true);
  });

  it('should map second element correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const mapped = tuple.map2(n => n * 2);
    expect(mapped._1).toBe('hello');
    expect(mapped._2).toBe(84);
    expect(mapped._3).toBe(true);
  });

  it('should map third element correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const mapped = tuple.map3(b => !b);
    expect(mapped._1).toBe('hello');
    expect(mapped._2).toBe(42);
    expect(mapped._3).toBe(false);
  });

  it('should map all elements correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const mapped = tuple.map(s => s.toUpperCase(), n => n * 2, b => !b);
    expect(mapped._1).toBe('HELLO');
    expect(mapped._2).toBe(84);
    expect(mapped._3).toBe(false);
  });

  it('should convert to tuple2 correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const tuple2 = tuple.toTuple2();
    expect(tuple2._1).toBe('hello');
    expect(tuple2._2).toBe(42);
  });

  it('should convert to array correctly', () => {
    const tuple = new Tuple3('hello', 42, true);
    const array = tuple.toArray();
    expect(array).toEqual(['hello', 42, true]);
  });

  it('should implement iterable protocol', () => {
    const tuple = new Tuple3('hello', 42, true);
    const values = [...tuple];
    expect(values).toEqual(['hello', 42, true]);

    // Test destructuring
    const [a, b, c] = tuple;
    expect(a).toBe('hello');
    expect(b).toBe(42);
    expect(c).toBe(true);
  });
});

describe('Tuple namespace', () => {
  it('should create Tuple2 with of method', () => {
    const tuple = Tuple.of('hello', 42);
    expect(tuple).toBeInstanceOf(Tuple2);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
  });

  it('should create Tuple3 with of method', () => {
    const tuple = Tuple.of('hello', 42, true);
    expect(tuple).toBeInstanceOf(Tuple3);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
    expect(tuple._3).toBe(true);
  });

  it('should throw for unsupported argument count', () => {
    expect(() => Tuple.of(1)).toThrow();
    expect(() => Tuple.of(1, 2, 3, 4)).toThrow();
  });

  it('should create Tuple2 from array', () => {
    const tuple = Tuple.fromArray2(['hello', 42]);
    expect(tuple).toBeInstanceOf(Tuple2);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
  });

  it('should create Tuple3 from array', () => {
    const tuple = Tuple.fromArray3(['hello', 42, true]);
    expect(tuple).toBeInstanceOf(Tuple3);
    expect(tuple._1).toBe('hello');
    expect(tuple._2).toBe(42);
    expect(tuple._3).toBe(true);
  });

  it('should create Tuple2 from entry', () => {
    const tuple = Tuple.fromEntry(['key', 'value']);
    expect(tuple).toBeInstanceOf(Tuple2);
    expect(tuple._1).toBe('key');
    expect(tuple._2).toBe('value');
  });
}); 