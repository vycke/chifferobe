import { Subscription, PubSub, List, Config, Primitive } from './types';
import { uuid } from './utils';

// Helper for synchronizing through localStorage
function synchronize(message: string, ...args: Primitive[]): void {
  localStorage.setItem('pubbel-event', JSON.stringify({ message, args }));
  localStorage.removeItem('pubbel-event');
}

// The actual pubsub
export default function pubbel(config?: Config): PubSub {
  const _id: string = uuid();
  const _list: List = new Map<string, Subscription[]>();
  const set = (msg: string, subs: Subscription[]): List => _list.set(msg, subs);
  const get = (message: string): Subscription[] => _list.get(message) || [];

  // Publish the message and optionally sync it
  function publish(message: string, sync: boolean, ...args: Primitive[]): void {
    _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
    if (sync) synchronize(message, ...args);
  }

  if (config?.sync) {
    window.addEventListener('storage', function({ key, newValue }) {
      if (key !== 'pubbel-event' || !newValue) return;
      const data = JSON.parse(newValue);
      if (!_list.has(data.message)) return;

      publish(data.message, false, ...(data.args || []));
    });
  }

  return {
    get id(): string {
      return _id;
    },
    // publish a message onto the pubsub with optional additional parameters
    publish(message, ...args): void {
      publish(message, config?.sync || false, ...args);
    },
    // Subscribe a callback to a message, that also can be removed
    subscribe(message, callback): Subscription {
      const sub: Subscription = { id: uuid(), callback };
      set(message, get(message).concat(sub));
      return sub;
    },
    // removes a subscription retrieved from the subscribe()
    unsubscribe(message, { id }): void {
      const remainder = get(message).filter((s): boolean => s.id !== id);
      if (remainder.length > 0) set(message, remainder);
      else _list.delete(message);
    },
    // remove an entire message from the list
    remove(message): void {
      _list.has(message) && _list.delete(message);
    }
  };
}
