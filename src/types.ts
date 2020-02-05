export type Subscription = {
  id: string;
  callback: Function;
};

type Primitive = boolean | number | string | object | symbol;

export type PubSub = {
  subscribe(message: string, callback: Function): Function;
  publish(message: string, ...args: Primitive[]): void;
  delete(message: string): void;
};

export type PubSubConfig = {
  enableBrowserTabSync: boolean;
};

export type Observable<T> = {
  get(): T;
  set(value: T): void;
  subscribe(callback: Function): Function;
};
