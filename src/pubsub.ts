import { Subscription, PubSub, PubSubConfig } from './types';

function uuid(): string {
  return 'xxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
}

// The actual pubsub
export default function pubsub(config?: PubSubConfig): PubSub {
  const _list = new Map<string, Subscription[]>();

  return {
    // publish a message onto the pubsub with optional additional parameters
    publish(message, ...args): void {
      _list.get(message)?.forEach((sub): void => sub.callback?.(...args));
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
