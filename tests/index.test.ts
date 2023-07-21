/* eslint-disable @typescript-eslint/ban-types */
import { store } from '../src';

type CountStore = { count: number };

const increment =
  (state, number = 1) => {
    state.count += number;
    return state;
  };

const update = (state, number: number) => {
  state.count = number;
  return state;
};
const state = { count: 1 };
const commands = { increment, update };

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
  cache.listen(fn);
  expect(fn.mock.calls.length).toBe(0);
  cache.increment();
  expect(fn.mock.calls.length).toBe(1);
});

test('QUERY - function writing to separate variable', () => {
  const cache = store<CountStore>(state, commands);
  let double: number = cache.count * 2;
  cache.listen((state) => {
    double = state.count * 2;
  });
  expect(double).toBe(2);
  cache.increment();
  expect(double).toBe(4);
});

test('QUERY - remove listener', () => {
  const fn = jest.fn((x) => x);
  const cache = store<CountStore>(state, commands);
  const remove = cache.listen(fn);
  remove();
  cache.increment();
  expect(fn.mock.calls.length).toBe(0);
});

test('QUERY - entire store', () => {
  const fn = jest.fn((x) => x);
  const cache = store<CountStore>(state, commands);
  cache.listen(fn);
  expect(fn.mock.calls.length).toBe(0);
  cache.increment();
  expect(fn.mock.calls.length).toBe(1);
});

test('IMMUTABLE - delete a property (not allowed)', () => {
  const cache = store<{ count?: number }>(state, commands);
  expect(cache.count).toBe(1);
  delete cache.count;
  expect(cache.count).toBe(1);
});

test('IMMUTABLE - changing value', () => {
  const cache = store<{ count?: number }>(state, commands);
  expect(cache.count).toBe(1);
  cache.count = 2;
  expect(cache.count).toBe(1);
  cache.increment();
  expect(cache.count).toBe(2);
});

test('IMMUTABLE - nested change', () => {
  const inc1 = (s) => ({ data: { count: s.data.count + 1 } });
  const inc2 = (s) => {
    s.data.count++;
    return s;
  };
  const cache = store<{ data: { count?: number } }>(
    { data: { count: 1 } },
    { inc1, inc2 }
  );
  expect(cache.data.count).toBe(1);
  cache.data.count = 2;
  expect(cache.data.count).toBe(1);
  cache.inc1();
  expect(cache.data.count).toBe(2);
  cache.inc2();
  expect(cache.data.count).toBe(3);
});

test('DEVTOOLS', () => {
  const cache = store<CountStore>(state, commands);
  let history: { key: string, store: CountStore }[] = [];
  const fn = (store, _old, key) => history.push({ key, store });
  cache.listen(fn);
  expect(history.length).toBe(0);
  cache.increment();
  expect(history.length).toBe(1);
  cache.increment();
  expect(history.length).toBe(2);
})
