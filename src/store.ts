import emitter from './emitter';
import { Store } from './types';

export default function store(init: Record<string, unknown>): Store {
  const _cache: Record<string, unknown> = init;
  const _emitter = emitter();

  return {
    on: _emitter.on,
    mutate(key, data): void {
      _cache[key] = data;
      _emitter.emit(key, data);
    },
    get(key, query): unknown {
      return query ? query(_cache[key]) : _cache[key];
    }
  };
}
