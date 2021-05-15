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
