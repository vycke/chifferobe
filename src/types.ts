export type Subscription = {
  id: string;
  callback: Function;
};

export type Primitive = boolean | number | string | object | symbol;

export type PubSub = {
  id: string;
  subscribe(message: string, callback: Function): Subscription;
  unsubscribe(message: string, subscription: Subscription): void;
  publish(message: string, ...args: Primitive[]): void;
  remove(message: string): void;
  has(message: string): boolean;
};

export type Broker = {
  publish(message: string, ...args: Primitive[]): void;
  register(...pubbels: PubSub[]): void;
  remove(pubbel: PubSub): void;
};

export type Config = {
  sync: boolean;
};

export type List = Map<string, Subscription[]>;

export type Observable<T> = {
  value: T;
  subscribe(callback: Function): Subscription;
  unsubscribe(subscription: Subscription): void;
};
