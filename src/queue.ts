import { QState, Queue, QueueConfig, Primitive } from './types';

const initialState: QState = { pending: 0, resolved: 0, rejected: 0 };

type Event = 'start' | 'reject' | 'resolve';
export function reduce(state: QState, action: Event): QState {
  const { pending, resolved, rejected } = state;
  switch (action) {
    case 'start':
      return { ...state, pending: pending + 1 };
    case 'resolve':
      return { ...state, pending: pending - 1, resolved: resolved + 1 };
    case 'reject':
      return { ...state, pending: pending - 1, rejected: rejected + 1 };
  }
}

export default function queue(config: QueueConfig): Queue {
  const _jobs: Function[] = [];
  let _state: QState = initialState;

  function startJob(): Promise<void> | undefined {
    if (_jobs.length === 0 || _state.pending >= config.concurrent) return;

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
    push(...fns): void {
      _jobs.push(...fns);
      const amount = config.concurrent - _state.pending;
      for (let i = 0; i < amount; i++) startJob();
    },
    reset(): void {
      _state = initialState;
    },
    get status(): QState {
      return _state;
    }
  };
}
