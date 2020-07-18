import createStore from '../src/store';

describe('Decoupled store', () => {
  it('Basic operations', () => {
    const store = createStore({});
    store.update('key', () => 'value');
    expect(store.get('key')).toBe('value');
    store.update('key', () => 'value 2');
    expect(store.get('key')).toBe('value 2');

    store.update('my.nested.object', () => 'value');
    expect(store.get('')).toEqual({
      key: 'value 2',
      my: {
        nested: {
          object: 'value'
        }
      }
    });
    expect(store.get('my.nested.object')).toEqual('value');
  });

  it('Immutability', () => {
    const store = createStore({});
    store.update('key', () => 'value');
    let key = store.get('key');
    key = 'value 2';
    expect(key).toBe('value 2');
    expect(store.get('key')).toEqual('value');
  });

  it('store events and subscription', () => {
    const mock = jest.fn((x) => x);
    const store = createStore({}, { onUpdate: mock });
    expect(mock).toBeCalledTimes(0);
    store.update('key', () => 'value');
    expect(mock).toBeCalledTimes(1);
    const remove = store.subscribe('key', mock);
    store.update('key', () => 'value 1');
    expect(mock).toBeCalledTimes(3);
    remove();
    store.update('key', () => 'value 1');
    expect(mock).toBeCalledTimes(3);
  });
});
