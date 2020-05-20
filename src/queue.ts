import { QState, Queue, QueueConfig, Primitive } from './types';

const initialState: QState = {
  running: 0,
  pending: 0,
  resolved: 0,
  rejected: 0
};

type Event = 'start' | 'reject' | 'resolve' | 'schedule';
export function reduce(state: QState, action: Event): QState {
  const { running, pending, resolved, rejected } = state;
  switch (action) {
    case 'schedule':
      return { ...state, pending: pending + 1 };
    case 'start':
      return { ...state, running: running + 1, pending: pending - 1 };
    case 'resolve':
      return { ...state, running: running - 1, resolved: resolved + 1 };
    case 'reject':
      return { ...state, running: running - 1, rejected: rejected + 1 };
  }
}

export default function queue(config: QueueConfig): Queue {
  const _jobs: Function[] = [];
  let _active = true;
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
      _active = true;
      _jobs.push(fn);
      _state = reduce(_state, 'schedule');
      const amount = config.concurrent - _state.running;
      for (let i = 0; i < amount; i++) startJob();
    },
    reset(): void {
      _state = initialState;
    },
    stop(): void {
      _active = false;
    },
    get status(): QState {
      return _state;
    }
  };
}
