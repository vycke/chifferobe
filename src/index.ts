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
  const listeners = new Set<Listener<T>>();
  let state = freeze<T>(Object.assign({}, init));

  function listen(listener: Listener<T>) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function execute(key: string, ...args) {
    const command = api[key];
    const prevState = JSON.parse(JSON.stringify(state));
    const nextState = command(prevState, ...args)
    // Check to see if there is anything different
    if (Object.is(nextState, prevState)) return;
    state = freeze<T>(nextState);
    listeners.forEach((cb): void => cb(nextState, prevState, key));
  }

  return new Proxy<Store<T>>({} as Store<T>, {
    set: () => true,
    get(_t: object, key: string) {
      if (key === 'listen') return listen;
      if (api[key]) return (...args) => execute(key, ...args);
      return state[key];
    },
  });
}
