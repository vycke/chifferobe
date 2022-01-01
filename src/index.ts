/* eslint-disable @typescript-eslint/ban-types */
type P = boolean | number | string | Record<string, unknown> | symbol;

type Listener = (...args: P[]) => void;
type Emitter = {
  on(topic: string, callback: Listener): void;
  off(topic: string, callback: Listener): void;
  emit(topic: string, ...args: P[]): void;
};
type TProxy = {
  subscribe(key: string, listener: Listener): void;
  unsubscribe(key: string, listener: Listener): void;
};
type Proxy<T> = T & TProxy;

// event emitter used internally in the proxy
function emitter(): Emitter {
  const _list = new Map<string, Listener[]>();

  return {
    on(topic, fn): void {
      const list = (_list.get(topic) || []).concat([fn]);
      _list.set(topic, list);
    },
    off(topic, callback): void {
      const cbs = _list.get(topic);
      cbs && cbs.splice(cbs.indexOf(callback) >>> 0, 1);
    },
    emit(topic, ...args): void {
      _list.get(topic)?.forEach((cb): void => cb(...args));
      // trigger all wildcard listeners
      if (topic !== '*')
        _list.get('*')?.forEach((cb): void => cb(topic, ...args));
    },
  };
}

// Function to create proxy
export default function proxy<T extends object>(init: T): Proxy<T> {
  const _emitter = emitter();
  const _cache = { ...init, subscribe: _emitter.on, unsubscribe: _emitter.off };

  return new Proxy<Proxy<T>>(_cache, {
    set(_t: object, prop: string, value): boolean {
      // fixed keys that are immutable
      if (['subscribe', 'unsubscribe'].includes(prop)) return true;
      _cache[prop] = value;
      _emitter.emit(prop, value);
      return true;
    },
    deleteProperty: function () {
      return true;
    },
  });
}
