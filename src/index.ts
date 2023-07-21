export type Listener<T> = (newStore: T, oldStore?: T, key?: string) => void;
export type Command<T> = (...args) => T;
export type ICommand<T> = (store: T, ...args) => T;
export type Subscription<T> = (cb: Listener<T>) => () => void;
export type Store<T> = T & { listen: Subscription<T> } & {
  [key: string]: Command<T>;
};

// deep-freeze for immutability
function freeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach((prop: string) => {
    if (typeof obj[prop] !== 'object') return;
    obj[prop] = freeze(obj[prop] as object);
  });

  return new Proxy<T>(obj, { set: () => true });
}

// Function to create store with a data access layer
export function store<T extends object>(
  init: T,
  api: { [key: string]: ICommand<T> }
): Store<T> {
  const _list: Listener<T>[] = [];
  let _state = freeze<T>({ ...init });

  function listen(cb: Listener<T>) {
    _list.push(cb);
    return () => _list.splice(_list.indexOf(cb) >>> 0, 1);
  }

  function execute(key: string, ...args) {
    const cmd = api[key];
    const _old = JSON.parse(JSON.stringify(_state));
    const _new = cmd(_old, ...args);
    _state = freeze<T>(_new);
    _list.forEach((cb): void => cb(_new, _old, key));
  }

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (key === 'listen') return listen;
      if (api[key]) return (...args) => execute(key, ...args);
      return _state[key];
    },
  });
}
