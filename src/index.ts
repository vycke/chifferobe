export type Listener = (...args) => void;
export type Command = (...args) => unknown;
export type ICommand<T> = (store: T) => Command;
export type Subscription = (cb: Listener) => () => void;
export type Store<T> = T & { subscribe: Subscription } & {
  [key: string]: Command;
};

// Function to create store with a data access layer
export function store<T extends object>(
  init: T,
  api: { [key: string]: ICommand<T> }
): Store<T> {
  const _list: Listener[] = [];
  const _state = { ...init };

  function subscribe(cb: Listener) {
    _list.push(cb);
    return () => _list.splice(_list.indexOf(cb) >>> 0, 1);
  }

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (key === 'subscribe') return subscribe;
      if (api[key])
        return (...args) => {
          const _old = { ..._state };
          api[key](_state)(...args);
          _list.forEach((cb): void => cb(_state, _old));
        };
      return _state[key];
    },
  });
}
