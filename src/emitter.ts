import { Listener, Emitter } from './types';

// The actual pubsub
export default function emitter(): Emitter {
  const _list = new Map<string, Listener[]>();

  return {
    on(topic, fn): void {
      const list = (_list.get(topic) || []).concat([fn]);
      _list.set(topic, list);
    },
    off(topic, callback): void {
      const cbs = _list.get(topic);
      cbs && cbs.splice(cbs.indexOf(callback) >>> 0, 1);
    },
    emit(topic, ...args): void {
      _list.get(topic)?.forEach((cb): void => cb(...args));
      // trigger all wildcard listeners
      if (topic !== '*')
        _list.get('*')?.forEach((cb): void => cb(topic, ...args));
    }
  };
}
