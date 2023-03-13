export type Listener = (...args) => void;
export type Command = (...args) => unknown;
export type ICommand<T> = (store: T) => Command;
export type Subscription = (cb: Listener) => () => void;
export type Store<T> = T & { subscribe: Subscription } & {
  [key: string]: Command;
};

// Function to create proxy around the state, to allow changes to be
// emitted on changes for each key. Ensures a command can change more
// than 1 key.
function proxy<T extends object>(init: T, execute): T {
  const _state = { ...init };

  return new Proxy<T>(_state, {
    set(_t: object, prop: string, value): boolean {
      // ensure listeners are not triggered if the values don't change
      if (_state[prop] === value) return true;
      _state[prop] = value;
      execute(prop, value);
      return true;
    },
  });
}

// Function to create store with a data access layer
export function store<T extends object>(
  init: T,
  commands: { [key: string]: ICommand<T> }
): Store<T> {
  const _list: Listener[] = [];

  function execute(key: string): void {
    _list.forEach((cb): void => cb(_state, key));
  }

  function subscribe(cb: Listener) {
    _list.push(cb);
    return () => _list.splice(_list.indexOf(cb) >>> 0, 1);
  }

  const _state = proxy<T>(init, execute);

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (key === 'subscribe') return subscribe;
      if (commands[key]) return (...args) => commands[key](_state)(...args);
      return _state[key];
    },
  });
}
