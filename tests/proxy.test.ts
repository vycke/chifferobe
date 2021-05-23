/* eslint-disable @typescript-eslint/ban-types */
import { proxy } from '../src';

describe('reactive store', () => {
  let fn;

  beforeEach(() => {
    fn = jest.fn((x) => x);
  });

  test('CHANGE - default behavior', () => {
    const cache = proxy<{ count: number }>(() => ({ count: 1 }));
    expect(cache.count).toBe(1);
    cache.count = 2;
    expect(cache.count).toBe(2);
  });

  test('CHANGE - update property that cannot updated', () => {
    const cache = proxy<{ count: number }>(() => ({ count: 1 }));
    cache.update = fn;
    cache.update('count', (v) => (v as number) + 1);
    expect(cache.count).toBe(2);
  });

  test('LISTENER - register listener', () => {
    const fn = jest.fn((x) => x);
    const cache = proxy<{ count: number }>(() => ({ count: 1 }));
    cache.on('count', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.count = 2;
    expect(fn.mock.calls.length).toBe(1);
    cache.off('count', fn);
    cache.count = 3;
    expect(fn.mock.calls.length).toBe(1);
  });

  test('LISTENER - update to same value should not trigger listener', () => {
    const cache = proxy<{ count: number }>(() => ({ count: 1 }));
    cache.on('count', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.count = 1;
    expect(fn.mock.calls.length).toBe(0);
  });

  test('IMMUTABILITY - direct updates not allowed', () => {
    const cache = proxy<{ count: number }>(() => ({ count: 1 }), true);
    cache.count = 2;
    expect(cache.count).toBe(1);
  });

  test('IMMUTABILITY - update function', () => {
    const cache = proxy<{ count: number }>(() => ({ count: 1 }), true);
    cache.update('count', () => 2);
    expect(cache.count).toBe(2);
  });

  test('DERIVED - add action to the store on start', () => {
    const cache = proxy<{ count: number; add: Function }>((u) => ({
      count: 1,
      add: () => u('count', (c) => (c as number) + 1),
    }));

    expect(cache.count).toBe(1);
    (cache.add as Function)();
    expect(cache.count).toBe(2);
  });

  test('DELETE - delete a property (not allowed)', () => {
    const cache = proxy<{ count?: number }>(() => ({ count: 1 }));
    expect(cache.count).toBe(1);
    delete cache.count;
    expect(cache.count).toBe(1);
  });
});
