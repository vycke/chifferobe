/* eslint-disable @typescript-eslint/ban-types */
import { store } from '../src';

type CountStore = { count: number };

const increment =
  (state) =>
  (number = 1) =>
    (state.count += number);
const update = (state) => (number: number) => (state.count = number);
const state = { count: 1 };
const commands = { increment, update };

describe('reactive store with data access layer', () => {
  test('COMMAND - without payload', () => {
    const cache = store<CountStore>(state, commands);
    expect(cache.count).toBe(1);
    cache.increment();
    expect(cache.count).toBe(2);
  });

  test('COMMAND - with payload', () => {
    const cache = store<CountStore>(state, commands);
    expect(cache.count).toBe(1);
    cache.increment(2);
    expect(cache.count).toBe(3);
  });

  test('COMMAND - deconstruct', () => {
    const cache = store<CountStore>(state, commands);
    const { increment: _increment, count } = cache;
    expect(cache.count).toBe(1);
    _increment();
    expect(cache.count).toBe(2);
    expect(count).toBe(1);
  });

  test('IMMUTABLE - default behavior', () => {
    const cache = store<CountStore>(state, commands);
    expect(cache.count).toBe(1);
    cache.count = 2;
    expect(cache.count).toBe(1);
  });

  test('QUERY - executing callbacks', () => {
    const fn = jest.fn((x) => x);
    const cache = store<CountStore>(state, commands);
    cache.on('count', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.increment();
    expect(fn.mock.calls.length).toBe(1);
  });

  test('QUERY - function writing to separate variable', () => {
    const cache = store<CountStore>(state, commands);
    let double: number = cache.count * 2;
    cache.on('count', (v: number) => (double = v * 2));
    expect(double).toBe(2);
    cache.increment();
    expect(double).toBe(4);
  });

  test('QUERY - remove listener', () => {
    const fn = jest.fn((x) => x);
    const cache = store<CountStore>(state, commands);
    const remove = cache.on('count', fn);
    remove();
    cache.increment();
    expect(fn.mock.calls.length).toBe(0);
  });

  test('QUERY - entire store', () => {
    const fn = jest.fn((x) => x);
    const cache = store<CountStore>(state, commands);
    cache.on('*', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.increment();
    expect(fn.mock.calls.length).toBe(1);
  });

  test('QUERY - same value performance improvement', () => {
    const fn = jest.fn((x) => x);

    const cache = store<CountStore>(state, commands);
    cache.on('count', fn);
    cache.update(1);
    expect(fn.mock.calls.length).toBe(0);
  });

  test('DELETE - delete a property (not allowed)', () => {
    const cache = store<{ count?: number }>(state, commands);
    expect(cache.count).toBe(1);
    delete cache.count;
    expect(cache.count).toBe(1);
  });
});
