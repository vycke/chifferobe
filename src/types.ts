// Generic types
export type Primitive = boolean | number | string | object | symbol;

type CbFn = (data?: Primitive) => void;
type PublishCb = (message: string, ...args: Primitive[]) => void;

// Pub/Sub types
export type Channel = {
  subscribe(message: string, callback: CbFn): Function;
  publish: PublishCb;
  delete(message: string): void;
};

export type ChannelConfig = { onPublish?: PublishCb };
export type PubSubConfig = ChannelConfig;
export type PubSub = Channel;

export type Subscription = {
  id: string;
  callback: CbFn;
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
  stop(): void;
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
