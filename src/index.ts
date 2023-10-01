export type Listener = () => void;
type IListener = { callback: Listener };
type Command<T> = (state: T) => (...args) => T;
export type Api<T> = { [key: string]: (...args) => T };
export type Commands<T, U> = {
  [key in keyof U]: (state: T) => U[key];
};
export type Signal<T extends object, U extends Api<T>> = T & U;

// helper variables. Due to the synchronous nature of the package,
// this method works
let LISTENER: IListener | null = null;
// a weakmap of
export const EFFECTS = new Map();

// helper to ensure deep immutability
function freeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach((prop: string) => {
    if (typeof obj[prop] !== "object" || !obj[prop]) return;
    obj[prop] = freeze(obj[prop] as object);
  });

  return new Proxy<T>(obj, { set: () => true });
}

// function to create a signal with named commands
export function signal<T extends object, U extends Api<T>>(
  init: T,
  commands: Commands<T, U>,
): Signal<T, U> {
  const listeners = new Set<IListener>();
  let state = freeze(init);

  // first check if there is a listener ready to be registered
  // next provide back the value from the state
  function read(key: string) {
    if (LISTENER) listeners.add(LISTENER);
    return state[key];
  }

  function write(command: Command<T>, ...args) {
    const prevState = JSON.parse(JSON.stringify(state));
    const nextState = command(Object.assign({}, prevState))(...args);
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
      if (commands[key]) {
        const command = commands[key];
        return (...args) => write(command, ...args);
      }
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
