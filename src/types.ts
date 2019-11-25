export type Subscription = {
  id: string;
  message: string;
  callback: Function;
};

export type PubSub = {
  subscribe(message: string, callback: Function): Subscription;
  unsubscribe(subscription: Subscription): void;
  publish(message: string, ...args: any[]): void;
  remove(message: string): void;
};

export type List = Map<string, Subscription[]>;
