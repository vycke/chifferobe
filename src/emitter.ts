import { Listener, Emitter } from './types';

// The actual pubsub
export default function pubsub(): Emitter {
  const _list = new Map<string, Listener[]>();

  return {
    on(topic, fn, once = false): void {
      const list = (_list.get(topic) || []).concat([{ fn, once }]);
      _list.set(topic, list);
    },
    off(topic, callback): void {
      const cbs = _list.get(topic);
      cbs && cbs.splice(cbs.map((cb) => cb.fn).indexOf(callback) >>> 0, 1);
    },
    emit(topic, ...args): void {
      _list.get(topic)?.forEach((sub): void => sub.fn(...args));
      _list.set(topic, _list.get(topic)?.filter((s) => !s.once) || []);
      // trigger all wildcard listeners
      if (topic !== '*') this.emit('*', ...args);
    }
  };
}
