import { QState, Queue, QueueConfig, Primitive } from './types';

const initialState: QState = {
  running: 0,
  pending: 0,
  resolved: 0,
  rejected: 0
};

type Event = 'start' | 'reject' | 'resolve' | 'schedule';

export function reduce(state: QState, action: Event): QState {
  let { running, pending, resolved, rejected } = state;

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
      resolved++;
      break;
    case 'reject':
      running--;
      rejected++;
      break;
  }

  return { running, pending, resolved, rejected };
}

export default function queue(config: QueueConfig): Queue {
  const _jobs: Function[] = [];
  let _active = config.instant;
  let _state: QState = initialState;

  function startJob(): Promise<void> | undefined {
    if (!_active || _jobs.length === 0 || _state.running >= config.concurrent)
      return;

    const fn = _jobs.shift() as Function;
    _state = reduce(_state, 'start');
    fn()
      .then((r: Primitive) => {
        _state = reduce(_state, 'resolve');
        config.onEvent?.(r, _state, 'resolve');
      })
      .catch((e: Error) => {
        _state = reduce(_state, 'reject');
        config.onEvent?.(e, _state, 'reject');
      })
      .finally(() => startJob());
  }

  return {
    push(fn): void {
      _jobs.push(fn);
      _state = reduce(_state, 'schedule');
      const amount = config.concurrent - _state.running;
      if (!_active) return;
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
