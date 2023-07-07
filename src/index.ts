export type Listener = (...args) => void;
export type Command<T> = (...args) => T;
export type ICommand<T> = (store: T, ...args) => T;
export type Subscription = (cb: Listener) => () => void;
export type Store<T> = T & { subscribe: Subscription } & {
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
  const _list: Listener[] = [];
  let _state = freeze<T>({ ...init });

  function subscribe(cb: Listener) {
    _list.push(cb);
    return () => _list.splice(_list.indexOf(cb) >>> 0, 1);
  }

  function execute(cmd: ICommand<T>, ...args) {
    const _old = JSON.parse(JSON.stringify(_state));
    const _new = cmd(_old, ...args);
    _state = freeze<T>(_new);
    _list.forEach((cb): void => cb(_new, _old));
  }

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (key === 'subscribe') return subscribe;
      if (api[key]) return (...args) => execute(api[key], ...args);
      return _state[key];
    },
  });
}
