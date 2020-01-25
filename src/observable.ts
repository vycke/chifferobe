import { Subscription, Observable } from './types';
import { uuid } from './utils';

// A helper that creates an object of which you can fetch the value, but also
// can set the value. When setting the value, a list of subscriptions are
// executed with the new value
export default function observe<T>(value: T): Observable<T> {
  let _value: T = value;
  let _listeners: Subscription[] = [];

  function remove(id: string): void {
    _listeners = _listeners.filter((l) => l.id !== id);
  }

  return {
    set value(value) {
      if (_value === value) return;
      _value = value;
      _listeners.forEach((l) => l.callback(value));
    },
    get value(): T {
      return _value;
    },
    subscribe(callback): Subscription {
      const id = uuid();
      const sub: Subscription = { id, callback, remove: () => remove(id) };
      _listeners.push(sub);
      return sub;
    }
  };
}
