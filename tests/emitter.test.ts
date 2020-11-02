import emitter from '../src/emitter';

let fn;

describe('Even emitter', () => {
  let _emitter;
  beforeEach(() => {
    _emitter = emitter();
    fn = jest.fn((x) => x);
    _emitter.on('success', fn);
    _emitter.on('success', fn);
  });

  afterEach(() => {
    _emitter.off('success');
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

  it('once', () => {
    _emitter.on('success', fn, true);
    _emitter.on('single', fn, true);
    expect(fn.mock.calls.length).toBe(0);
    _emitter.emit('success');
    expect(fn.mock.calls.length).toBe(3);
    _emitter.emit('success');
    expect(fn.mock.calls.length).toBe(5);
  });
});
