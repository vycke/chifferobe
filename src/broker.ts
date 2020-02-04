import { PubSub, Broker } from './types';

export default function broker(): Broker {
  let _pubbels: PubSub[] = [];

  return {
    register(...pubbels): void {
      _pubbels.push(...pubbels);
    },
    delete(pubbel): void {
      const remainder = _pubbels.filter((p) => p.id !== pubbel.id);
      _pubbels = remainder;
    },
    publish(message, ...args): void {
      _pubbels.forEach((p) => p.publish(message, ...args));
    }
  };
}
