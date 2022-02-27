/* eslint-disable @typescript-eslint/ban-types */
import { store } from '../src';

type CountStore = { count: number };

describe('reactive store with data access layer', () => {
  test('COMMAND - without payload', () => {
    const cache = store<CountStore>({ count: 1 });
    cache.increment = (state: CountStore) => () => state.count++;
    expect(cache.count).toBe(1);
    cache.increment();
    expect(cache.count).toBe(2);
  });

  test('COMMAND - with payload', () => {
    const cache = store<CountStore>({ count: 1 });
    cache.increment = (state: CountStore) => (p: number) => (state.count += p);
    expect(cache.count).toBe(1);
    cache.increment(2);
    expect(cache.count).toBe(3);
  });

  test('COMMAND - deconstruct', () => {
    const cache = store<CountStore>({ count: 1 });
    cache.increment = (state: CountStore) => () => state.count++;
    const { increment, count } = cache;
    expect(cache.count).toBe(1);
    increment();
    expect(cache.count).toBe(2);
    expect(count).toBe(1);
  });

  test('IMMUTABLE - default behavior', () => {
    const cache = store<CountStore>({ count: 1 });
    expect(cache.count).toBe(1);
    cache.count = 2;
    expect(cache.count).toBe(1);
  });

  test('PERFORMANCE - same value', () => {
    const fn = jest.fn((x) => x);
    const cache = store<{ count: number }>({ count: 1 });
    cache.subscribe('count', fn);
    cache.update = (state: CountStore) => (p: number) => (state.count = p);
    cache.update(1);
    expect(fn.mock.calls.length).toBe(0);
  });

  test('LISTENER', () => {
    const fn = jest.fn((x) => x);
    const cache = store<CountStore>({ count: 1 });
    cache.increment = (state: CountStore) => () => state.count++;
    const remove = cache.subscribe('count', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.increment();
    expect(fn.mock.calls.length).toBe(1);
    remove();
    cache.increment();
    expect(fn.mock.calls.length).toBe(1);
  });

  test('LISTENER - wildcard', () => {
    const fn = jest.fn((x) => x);
    const cache = store<{ count: number }>({ count: 1 });
    cache.increment = (state: CountStore) => () => state.count++;
    cache.subscribe('*', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.increment();
    expect(fn.mock.calls.length).toBe(1);
  });

  test('DELETE - delete a property (not allowed)', () => {
    const cache = store<{ count?: number }>({ count: 1 });
    expect(cache.count).toBe(1);
    delete cache.count;
    expect(cache.count).toBe(1);
  });
});
