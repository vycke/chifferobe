/* eslint-disable @typescript-eslint/ban-types */
import { expect, test } from "vitest";
import { effect, Commands, signal } from "../src";

type CountStore = { count: number };
type ApiConfig = {
  increment: (number?: number) => CountStore;
};

const increment =
  (state) =>
  (number = 1) => {
    state.count += number;
    return state;
  };

const state = { count: 1 };
const commands: Commands<CountStore, ApiConfig> = { increment };

test("SIGNAL - without payload", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  expect(cache.count).toBe(1);
  cache.increment();
  expect(cache.count).toBe(2);
});

test("SIGNAL - with payload", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  expect(cache.count).toBe(1);
  cache.increment(2);
  expect(cache.count).toBe(3);
});

test("SIGNAL - deconstruct", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  const { increment: _increment, count } = cache;
  expect(cache.count).toBe(1);
  _increment();
  expect(cache.count).toBe(2);
  expect(count).toBe(1);
});

test("SIGNAL - default immutable behavior", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  expect(cache.count).toBe(1);
  cache.count = 2;
  expect(cache.count).toBe(1);
  cache.increment();
  expect(cache.count).toBe(2);
});

test("SIGNAL - delete a property (not allowed)", () => {
  const cache = signal<{ count?: number }, {}>(state, {});
  expect(cache.count).toBe(1);
  delete cache.count;
  expect(cache.count).toBe(1);
});

test("SIGNAL - nested immutable change", () => {
  const cache = signal<{ data: CountStore }, {}>({ data: { count: 1 } }, {});
  expect(cache.data.count).toBe(1);
  cache.data.count = 2;
  expect(cache.data.count).toBe(1);
});

test("EFFECT - simple", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  let res = 0;
  expect(res).toBe(0);
  const dispose = effect(() => (res = cache.count));
  expect(res).toBe(1);
  cache.increment();
  expect(res).toBe(2);
  dispose();
});

test("EFFECT - test cleanup", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  let res = 0;
  const dispose = effect(() => (res = cache.count));
  dispose();
  cache.increment();
  expect(res).toBe(1);
});

test("EFFECT - double dispose", () => {
  const cache = signal<CountStore, ApiConfig>(state, commands);
  let res = 0;
  const dispose = effect(() => (res = cache.count));
  dispose();
  dispose(); // see if a second dispose is possible without failure
  cache.increment();
  expect(res).toBe(1);
});

test("EFFECT - double signals + cleanup", () => {
  const cache1 = signal<CountStore, ApiConfig>(state, commands);
  const cache2 = signal<CountStore, ApiConfig>(state, commands);
  let res = 0;
  const dispose = effect(() => (res = cache1.count + cache2.count));
  expect(res).toBe(2);
  cache1.increment();
  expect(res).toBe(3);
  cache2.increment();
  expect(res).toBe(4);
  dispose();
  cache2.increment();
  expect(res).toBe(4);
});
