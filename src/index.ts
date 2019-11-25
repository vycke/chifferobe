import { Subscription, PubSub, List } from './types';
import { uuid } from './utils';

export default function createPubSub(): PubSub {
  const _list: List = new Map<string, Subscription[]>();
  const set = (msg: string, subs: Subscription[]): List => _list.set(msg, subs);
  const get = (message: string): Subscription[] => _list.get(message) || [];

  return {
    // Subscribe a callback to a message, that also can be removed
    subscribe(message, callback): Subscription {
      const sub: Subscription = { id: uuid(), message, callback };
      set(message, get(message).concat(sub));
      return sub;
    },
    // removes a subscription retrieved from the subscribe()
    unsubscribe({ message, id }): void {
      const remainder = get(message).filter((s): boolean => s.id !== id);
      set(message, remainder);
    },
    // publish a message onto the pubsub with optional additional parameters
    publish: (message, ...args): void => {
      _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
    },
    // remove an entire message from the list
    remove(message): void {
      _list.has(message) && _list.delete(message);
    }
  };
}
