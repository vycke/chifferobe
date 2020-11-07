// Generic types
export type Primitive = boolean | number | string | object | symbol;

export type Listener = {
  fn: Function;
  once: boolean;
};

// Emitter
export type Emitter = {
  on(topic: string, callback: Function, once?: boolean): void;
  off(topic: string, callback: Function): void;
  emit(topic: string, ...args: Primitive[]): void;
};

export type Channel = Emitter;

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
