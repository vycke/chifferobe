import { Subscription, Observable } from './types';
import { uuid } from './utils';

// A helper that creates an object of which you can fetch the value, but also
// can set the value. When setting the value, a list of subscriptions are
// executed with the new value
export default function observe<T>(value: T): Observable<T> {
  let _value: T = value;
  let _listeners: Subscription[] = [];

  return {
    set value(value) {
      _value = value;
      _listeners.forEach((l) => l.callback(value));
    },
    get value(): T {
      return _value;
    },
    subscribe(callback): Subscription {
      const sub: Subscription = { id: uuid(), callback };
      _listeners.push(sub);
      return sub;
    },
    unsubscribe({ id }): void {
      _listeners = _listeners.filter((l) => l.id !== id);
    }
  };
}
