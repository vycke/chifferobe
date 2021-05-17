/* eslint-disable @typescript-eslint/ban-types */
import { proxy } from '../src';

describe('reactive store', () => {
  let fn;

  beforeEach(() => {
    fn = jest.fn((x) => x);
  });

  test('Default store behavior', () => {
    const cache = proxy(() => ({ prop: 1 }));
    expect(cache.prop).toBe(1);

    cache.prop = 2;
    expect(cache.prop).toBe(2);
  });

  test('Default store behavior with function as init', () => {
    const cache = proxy(() => ({ prop: 1 }));
    expect(cache.prop).toBe(1);

    cache.prop = 2;
    expect(cache.prop).toBe(2);
  });

  test('wrong properties', () => {
    const cache = proxy(() => ({ prop: 1 }));
    cache.update = fn;

    cache.update('prop', (v) => (v as number) + 1);
    expect(cache.prop).toBe(2);
  });

  test('listeners', () => {
    const cache = proxy(() => ({ prop: 1 }));
    cache.on('prop', fn);

    expect(fn.mock.calls.length).toBe(0);
    cache.prop = 2;
    expect(fn.mock.calls.length).toBe(1);
    cache.off('prop', fn);
    cache.prop = 3;
    expect(fn.mock.calls.length).toBe(1);
  });

  test('same values', () => {
    const cache = proxy(() => ({ prop: 1 }));
    cache.on('prop', fn);
    expect(fn.mock.calls.length).toBe(0);
    cache.prop = 1;
    expect(fn.mock.calls.length).toBe(0);
  });

  test('immutable', () => {
    const cache = proxy(() => ({ prop: 1 }), true);
    cache.prop = 2;
    expect(cache.prop).toBe(1);
  });

  test('update while immutable', () => {
    const cache = proxy(() => ({ users: [1, 2, 3] }), true);
    cache.update('prop', () => 1);
    expect(cache.prop).toBe(1);

    cache.update('prop', (v) => (v as number) + 1);
    expect(cache.prop).toBe(2);
  });

  test('derived actions in the store', () => {
    const cache = proxy(
      (updater) => ({
        count: 1,
        add: () => updater('count', (c) => (c as number) + 1),
      }),
      true
    );

    expect(cache.count).toBe(1);
    (cache.add as Function)();
    expect(cache.count).toBe(2);
  });

  test('delete property', () => {
    const cache = proxy(() => ({ prop: 1 }));
    expect(cache.prop).toBe(1);
    delete cache.prop;
    expect(cache.prop).toBe(undefined);
    expect(typeof cache.update).toBe('function');
  });
});
