import emitter from './emitter';
import { Channel } from './types';

export default function channel(name: string): Channel {
  const _emitter = emitter();

  // function used on the 'storage' event listener
  function parseWindowEvent(ev: StorageEvent): void {
    const { key, newValue } = ev;
    if (key !== name || !newValue) return;
    const { topic, args } = JSON.parse(newValue);
    _emitter.emit(topic, ...(args || []));
  }

  window.addEventListener('storage', parseWindowEvent);

  return {
    ..._emitter,
    // fire-and-forget mechanism
    emit(topic, ...args): void {
      localStorage.setItem(name, JSON.stringify({ topic, args }));
      localStorage.removeItem(name);
    },
  };
}
