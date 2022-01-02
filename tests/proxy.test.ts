/* eslint-disable @typescript-eslint/ban-types */
import proxy from '../src';

describe('reactive store', () => {
  test('CHANGE - default behavior', () => {
    const cache = proxy<{ count: number }>({ count: 1 });
    expect(cache.count).toBe(1);
    cache.count = 2;
    expect(cache.count).toBe(2);
  });

  test('CHANGE - subscribe property that cannot updated', () => {
    const fn = jest.fn((x) => x);
    const cache = proxy<{ count: number }>({ count: 1 });
    cache.subscribe = () => () => undefined;
    cache.subscribe('count', fn);
    cache.count = 2;
    expect(fn.mock.calls.length).toBe(1);
  });

  test('LISTENER - register listener', () => {
    const fn = jest.fn((x) => x);
    const cache = proxy<{ count: number }>({ count: 1 });
    const removeSubscription = cache.subscribe('count', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.count = 2;
    expect(fn.mock.calls.length).toBe(1);
    removeSubscription();
    cache.count = 3;
    expect(fn.mock.calls.length).toBe(1);
  });

  test('LISTENER - wildcard', () => {
    const fn = jest.fn((x) => x);
    const cache = proxy<{ count: number }>({ count: 1 });
    cache.subscribe('*', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.count = 2;
    expect(fn.mock.calls.length).toBe(1);
    cache['*'] = 1;
    expect(fn.mock.calls.length).toBe(2);
  });

  test('DELETE - delete a property (not allowed)', () => {
    const cache = proxy<{ count?: number }>({ count: 1 });
    expect(cache.count).toBe(1);
    delete cache.count;
    expect(cache.count).toBe(1);
  });
});
