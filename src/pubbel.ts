import { Subscription, PubSub, List, Config } from './types';
import { uuid, sync, listen } from './utils';

export default function pubbel(config: Config): PubSub {
  const _list: List = new Map<string, Subscription[]>();
  const set = (msg: string, subs: Subscription[]): List => _list.set(msg, subs);
  const get = (message: string): Subscription[] => _list.get(message) || [];

  return {
    // publish a message onto the pubsub with optional additional parameters
    publish: function(message, ...args): void {
      _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
      if (config.sync) sync(message, args);
    },
    // Subscribe a callback to a message, that also can be removed
    subscribe(message, callback): Subscription {
      const sub: Subscription = { id: uuid(), callback };
      if (!_list.has(message) && config.sync) listen(message, this.publish);

      set(message, get(message).concat(sub));
      return sub;
    },
    // removes a subscription retrieved from the subscribe()
    unsubscribe(message, { id }): void {
      const remainder = get(message).filter((s): boolean => s.id !== id);
      set(message, remainder);
    },
    // remove an entire message from the list
    remove(message): void {
      _list.has(message) && _list.delete(message);
      if (config.sync) window.removeEventListener('storage', this.publish);
    }
  };
}
