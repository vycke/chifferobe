import pubsub from './pubsub';
import { Primitive, Store, StoreConfig } from './types';

export default function store(config?: StoreConfig): Store {
  const _state = {};
  const _pubsub = pubsub();

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
  function set(path: string, value?: Primitive): void {
    const oldValue = get(path);
    if (oldValue === value || Object.is(oldValue, value)) return;
    const tokens = path.split('.');

    tokens.reduce((o, k, i) => {
      if (i === tokens.length - 1) o[k] = value;
      else o[k] = o[k] || {};
      return o[k];
    }, _state);

    _pubsub.publish(path, value as Primitive);
    config?.onUpdate?.(path, value);
  }

  return {
    get,
    update(path, arg): void {
      if (typeof arg === 'function') set(path, arg(get(path)));
      else set(path, arg);
    },
    subscribe: _pubsub.subscribe
  };
}
