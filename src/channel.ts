import pubsub from './pubsub';
import { Channel, ChannelConfig } from './types';

export default function channel(name: string, config?: ChannelConfig): Channel {
  const _pubsub = pubsub(config);

  function parseWindowEvent({ key, newValue }): void {
    if (key !== name || !newValue) return;
    const { message, args } = JSON.parse(newValue);
    _pubsub.publish(message, ...(args || []));
  }

  window.addEventListener('storage', parseWindowEvent);

  return {
    publish(message, ...args): void {
      localStorage.setItem(name, JSON.stringify({ message, args }));
      localStorage.removeItem(name);
    },
    subscribe: _pubsub.subscribe,
    delete: _pubsub.delete
  };
}
