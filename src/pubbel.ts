import { Subscription, PubSub, List, Primitive, Config } from './types';
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
  const get = (message: string): Subscription[] => _list.get(message) || [];

  function invokeCbs(message: string, ...args: Primitive[]): void {
    _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
  }

  // Remove a subscription
  function remove(msg: string, id: string): void {
    const rem = get(msg).filter((s) => s.id !== id);
    _list.set(msg, rem);
  }

  // Parsing window events function
  function parseWindowEvent({ key, newValue }): void {
    if (key !== 'pubbel-event' || !newValue) return;
    const data = JSON.parse(newValue);
    if (!_list.has(data.message)) return;

    invokeCbs(data.message, data.args || []);
  }

  // Register window event listener when sync between browser tabs is enabled
  if (config?.enableBrowserTabSync)
    window.addEventListener('storage', parseWindowEvent);

  return {
    get id(): string {
      return _id;
    },
    // publish a message onto the pubsub with optional additional parameters
    publish(message, ...args): void {
      invokeCbs(message, args);
      if (config?.enableBrowserTabSync) synchronize(message, ...args);
    },
    // Subscribe a callback to a message, that also can be removed
    subscribe(message, callback): Subscription {
      const id = uuid();

      const sub: Subscription = {
        id,
        callback,
        remove: () => remove(message, id)
      };
      _list.set(message, get(message).concat(sub));
      return sub;
    },
    // remove an entire message from the list
    remove(message): void {
      _list.has(message) && _list.delete(message);
    }
  };
}
