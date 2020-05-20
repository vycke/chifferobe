import { freeze, clone } from './utils';
import { Primitive, Store, StoreConfig, SEvent } from './types';

export default function store(init = {}, config?: StoreConfig): Store {
  let _state = freeze(init);

  // Gets the nested value based on a tokenized string indicating the path of the
  // object.(e.g. get(obj, "user.info.address"))
  function get(path: string, def?: Primitive): Primitive {
    if (path === '') return _state;
    const tokens = path.split('.');

    return tokens.reduce(
      (o, k) => (o && o[k] !== undefined && o[k] !== null ? o[k] : def),
      _state
    );
  }

  // Sets the nested value based on tokenized string indicating the path of the
  // object. (e.g. set(obj, "user.info.address", "myValue")
  function set(event: SEvent, path: string, value?: Primitive): void {
    if (path === '') return;
    const oldValue = get(path);
    if (oldValue === value || Object.is(oldValue, value)) return;
    const tokens = path.split('.');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const state = clone(_state);
    tokens.reduce((o, k, i) => {
      if (i === tokens.length - 1) o[k] = value;
      else o[k] = o[k] || {};
      return o[k];
    }, state);

    _state = freeze(state);
    config?.onEvent?.(event, path, value);
  }

  return {
    get,
    set(path, value): void {
      set('set', path, value);
    },
    update(path, fn): void {
      const value = get(path);
      set('update', path, fn(value));
    },
    remove(path): void {
      set('remove', path);
    }
  };
}
