export type Subscription = {
  id: string;
  callback: Function;
};

export type Primitive = boolean | number | string | object | symbol;

export type PubSub = {
  id: string;
  subscribe(message: string, callback: Function): Function;
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
  get(): T;
  set(value: T): void;
  subscribe(callback: Function): Function;
};

export type Config = {
  enableBrowserTabSync?: boolean;
};
