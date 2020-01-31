export type Subscription = {
  id: string;
  callback: Function;
  remove: Function;
};

export type Primitive = boolean | number | string | object | symbol;

export type PubSub = {
  id: string;
  subscribe(message: string, callback: Function): Subscription;
  publish(message: string, ...args: Primitive[]): void;
  remove(message: string): void;
};

export type Broker = {
  publish(message: string, ...args: Primitive[]): void;
  register(...pubbels: PubSub[]): void;
  remove(pubbel: PubSub): void;
};

export type EventList = { [key: string]: Subscription[] };

export type Observable<T> = {
  value: T;
  subscribe(callback: Function): Subscription;
};

export type Config = {
  enableBrowserTabSync?: boolean;
};
