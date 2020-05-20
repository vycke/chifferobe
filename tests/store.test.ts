import createStore from '../src/store';

const mock = jest.fn((x) => x);

describe('store', () => {
  it('get, set, update, remove', () => {
    const store = createStore();

    store.set('', 'test');
    expect(store.get('')).toEqual({});

    expect(store.get('my.nested.object')).toBe(undefined);
    store.set('my.nested.object', 'value');
    expect(store.get('my.nested.object')).toEqual('value');
    const { update } = store;
    update('my.nested.object', () => 'value 1');
    expect(store.get('my.nested.object')).toEqual('value 1');
    update('my.nested.object', () => 'value 2');
    expect(store.get('my.nested.object')).toEqual('value 2');
    update('my.nested.object', () => 'value 2');
    expect(store.get('my.nested.object')).toEqual('value 2');
    store.set('my.nested.object', 'value 2');
    expect(store.get('my.nested.object')).toEqual('value 2');
    store.remove('my.nested');
    expect(store.get('')).toEqual({ my: { nested: undefined } });
  });

  it('with onEvent and default setting', () => {
    const store = createStore({ counter: 1 }, { onEvent: mock });
    store.set('my.nested.object1', 'value');
    store.set('my.nested.object2', 'value');
    store.update('counter', (v) => v + 1);
    expect(store.get('')).toEqual({
      counter: 2,
      my: {
        nested: {
          object1: 'value',
          object2: 'value'
        }
      }
    });

    expect(mock).toBeCalledTimes(3);
  });
});
