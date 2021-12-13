/* eslint-disable @typescript-eslint/ban-types */
import { emitter } from './emitter';
import { P } from './types';

type Updater = (a: string, fn: (value: P) => P) => void;
type Creator<T> = (updater: Updater) => T;

type Listener = (value: P) => void;
type TProxy = {
  on(key: string, listener: Listener): void;
  off(key: string, listener: Listener): void;
  update: Updater;
};
type Proxy<T> = T & TProxy;

// Function to create proxy
export function proxy<T extends object>(
  creator: Creator<T>,
  immutable = false
): Proxy<T> {
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

    const value = fn(_cache[prop]);
    _cache[prop] = value;
    _emitter.emit(prop, value);
  }

  return new Proxy<Proxy<T>>(_cache, {
    set(_t: object, prop: string, value): boolean {
      if (immutable) return true;
      // update value
      updater(prop, () => value);
      return true;
    },
    deleteProperty: function () {
      return true;
    },
  });
}
