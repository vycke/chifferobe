import store from '../src/store';

const fn = jest.fn((x) => x);
test('store', () => {
  const myStore = store({ key: 1 });
  expect(myStore.get('key')).toBe(1);
  expect(myStore.get('key 2')).toBe(undefined);
  expect(myStore.get('key', (v) => (v as number) * 2)).toBe(2);
  myStore.on('key', fn);
  expect(fn.mock.calls.length).toBe(0);
  myStore.mutate('key', 2);
  expect(fn.mock.calls.length).toBe(1);
});
