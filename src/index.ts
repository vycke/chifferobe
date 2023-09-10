export type Listener = () => void;
type IListener = { callback: Listener };
export type ICommand<T> = (store: T, ...args) => T;
export type Commands<T> = { [key: string]: ICommand<T> };
export type Signal<T, U extends Commands<T>> = T & {
  [key in keyof U]: (...args) => T;
};

// helper variables. Due to the synchronous nature of the package,
// this method works
let LISTENER: IListener | null = null;
// a weakmap of
export const EFFECTS = new Map();

// helper to ensure deep immutability
function freeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach((prop: string) => {
    if (typeof obj[prop] !== "object") return;
    obj[prop] = freeze(obj[prop] as object);
  });

  return new Proxy<T>(obj, { set: () => true });
}

// function to create a signal with named commands
export function signal<T extends object, U extends Commands<T>>(
  init: T,
  commands: U,
): Signal<T, U> {
  const listeners = new Set<IListener>();
  let state = freeze(init);

  // first check if there is a listener ready to be registered
  // next provide back the value from the state
  function read(key: string) {
    if (LISTENER) listeners.add(LISTENER);
    return state[key];
  }

  function write(command: ICommand<T>, ...args) {
    const prevState = JSON.parse(JSON.stringify(state));
    const nextState = command(Object.assign({}, prevState), ...args);
    state = freeze(nextState);

    listeners.forEach((listener): void => {
      // if the effect still exists, execute the listener otherwise, delete it
      if (EFFECTS.has(listener)) listener.callback();
      else listeners.delete(listener);
    });
  }

  return new Proxy<Signal<T, U>>({} as Signal<T, U>, {
    set: () => true,
    get(_t: object, key: string) {
      if (commands[key]) return (...args) => write(commands[key], ...args);
      return read(key);
    },
  });
}

// helper that allows to register an effect to one or more signals
export function effect(callback: Listener) {
  const key: IListener = { callback };
  EFFECTS.set(key, []);
  LISTENER = key;
  callback();
  LISTENER = null;

  return () => EFFECTS.delete(key);
}
