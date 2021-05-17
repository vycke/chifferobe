/* eslint-disable @typescript-eslint/ban-types */
import { emitter } from './emitter';
import { P } from './types';

type Updater = (a: string, fn: (value: P) => P) => void;
type Creator = (updater: Updater) => object;

type Listener = (value: P) => void;
type Proxy = {
  [key: string]: unknown;
  on(key: string, listener: Listener): void;
  off(key: string, listener: Listener): void;
  update: Updater;
};

// Function to create proxy
export function proxy(creator: Creator, immutable = false): Proxy {
  const _emitter = emitter();
  const _cache = {
    ...creator(updater),
    update: updater,
    on: _emitter.on,
    off: _emitter.off,
  };

  // function that can be used, even when immutable
  function updater(prop: string, fn: (value: P) => P): void {
    // fixed keys that are immutable
    if (['on', 'off', 'update'].includes(prop)) return;
    //determine if value changed
    const prevValue = _cache[prop];
    const value = fn(_cache[prop]);
    if (prevValue === value) return;

    _cache[prop] = value;
    _emitter.emit(prop, value);
  }

  return new Proxy<Proxy>(_cache, {
    set(_t: object, prop: string, value): boolean {
      if (immutable) return true;
      // update value
      updater(prop, () => value);
      return true;
    },
    deleteProperty: function (_t, prop: string) {
      if (['on', 'off', 'update'].includes(prop)) return true;
      delete _cache[prop];
      return true;
    },
  });
}
