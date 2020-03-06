import { Subscription, PubSub, PubSubConfig } from './types';
import { uuid } from './utils';

// The actual pubsub
export default function pubsub(config?: PubSubConfig): PubSub {
  const _list = new Map<string, Subscription[]>();

  // Parsing window events function
  function parseWindowEvent({ key, newValue }): void {
    if (key !== 'pubbel-event' || !newValue) return;
    const { message, args } = JSON.parse(newValue);
    _list.get(message)?.forEach((sub): void => sub.callback(...(args || [])));
  }

  // Register window event listener when sync between browser tabs is enabled
  if (config?.enableBrowserTabSync)
    window.addEventListener('storage', parseWindowEvent);

  return {
    // publish a message onto the pubsub with optional additional parameters
    publish(message, ...args): void {
      _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
      if (config?.enableBrowserTabSync) {
        localStorage.setItem('pubbel-event', JSON.stringify({ message, args }));
        localStorage.removeItem('pubbel-event');
      }
      if (config?.onPublish) config.onPublish(message);
    },
    // Subscribe a callback to a message, that also can be removed
    subscribe(message, callback): Function {
      const sub = { id: uuid(), callback };
      const list = (_list.get(message) || []).concat([sub]);
      _list.set(message, list);

      return function(): void {
        const rem = (_list.get(message) || []).filter((s) => s.id !== sub.id);
        _list.set(message, rem);
      };
    },
    delete(message: string): void {
      _list.delete(message);
    }
  };
}
