// Generic types
export type Primitive =
  | boolean
  | number
  | string
  | Record<string, unknown>
  | symbol;

export type Listener = (...args: Primitive[]) => void;

// Emitter
export type Emitter = {
  on(topic: string, callback: Listener): void;
  off(topic: string, callback: Listener): void;
  emit(topic: string, ...args: Primitive[]): void;
};

export type Channel = Emitter;

type Query<T> = (data: unknown) => T;

export type Store = {
  on(key: string, callback: Listener): void;
  off(key: string, callback: Listener): void;
  mutate(key: string, data: Primitive): void;
  get<T>(key: string, query?: Query<T>): Primitive | unknown;
};
