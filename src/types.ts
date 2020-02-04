export type Subscription = {
  id: string;
  callback: Function;
};

type Primitive = boolean | number | string | object | symbol;

export type PubSub = {
  id: string;
  subscribe(message: string, callback: Function): Function;
  publish(message: string, ...args: Primitive[]): void;
  delete(message: string): void;
};

export type Broker = {
  publish(message: string, ...args: Primitive[]): void;
  register(...pubbels: PubSub[]): void;
  delete(pubbel: PubSub): void;
};

export type Observable<T> = {
  get(): T;
  set(value: T): void;
  subscribe(callback: Function): Function;
};

export type PubSubConfig = {
  enableBrowserTabSync?: boolean;
};
