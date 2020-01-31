import { Subscription, Observable } from './types';
import { uuid } from './utils';

// A helper that creates an object of which you can fetch the value, but also
// can set the value. When setting the value, a list of subscriptions are
// executed with the new value
export default function observable<T>(value: T): Observable<T> {
  let _value: T = value;
  let _listeners: Subscription[] = [];

  return {
    set(value: T): void {
      _value = value;
      _listeners.forEach((l) => l.callback(value));
    },
    get: (): T => _value,
    subscribe(callback): Function {
      const id = uuid();
      const sub: Subscription = { id, callback };
      _listeners.push(sub);
      return function(): void {
        _listeners = _listeners.filter((l) => l.id !== id);
      };
    }
  };
}
