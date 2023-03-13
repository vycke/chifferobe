export type Listener = (...args) => void;
export type Subscription = () => void;
type Emitter = {
  on(topic: string, callback: Listener): Subscription;
  emit(topic: string, ...args): void;
};
export type Proxy<T> = T & {
  on(key: string, listener: Listener): Subscription;
};

export type Command<T> = (store: Proxy<T>, payload?) => unknown;
export type Store<T> = Proxy<T> & { [key: string]: Command<T> };
export type Commands<T> = { [key: string]: Command<T> };

// event emitter used internally in the proxy
function emitter(): Emitter {
  const _list = new Map<string, Listener[]>();

  return {
    on(topic, cb): Subscription {
      const list = (_list.get(topic) || []).concat([cb]);
      _list.set(topic, list);
      return () => {
        const cbs = _list.get(topic);
        cbs && cbs.splice(cbs.indexOf(cb) >>> 0, 1);
      };
    },
    emit(topic, ...args): void {
      _list.get(topic)?.forEach((cb): void => cb(...args));
      // trigger all wildcard listeners
      _list.get('*')?.forEach((cb): void => cb(topic, ...args));
    },
  };
}

// Function to create proxy around the state, to allow changes to be
// emitted on changes for each key. Ensures a command can change more
// than 1 key.
function proxy<T extends object>(init: T, e: Emitter): Proxy<T> {
  const _state = { ...init, on: e.on };

  return new Proxy<Proxy<T>>(_state, {
    set(_t: object, prop: string, value): boolean {
      // ensure listeners are not triggered if the values don't change
      if (_state[prop] === value) return true;
      _state[prop] = value;
      e.emit(prop, value);
      return true;
    },
  });
}

// Function to create store with a data access layer
export function store<T extends object>(
  init: T,
  commands: Commands<T>
): Store<T> {
  const _emitter = emitter();
  const _state = proxy<T>(init, _emitter);

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (commands[key]) return (payload) => commands[key](_state, payload);
      return _state[key];
    },
  });
}
