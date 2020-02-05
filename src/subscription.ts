import { Subscription } from './types';

// Helper for creating short unique IDs
export function createSubscription(callback: Function): Subscription {
  const id = 'xxxxxx'.replace(/[x]/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  );

  return { id, callback };
}
