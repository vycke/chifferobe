import emitter from '../src/emitter';
import { Emitter } from '../src/types';

describe('Even emitter', () => {
  let _emitter: Emitter;
  let fn: jest.Mock<unknown>;
  beforeEach(() => {
    _emitter = emitter();
    fn = jest.fn((x) => x);
    _emitter.on('success', fn);
    _emitter.on('success', fn);
  });

  afterEach(() => {
    _emitter.off('success', fn);
  });

  it('Standard events', () => {
    _emitter.emit('failed');
    _emitter.emit('success');
    expect(fn.mock.calls.length).toBe(2);
  });

  it('On and off', () => {
    const offFn = jest.fn((x) => x);
    _emitter.on('off', offFn);
    _emitter.off('success', offFn);
    _emitter.off('non-existing', offFn);
    _emitter.emit('off');
    expect(offFn.mock.calls.length).toBe(1);
    _emitter.off('off', offFn);
    expect(offFn.mock.calls.length).toBe(1);
  });

  it('Wildcard', () => {
    _emitter.on('*', fn);
    expect(fn.mock.calls.length).toBe(0);
    _emitter.emit('wildcard');
    expect(fn.mock.calls.length).toBe(1);
    _emitter.emit('*');
    expect(fn.mock.calls.length).toBe(2);
  });
});
