// Helper for creating short unique IDs
export function uuid(): string {
  return 'xxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
}

// deep freeze of objects
export function freeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(
    (prop) => !Object.isFrozen(obj[prop]) && freeze<object>(obj[prop])
  );

  return obj;
}

// object deep cloning
export function clone(obj: object): object {
  return JSON.parse(JSON.stringify(obj));
}
