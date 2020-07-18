// Generic types
export type Primitive = boolean | number | string | object | symbol;

type Callback = (...args: Primitive[]) => void;
type PublishFn = (message: string, ...args: Primitive[]) => void;

// Pub/Sub types
export type Channel = {
  subscribe(message: string, callback: Callback): Function;
  publish: PublishFn;
  delete(message: string): void;
};
export type PubSub = Channel;

export type ChannelConfig = { onPublish?: PublishFn };
export type PubSubConfig = ChannelConfig;

export type Subscription = {
  id: string;
  callback: Callback;
};

// Async queue types
export type QState = {
  pending: number;
  running: number;
  active: boolean;
};

export type Queue = {
  push(...fns: Function[]): void;
  status: QState;
  start(): void;
  stop(): void;
};

export type QueueConfig = {
  concurrent: number;
  instant: boolean;
  onResolve?(v: Primitive, status: QState): void;
};

// Event store types
export type Store = {
  get(path: string): Primitive;
  update(path: string, fn: Function): void;
  subscribe(path, callback: Callback): Function;
};

export type StoreConfig = {
  persist?: boolean;
  onUpdate?(path: string, value?: Primitive): void;
};
