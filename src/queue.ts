import { QState, Queue, QueueConfig, Primitive } from './types';

type Event = 'start' | 'resolve' | 'schedule';

// Reducer used to update the internal state
export function reduce(state: QState, action: Event): QState {
  let { running, pending } = state;

  switch (action) {
    case 'schedule':
      pending++;
      break;
    case 'start':
      running++;
      pending--;
      break;
    case 'resolve':
      running--;
      break;
  }

  return { running, pending };
}

export default function queue(config: QueueConfig): Queue {
  const _jobs: Function[] = [];
  let _active = config.instant;
  let _state: QState = { running: 0, pending: 0 };

  function startJob(): Promise<void> | undefined {
    if (!_active || _jobs.length === 0 || _state.running >= config.concurrent)
      return;

    const fn = _jobs.shift() as Function;
    _state = reduce(_state, 'start');
    // actually running the function/ promise
    fn()
      .then((r: Primitive) => r)
      .catch((e: Error) => e)
      .finally((v: Primitive) => {
        _state = reduce(_state, 'resolve');
        config.onResolve?.(v, _state);
        startJob();
      });
  }

  return {
    push(fn): void {
      _jobs.push(fn);
      _state = reduce(_state, 'schedule');
      // start new amount of jobs that are allowed
      const amount = config.concurrent - _state.running;
      for (let i = 0; i < amount; i++) startJob();
    },
    stop(): void {
      _active = false;
    },
    start(): void {
      _active = true;
      startJob();
    },
    get status(): QState {
      return _state;
    }
  };
}
