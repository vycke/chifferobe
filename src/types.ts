// Generic types
export type Primitive = boolean | number | string | object | symbol;

// Pub/Sub types
export type PubSub = {
  subscribe(message: string, callback: Function): Function;
  publish(message: string, ...args: Primitive[]): void;
  delete(message: string): void;
};

export type PubSubConfig = {
  enableBrowserTabSync?: boolean;
  onPublish?: Function;
};

export type Subscription = {
  id: string;
  callback: Function;
};

// Async queue types
export type QState = {
  pending: number;
  running: number;
  resolved: number;
  rejected: number;
};

export type Queue = {
  push(...fns: Function[]): void;
  status: QState;
  reset(): void;
};

export type QueueConfig = {
  concurrent: number;
  onEvent?(result: Primitive, status: QState, type: 'resolve' | 'reject'): void;
};

// Event store types
export type SEvent = 'set' | 'update' | 'remove';
export type Store = {
  get: (path: string) => Primitive;
  set: (path: string, value: Primitive) => void;
  update: (path: string, fn: Function) => void;
  remove: (path: string) => void;
};

export type StoreConfig = {
  onEvent?: (event: SEvent, path: string, value?: Primitive) => void;
};
